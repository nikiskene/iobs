-- IOBS member email accounts. Run ONCE in the IOBS SQL Editor after review.
-- No mailbox is created, linked, deleted, or modified by this SQL.
begin;
-- Canonical people, not authentication IDs, own eligibility and mailboxes.
create table public.member_email_permissions (
 member_id uuid primary key references public.team_people(id) on delete restrict,
 email_creation_allowed boolean not null default false,
 updated_at timestamptz not null default now()
);
create table public.iobs_mailboxes (
 id uuid primary key default gen_random_uuid(),
 member_id uuid not null unique references public.team_people(id) on delete restrict,
 email_address text not null unique check(email_address=lower(email_address) and email_address ~ '^[a-z0-9]([a-z0-9.-]{0,62}[a-z0-9])?@iobs\.cc$'),
 migadu_mailbox_identifier text not null,
 linked_existing boolean not null default false,
 status text not null check(status in ('provisioning','active','disabled','missing','conflict','retryable','needs_review')),
 operation_id uuid not null default gen_random_uuid(),
 provider_create_started_at timestamptz,
 requested_by uuid references public.profiles(id),
 lease_token uuid,
 lease_until timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.member_email_rate_limits (member_id uuid not null references public.team_people(id),action text not null,window_start timestamptz not null,hits integer not null,primary key(member_id,action));
alter table public.member_email_permissions enable row level security;
alter table public.iobs_mailboxes enable row level security;
alter table public.member_email_rate_limits enable row level security;
create function public.email_is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=auth.uid() and is_active and role in ('admin','super_admin'));
$$;
create function public.email_owns_member(mid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join public.team_people t on t.id=p.member_id where p.id=auth.uid() and p.is_active and t.id=mid and t.merged_into is null);
$$;
revoke all on function public.email_is_admin(),public.email_owns_member(uuid) from public;
grant execute on function public.email_is_admin(),public.email_owns_member(uuid) to authenticated;
create policy email_permission_read on public.member_email_permissions for select to authenticated using(public.email_is_admin() or public.email_owns_member(member_id));
create policy email_mailbox_read on public.iobs_mailboxes for select to authenticated using(public.email_is_admin() or public.email_owns_member(member_id));
revoke all on public.member_email_permissions,public.iobs_mailboxes,public.member_email_rate_limits from public,anon,authenticated;
grant select on public.member_email_permissions to authenticated;
grant select(id,member_id,email_address,migadu_mailbox_identifier,linked_existing,status,created_at,updated_at) on public.iobs_mailboxes to authenticated;
grant all on public.member_email_permissions,public.iobs_mailboxes,public.member_email_rate_limits to service_role;
create function public.email_admin_set_eligibility(mid uuid,allowed boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.email_is_admin() then raise exception 'Administrator access required.' using errcode='42501'; end if;
 perform 1 from public.team_people where id=mid and merged_into is null for update;
 if not found then raise exception 'Member unavailable.'; end if;
 insert into public.member_email_permissions(member_id,email_creation_allowed) values(mid,allowed)
 on conflict(member_id) do update set email_creation_allowed=excluded.email_creation_allowed,updated_at=now();
 -- Eligibility revocation never deletes, suspends or changes a provider mailbox.
end $$;
revoke all on function public.email_admin_set_eligibility(uuid,boolean) from public;
grant execute on function public.email_admin_set_eligibility(uuid,boolean) to authenticated;
-- A durable rate limit applies across sessions and linked login accounts.
create function public.email_service_rate_limit(mid uuid,kind text,max_hits integer) returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 if kind not in ('availability','create','password','status','admin') or max_hits not between 1 and 60 then raise exception 'Invalid limit.'; end if;
 insert into public.member_email_rate_limits values(mid,kind,now(),1)
 on conflict(member_id,action) do update set hits=case when member_email_rate_limits.window_start<now()-interval '15 minutes' then 1 else member_email_rate_limits.hits+1 end,
 window_start=case when member_email_rate_limits.window_start<now()-interval '15 minutes' then now() else member_email_rate_limits.window_start end returning hits into n;
 return n<=max_hits;
end $$;
-- One row per person and one per address, including in-progress reservations.
create function public.email_service_reserve(actor uuid,local_name text) returns jsonb language plpgsql security definer set search_path='' as $$
declare mid uuid; r public.iobs_mailboxes; token uuid:=gen_random_uuid();
begin
 select p.member_id into mid from public.profiles p join public.team_people t on t.id=p.member_id where p.id=actor and p.is_active and t.merged_into is null;
 if mid is null then raise exception 'Active member required.' using errcode='42501'; end if;
 perform 1 from public.team_people where id=mid for update;
 if not exists(select 1 from public.member_email_permissions where member_id=mid and email_creation_allowed) then raise exception 'Email creation is not enabled.' using errcode='42501'; end if;
 if length(local_name) not between 1 and 64 or local_name !~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$' or position('..' in local_name)>0 or local_name=any(array['admin','administrator','support','security','postmaster','abuse','hello','info','contact','team','office','press','media','billing','finance','events','chapters','noreply','no-reply','root','hostmaster','webmaster','dmarc','mailer-daemon','niki']) then raise exception 'Choose a different email username.'; end if;
 select * into r from public.iobs_mailboxes where member_id=mid for update;
 if found then
  if r.status in ('active','disabled','missing') then raise exception 'This member already has an email account.'; end if;
  if r.lease_until>now() then raise exception 'An email operation is already running.' using errcode='55P03'; end if;
  if r.provider_create_started_at is not null or r.status='needs_review' then raise exception 'Mailbox needs verification before another creation attempt.'; end if;
  update public.iobs_mailboxes set email_address=local_name||'@iobs.cc',migadu_mailbox_identifier=local_name,status='provisioning',requested_by=actor,operation_id=gen_random_uuid(),lease_token=token,lease_until=now()+interval '2 minutes',updated_at=now() where id=r.id returning * into r;
 else
  insert into public.iobs_mailboxes(member_id,email_address,migadu_mailbox_identifier,status,lease_token,lease_until,requested_by) values(mid,local_name||'@iobs.cc',local_name,'provisioning',token,now()+interval '2 minutes',actor) returning * into r;
 end if;
 return to_jsonb(r);
end $$;
-- A fencing token ensures only the current worker can perform a provider mutation.
create function public.email_service_mark_creating(mailbox uuid,token uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.team_people t join public.iobs_mailboxes m on m.member_id=t.id where m.id=mailbox for update of t;
 update public.iobs_mailboxes m set provider_create_started_at=now(),updated_at=now() where id=mailbox and lease_token=token and lease_until>now() and status='provisioning' and provider_create_started_at is null and exists(select 1 from public.member_email_permissions e where e.member_id=m.member_id and e.email_creation_allowed) and exists(select 1 from public.profiles p where p.id=m.requested_by and p.member_id=m.member_id and p.is_active);
 if not found then raise exception 'Email operation expired. Verify the account before retrying.'; end if;
end $$;
create function public.email_service_finish(mailbox uuid,token uuid,new_status text) returns void language plpgsql security definer set search_path='' as $$
begin
 if new_status not in ('active','disabled','missing','conflict','retryable','needs_review','provisioning') then raise exception 'Invalid state.'; end if;
 update public.iobs_mailboxes set status=new_status,lease_token=null,lease_until=null,updated_at=now() where id=mailbox and lease_token=token
 and (new_status not in ('conflict','retryable') or provider_create_started_at is null);
 if not found then raise exception 'Email operation changed. Refresh and verify the account.'; end if;
end $$;
-- Linking and reconciliation are service-only; Edge verifies fresh admin auth and Migadu ownership.
create function public.email_service_link(mid uuid,address text,provider_id text,provider_status text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform 1 from public.team_people where id=mid and merged_into is null for update;
 if not found then raise exception 'Member unavailable.'; end if;
 if provider_status not in ('active','disabled') or address<>provider_id||'@iobs.cc' then raise exception 'Invalid mailbox.'; end if;
 insert into public.iobs_mailboxes(member_id,email_address,migadu_mailbox_identifier,status,linked_existing) values(mid,address,provider_id,provider_status,true) returning id into result;
 return result;
end $$;
create function public.email_service_lock(mailbox uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.iobs_mailboxes;
begin
 select * into r from public.iobs_mailboxes where id=mailbox for update;
 if not found then raise exception 'Mailbox unavailable.'; end if;
 if r.lease_until>now() then raise exception 'An email operation is already running.' using errcode='55P03'; end if;
 update public.iobs_mailboxes set lease_token=gen_random_uuid(),lease_until=now()+interval '2 minutes' where id=mailbox returning * into r;
 return to_jsonb(r);
end $$;
revoke all on function public.email_service_lock(uuid) from public,anon,authenticated;
grant execute on function public.email_service_lock(uuid) to service_role;
-- Refuse identity merges while either member has an email record. No silent ownership transfer.
create function public.email_guard_member_merge() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.merged_into is distinct from old.merged_into and new.merged_into is not null and exists(select 1 from public.iobs_mailboxes where member_id in (new.id,new.merged_into)) then raise exception 'Members with email account records cannot be combined. Resolve mailbox ownership with an administrator first.'; end if;
 return new;
end $$;
create trigger email_guard_member_merge before update of merged_into on public.team_people for each row execute function public.email_guard_member_merge();
revoke all on function public.email_guard_member_merge() from public,anon,authenticated;
revoke all on function public.email_service_rate_limit(uuid,text,integer),public.email_service_reserve(uuid,text),public.email_service_mark_creating(uuid,uuid),public.email_service_finish(uuid,uuid,text),public.email_service_link(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.email_service_rate_limit(uuid,text,integer),public.email_service_reserve(uuid,text),public.email_service_mark_creating(uuid,uuid),public.email_service_finish(uuid,uuid,text),public.email_service_link(uuid,text,text,text) to service_role;
-- Record this manual application so Supabase's GitHub integration does not replay it.
insert into supabase_migrations.schema_migrations(version,name,statements) values('20261021140000','member_email_accounts',array[]::text[]) on conflict(version) do nothing;
commit;
