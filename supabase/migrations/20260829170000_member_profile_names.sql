-- Stable, unique member URLs for /members/:profile_name.
-- Application route changes must only ship after this migration is applied.

begin;

alter table public.profiles
  add column if not exists profile_name text;

-- Convert a name or requested profile name into a compact URL identifier.
-- The product default is firstnamelastname, with no spaces or punctuation.
create or replace function public.normalize_profile_name(value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select nullif(regexp_replace(lower(value), '[^a-z0-9]+', '', 'g'), '');
$$;

revoke all on function public.normalize_profile_name(text) from public, anon, authenticated;

-- Existing profiles receive deterministic names. Duplicate names are suffixed
-- in creation order: janedoe, janedoe2, janedoe3, and so on.
with normalized as (
  select
    id,
    coalesce(public.normalize_profile_name(full_name), 'member') as base_name,
    row_number() over (
      partition by coalesce(public.normalize_profile_name(full_name), 'member')
      order by created_at nulls last, id
    ) as duplicate_number
  from public.profiles
  where profile_name is null or btrim(profile_name) = ''
), assigned as (
  select
    id,
    base_name || case when duplicate_number = 1 then '' else duplicate_number::text end as profile_name
  from normalized
)
update public.profiles p
set profile_name = assigned.profile_name
from assigned
where p.id = assigned.id;

alter table public.profiles
  alter column profile_name set not null;

alter table public.profiles
  drop constraint if exists profiles_profile_name_format;
alter table public.profiles
  add constraint profiles_profile_name_format
  check (profile_name ~ '^[a-z0-9]{3,60}$');

create unique index if not exists profiles_profile_name_unique_idx
  on public.profiles (profile_name);

-- New profiles automatically receive the first available default. A user who
-- explicitly chooses a profile name gets a clear uniqueness error instead of
-- silently receiving a different public URL.
create or replace function public.ensure_unique_profile_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_name text;
  candidate text;
  suffix integer := 1;
begin
  if tg_op = 'UPDATE' and new.profile_name is not distinct from old.profile_name then
    return new;
  end if;

  if new.profile_name is not null and btrim(new.profile_name) <> '' then
    candidate := public.normalize_profile_name(new.profile_name);
    if candidate is null or char_length(candidate) < 3 or char_length(candidate) > 60 then
      raise exception 'Profile name must contain 3 to 60 letters or numbers.'
        using errcode = '22023';
    end if;

    if exists (
      select 1 from public.profiles p
      where p.profile_name = candidate and p.id <> new.id
    ) then
      raise exception 'That profile name is already in use.'
        using errcode = '23505';
    end if;

    new.profile_name := candidate;
    return new;
  end if;

  base_name := coalesce(public.normalize_profile_name(new.full_name), 'member');
  candidate := base_name;

  while exists (select 1 from public.profiles p where p.profile_name = candidate) loop
    suffix := suffix + 1;
    candidate := left(base_name, 60 - char_length(suffix::text)) || suffix::text;
  end loop;

  new.profile_name := candidate;
  return new;
end;
$$;

revoke all on function public.ensure_unique_profile_name() from public, anon, authenticated;

drop trigger if exists ensure_unique_profile_name on public.profiles;
create trigger ensure_unique_profile_name
before insert or update of profile_name on public.profiles
for each row execute function public.ensure_unique_profile_name();

-- A deliberately limited public projection prevents the member directory from
-- exposing private profile columns such as email or access roles.
create or replace view public.member_directory
with (security_barrier = true)
as
select
  id,
  profile_name,
  full_name,
  photo_url,
  linkedin_url,
  location,
  city,
  location_label,
  bio,
  team_role,
  is_team_member
from public.profiles
where coalesce(is_active, true)
  and coalesce(is_public, false);

revoke all on public.member_directory from public;
grant select on public.member_directory to anon, authenticated;

comment on column public.profiles.profile_name is
  'Unique URL identifier used by /members/:profile_name.';
comment on view public.member_directory is
  'Public-safe projection of active profiles that opted into public visibility.';

commit;
