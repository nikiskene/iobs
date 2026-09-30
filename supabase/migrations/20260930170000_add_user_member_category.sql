alter table public.team_people
  drop constraint if exists team_people_category_check;

alter table public.team_people
  add constraint team_people_category_check
  check (category in ('founders', 'team', 'user', 'supporters', 'advisory_board'));
