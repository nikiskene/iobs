begin;

-- One canonical person, optionally associated with multiple existing login IDs.
-- Keep the public table name/API compatible with the deployed /team page.
alter table public.team_people
  add column location text not null default '',
  add column directory_public boolean not null default false,
  add column primary_profile_id uuid references public.profiles(id) on delete set null,
  add column merged_into uuid references public.team_people(id),
  add column updated_at timestamptz not null default now();
alter table public.profiles add column member_id uuid references public.team_people(id);

-- Preserve the original values for support/reversal; no browser role can read these.
create table public.member_consolidation_backup (
  source text not null,
  id uuid not null,
  record jsonb not null,
  created_at timestamptz not null default now(),
  primary key (source, id)
);
alter table public.member_consolidation_backup enable row level security;
revoke all on public.member_consolidation_backup from public, anon, authenticated;
insert into public.member_consolidation_backup (source,id,record)
select 'profiles',id,to_jsonb(p) from public.profiles p
union all select 'team_people',id,to_jsonb(t) from public.team_people t;

-- Match only the IDs copied by the earlier migration. Never guess from a name.
update public.team_people t set primary_profile_id=p.id,
  location=coalesce(p.location,''), directory_public=p.is_public
from public.profiles p where p.id=t.id;
insert into public.team_people
  (id,full_name,category,status,title,description,photo_url,linkedin_url,sort_order,location,directory_public,primary_profile_id)
select p.id,coalesce(nullif(btrim(p.full_name),''),'Member'),'team','draft',
  coalesce(p.team_role,''),coalesce(p.bio,''),
  case when p.photo_url ~* '^https?://' then p.photo_url else '' end,
  case when p.linkedin_url ~* '^https?://' then p.linkedin_url else '' end,
  coalesce(p.team_sort_order,0),coalesce(p.location,''),p.is_public,p.id
from public.profiles p where not exists (select 1 from public.team_people t where t.id=p.id);
update public.profiles set member_id=id;
alter table public.profiles alter column member_id set not null;
create index profiles_member_id_idx on public.profiles(member_id);

-- Existing public editorial details win; account identity and history are untouched.
update public.profiles p set full_name=t.full_name,photo_url=t.photo_url,
  linkedin_url=t.linkedin_url,bio=t.description,team_role=t.title,team_sort_order=t.sort_order
from public.team_people t where p.member_id=t.id;

create function public.member_touch() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=clock_timestamp(); return new; end;
$$;
create trigger member_touch before update on public.team_people
for each row execute function public.member_touch();

-- Keep existing profile consumers as projections of the canonical person.
create function public.member_to_profiles() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  update public.profiles set full_name=new.full_name,photo_url=new.photo_url,
    linkedin_url=new.linkedin_url,bio=new.description,team_role=new.title,
    team_sort_order=new.sort_order,location=new.location,is_public=new.directory_public,
    updated_at=now()
  where member_id=new.id and row(full_name,photo_url,linkedin_url,bio,team_role,team_sort_order,location,is_public)
    is distinct from row(new.full_name,new.photo_url,new.linkedin_url,new.description,new.title,new.sort_order,new.location,new.directory_public);
  return new;
end;
$$;
create trigger member_to_profiles after update on public.team_people
for each row execute function public.member_to_profiles();

create function public.profile_member_identity() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='INSERT' then
    -- Account creation always gets a fresh person, never a name-based auto-link.
    if new.member_id is not null then
      raise exception 'Link accounts through member management.' using errcode='42501';
    end if;
    new.member_id=new.id;
    insert into public.team_people(id,full_name,status,title,description,photo_url,linkedin_url,location,directory_public)
    values(new.id,coalesce(nullif(btrim(new.full_name),''),'Member'),'draft',coalesce(new.team_role,''),coalesce(new.bio,''),
      case when new.photo_url ~* '^https?://' then new.photo_url else '' end,
      case when new.linkedin_url ~* '^https?://' then new.linkedin_url else '' end,
      coalesce(new.location,''),new.is_public);
  elsif new.member_id is distinct from old.member_id and not public.is_admin((select auth.uid())) then
    raise exception 'Only administrators can link accounts.' using errcode='42501';
  end if;
  return new;
end;
$$;
create trigger profile_member_identity before insert or update of member_id on public.profiles
for each row execute function public.profile_member_identity();

-- Self-service profile edits write through to the same person and other linked logins.
create function public.profile_to_member() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='INSERT' then
    update public.team_people set primary_profile_id=new.id where id=new.member_id;
    return new;
  end if;
  if pg_trigger_depth()>1 then return new; end if;
  if row(new.full_name,new.photo_url,new.linkedin_url,new.bio,new.team_role,new.team_sort_order,new.location,new.is_public)
    is distinct from row(old.full_name,old.photo_url,old.linkedin_url,old.bio,old.team_role,old.team_sort_order,old.location,old.is_public) then
    update public.team_people set full_name=coalesce(nullif(btrim(new.full_name),''),'Member'),
      photo_url=coalesce(new.photo_url,''),linkedin_url=coalesce(new.linkedin_url,''),description=coalesce(new.bio,''),
      title=coalesce(new.team_role,''),sort_order=coalesce(new.team_sort_order,0),location=coalesce(new.location,''),directory_public=new.is_public
    where id=new.member_id and merged_into is null;
  elsif row(new.role,new.is_team_member,new.is_active) is distinct from row(old.role,old.is_team_member,old.is_active) then
    update public.team_people set updated_at=clock_timestamp() where id=new.member_id;
  end if;
  return new;
end;
$$;
create trigger profile_to_member after insert or update on public.profiles
for each row execute function public.profile_to_member();

create function public.admin_list_members() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_admin((select auth.uid())) then raise exception 'Administrator access required.' using errcode='42501'; end if;
  return coalesce((select jsonb_agg(to_jsonb(t)||jsonb_build_object('accounts',
    coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'email',u.email,'profile_name',p.profile_name,
      'role',p.role,'is_team_member',p.is_team_member,'is_active',p.is_active) order by p.created_at)
      from public.profiles p join auth.users u on u.id=p.id where p.member_id=t.id),'[]'::jsonb)) order by t.full_name)
    from public.team_people t where t.merged_into is null),'[]'::jsonb);
end;
$$;

create function public.admin_save_member(p_member jsonb,p_accounts jsonb default '[]'::jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare
  member_uuid uuid := (p_member->>'id')::uuid;
  primary_uuid uuid := nullif(p_member->>'primary_profile_id','')::uuid;
  existing public.team_people;
  account jsonb;
  account_row public.profiles;
begin
  if not public.is_admin((select auth.uid())) then raise exception 'Administrator access required.' using errcode='42501'; end if;
  select * into existing from public.team_people where id=member_uuid for update;
  if found then
    if existing.merged_into is not null then raise exception 'This member has already been combined. Refresh the list.'; end if;
    if existing.updated_at is distinct from (p_member->>'updated_at')::timestamptz then
      raise exception 'This member changed while you were editing. Reopen the member and try again.';
    end if;
  elsif p_member->>'updated_at' is not null then
    raise exception 'Member no longer exists. Refresh the list.';
  end if;
  if primary_uuid is not null and not exists(select 1 from public.profiles where id=primary_uuid and member_id=member_uuid) then
    raise exception 'Choose a login belonging to this member.';
  end if;
  if primary_uuid is null and exists(select 1 from public.profiles where member_id=member_uuid) then
    raise exception 'Choose a primary login.';
  end if;
  insert into public.team_people(id,full_name,category,status,title,description,photo_url,linkedin_url,substack_url,
    sort_order,location,directory_public,primary_profile_id)
  values(member_uuid,btrim(p_member->>'full_name'),p_member->>'category',p_member->>'status',
    coalesce(p_member->>'title',''),coalesce(p_member->>'description',''),coalesce(p_member->>'photo_url',''),
    coalesce(p_member->>'linkedin_url',''),coalesce(p_member->>'substack_url',''),(p_member->>'sort_order')::integer,
    coalesce(p_member->>'location',''),coalesce((p_member->>'directory_public')::boolean,false),primary_uuid)
  on conflict(id) do update set full_name=excluded.full_name,category=excluded.category,status=excluded.status,
    title=excluded.title,description=excluded.description,photo_url=excluded.photo_url,linkedin_url=excluded.linkedin_url,
    substack_url=excluded.substack_url,sort_order=excluded.sort_order,location=excluded.location,
    directory_public=excluded.directory_public,primary_profile_id=excluded.primary_profile_id;
  for account in select * from jsonb_array_elements(p_accounts) loop
    select * into account_row from public.profiles where id=(account->>'id')::uuid and member_id=member_uuid for update;
    if not found then raise exception 'A login does not belong to this member.'; end if;
    if account_row.id=(select auth.uid()) and (account->>'role'<>'admin' or not (account->>'is_active')::boolean) then
      raise exception 'You cannot remove your own administrator access.';
    end if;
    update public.profiles set role=account->>'role',is_team_member=(account->>'is_team_member')::boolean,
      is_active=(account->>'is_active')::boolean,updated_at=now() where id=account_row.id;
  end loop;
  return member_uuid;
end;
$$;

-- Combining people keeps both original login IDs and all their foreign-key history.
-- Keep the destination's public details; retain the source as an internal archive.
create function public.admin_combine_members(p_target uuid,p_source uuid) returns void
language plpgsql security definer set search_path='' as $$
declare target public.team_people; source public.team_people;
begin
  if not public.is_admin((select auth.uid())) then raise exception 'Administrator access required.' using errcode='42501'; end if;
  if p_target=p_source then raise exception 'Choose a different member.'; end if;
  perform 1 from public.team_people where id in(p_target,p_source) order by id for update;
  select * into target from public.team_people where id=p_target and merged_into is null;
  if not found then raise exception 'Destination member is unavailable.'; end if;
  select * into source from public.team_people where id=p_source and merged_into is null;
  if not found then raise exception 'Source member is unavailable.'; end if;
  update public.profiles set member_id=p_target where member_id=p_source;
  update public.team_people set primary_profile_id=coalesce(target.primary_profile_id,source.primary_profile_id),
    title=coalesce(nullif(target.title,''),source.title),description=coalesce(nullif(target.description,''),source.description),
    photo_url=coalesce(nullif(target.photo_url,''),source.photo_url),linkedin_url=coalesce(nullif(target.linkedin_url,''),source.linkedin_url),
    substack_url=coalesce(nullif(target.substack_url,''),source.substack_url),location=coalesce(nullif(target.location,''),source.location)
  where id=p_target;
  update public.team_people set status='archived',merged_into=p_target,primary_profile_id=null where id=p_source;
end;
$$;

-- Dietmar Dahmen currently has two real login profiles. Consolidate their
-- shared person record while retaining both login IDs and all linked history.
-- The public Founder record remains the canonical member entry.
-- The existing profile guard checks the authenticated caller, so run this
-- audited migration step in the context of the existing administrator.
select set_config('request.jwt.claim.sub', '872c29d5-6581-4dc8-ac08-441d1c3c06fc', true);

update public.profiles
set member_id = '2d3ad8f1-5ff3-408a-8dfb-7ad7681250a7'
where member_id = 'b3cc5ebd-60a1-4019-a86f-f3478f10c40c';

update public.team_people
set primary_profile_id = '2d3ad8f1-5ff3-408a-8dfb-7ad7681250a7',
  title = coalesce(nullif(title, ''), 'Co-Founder'),
  merged_into = null
where id = '2d3ad8f1-5ff3-408a-8dfb-7ad7681250a7';

update public.team_people
set status = 'archived',
  merged_into = '2d3ad8f1-5ff3-408a-8dfb-7ad7681250a7',
  primary_profile_id = null
where id = 'b3cc5ebd-60a1-4019-a86f-f3478f10c40c';

select set_config('request.jwt.claim.sub', '', true);

-- Only the controlled RPCs may change account links, primary login or merge state.
revoke insert,update,delete on public.team_people from authenticated;
revoke all on function public.member_touch(),public.member_to_profiles(),public.profile_member_identity(),public.profile_to_member() from public,anon,authenticated;
revoke all on function public.admin_list_members(),public.admin_save_member(jsonb,jsonb),public.admin_combine_members(uuid,uuid) from public,anon;
grant execute on function public.admin_list_members(),public.admin_save_member(jsonb,jsonb),public.admin_combine_members(uuid,uuid) to authenticated;

-- One public directory card per person. Existing individual profile URLs remain valid
-- through member_profile_directory, which contains the linked account aliases.
create view public.member_profile_directory with(security_barrier=true) as
select p.id,p.profile_name,t.full_name,t.photo_url,t.linkedin_url,t.location,p.city,t.location as location_label,
  t.description as bio,t.title as team_role,p.is_team_member
from public.profiles p join public.team_people t on t.id=p.member_id
where p.is_active and t.directory_public and t.merged_into is null;
revoke all on public.member_profile_directory from public;
grant select on public.member_profile_directory to anon,authenticated;
create or replace view public.member_directory with(security_barrier=true) as
select d.* from public.member_profile_directory d
join public.profiles p on p.id=d.id
join public.team_people t on t.id=p.member_id
where d.id=coalesce(
  (select p2.id from public.profiles p2 where p2.id=t.primary_profile_id and p2.is_active),
  (select p2.id from public.profiles p2 where p2.member_id=t.id and p2.is_active order by p2.created_at,p2.id limit 1));

notify pgrst,'reload schema';
commit;
