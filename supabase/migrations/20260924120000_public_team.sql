begin;

-- Public editorial entries are independent of authentication and workspace roles.
create table public.team_people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(btrim(full_name)) between 1 and 160),
  category text not null default 'team' check (category in ('founders', 'team', 'supporters', 'advisory_board')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  title text not null default '',
  description text not null default '',
  photo_url text not null default '',
  linkedin_url text not null default '',
  substack_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint team_photo_url check (photo_url = '' or photo_url ~* '^https?://'),
  constraint team_linkedin_url check (linkedin_url = '' or linkedin_url ~* '^https?://'),
  constraint team_substack_url check (substack_url = '' or substack_url ~* '^https?://')
);
alter table public.team_people enable row level security;
grant select on public.team_people to anon, authenticated;
grant insert, update, delete on public.team_people to authenticated;
create policy "Published people are public" on public.team_people for select to anon, authenticated
  using (status = 'published');
create policy "Administrators manage people" on public.team_people for all to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

-- Preserve public visibility for existing active team profiles that opted in.
-- Private profiles remain drafts; category defaults to Team without guessing roles.
insert into public.team_people (id, full_name, title, description, photo_url, linkedin_url, sort_order, status)
select id, coalesce(nullif(btrim(full_name), ''), 'Team member'),
  coalesce(team_role, ''), coalesce(bio, ''),
  case when photo_url ~* '^https?://' then photo_url else '' end,
  case when linkedin_url ~* '^https?://' then linkedin_url else '' end,
  coalesce(team_sort_order, 0),
  case when is_public = true then 'published' else 'draft' end
from public.profiles where is_team_member = true and is_active = true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-photos', 'team-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);
create policy "Administrators upload team photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'team-photos' and public.is_admin((select auth.uid())));
create policy "Administrators delete team photos" on storage.objects for delete to authenticated
  using (bucket_id = 'team-photos' and public.is_admin((select auth.uid())));
create policy "Administrators read team photo records" on storage.objects for select to authenticated
  using (bucket_id = 'team-photos' and public.is_admin((select auth.uid())));
commit;
