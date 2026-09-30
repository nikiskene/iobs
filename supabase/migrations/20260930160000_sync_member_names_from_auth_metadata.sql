-- Some pre-existing Auth users have their name in `name` or `display_name`
-- rather than `full_name`. The members dashboard reads the canonical person
-- record, so backfill only unnamed placeholder records and keep both models in sync.
with auth_names as (
  select u.id,
    coalesce(
      nullif(btrim(u.raw_user_meta_data->>'full_name'), ''),
      nullif(btrim(u.raw_user_meta_data->>'name'), ''),
      nullif(btrim(u.raw_user_meta_data->>'display_name'), ''),
      nullif(btrim(u.raw_user_meta_data->>'user_name'), '')
    ) as full_name
  from auth.users u
), missing_members as (
  select t.id, n.full_name
  from public.team_people t
  join public.profiles p on p.member_id = t.id
  join auth_names n on n.id = p.id
  where n.full_name is not null
    and (nullif(btrim(t.full_name), '') is null or btrim(t.full_name) = 'Member')
)
update public.team_people t
set full_name = m.full_name
from missing_members m
where t.id = m.id;

-- Keep the creation path aligned with the historical repair.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(btrim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'user_name'), ''),
      ''
    )
  );
  return new;
end;
$$;
