-- Run in the IOBS Supabase SQL Editor. Existing member categories and permissions are preserved.
-- Add the member presentation category only. Chapter access remains assignment-based.
begin;
set local lock_timeout = '5s';
alter table public.team_people
  drop constraint if exists team_people_category_check,
  add constraint team_people_category_check
    check (category in ('founders', 'chapters', 'advisory_board', 'supporters', 'team', 'user'));
-- Record manual installation before this branch is merged to main.
insert into supabase_migrations.schema_migrations (version, name, statements)
values ('20261021160000', 'add_chapter_member_category', array[]::text[])
on conflict (version) do nothing;
commit;
