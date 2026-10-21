-- BEAU is opt-in by explicit Admin approval, including for Admin chat access.
begin;
set local lock_timeout='5s';
create table public.beau_member_access (
 member_id uuid primary key references public.team_people(id) on delete cascade,
 enabled boolean not null default false,
 approved_by uuid references public.profiles(id) on delete set null,
 updated_at timestamptz not null default now()
);
alter table public.beau_member_access enable row level security;
revoke all on public.beau_member_access from public,anon,authenticated;
grant all on public.beau_member_access to service_role;
-- No existing members are implicitly approved. Absence of an approval means OFF.
create or replace function public.beau_active_member(actor uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join public.beau_member_access a on a.member_id=p.member_id where p.id=actor and p.is_active and a.enabled);
$$;
create or replace function public.has_beau_access() returns boolean language sql stable security definer set search_path='' as $$
 select public.beau_active_member(auth.uid());
$$;
create or replace function public.admin_get_beau_access(p_member_id uuid) returns boolean language plpgsql stable security definer set search_path='' as $$
begin
 if not public.beau_admin(auth.uid()) then raise exception 'Admin access required.' using errcode='42501'; end if;
 return coalesce((select enabled from public.beau_member_access where member_id=p_member_id),false);
end $$;
create or replace function public.admin_set_beau_access(p_member_id uuid,p_enabled boolean) returns boolean language plpgsql security definer set search_path='' as $$
begin
 if not public.beau_admin(auth.uid()) then raise exception 'Admin access required.' using errcode='42501'; end if;
 if p_enabled is null then raise exception 'Choose an access setting.'; end if;
 perform 1 from public.team_people where id=p_member_id and merged_into is null for update;
 if not found then raise exception 'Member unavailable.' using errcode='42501'; end if;
 insert into public.beau_member_access(member_id,enabled,approved_by) values(p_member_id,p_enabled,auth.uid())
 on conflict(member_id) do update set enabled=excluded.enabled,approved_by=excluded.approved_by,updated_at=now();
 insert into public.beau_audit(actor_id,action,entity_id) values(auth.uid(),case when p_enabled then 'access.approve' else 'access.revoke' end,p_member_id);
 return p_enabled;
end $$;
create trigger beau_member_access_invalidate after insert or update or delete on public.beau_member_access for each statement execute function public.beau_invalidate();
revoke all on function public.has_beau_access(),public.admin_get_beau_access(uuid),public.admin_set_beau_access(uuid,boolean) from public,anon,authenticated;
grant execute on function public.has_beau_access(),public.admin_get_beau_access(uuid),public.admin_set_beau_access(uuid,boolean) to authenticated,service_role;
-- Existing private-chat RLS, retrieval, cache, turn and budget functions use beau_active_member.
commit;
