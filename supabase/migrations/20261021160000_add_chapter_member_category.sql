-- Add the member presentation category only. Chapter access remains assignment-based.
begin;
set local lock_timeout = '5s';
alter table public.team_people
  drop constraint if exists team_people_category_check,
  add constraint team_people_category_check
    check (category in ('founders', 'chapters', 'advisory_board', 'supporters', 'team', 'user'));
commit;
