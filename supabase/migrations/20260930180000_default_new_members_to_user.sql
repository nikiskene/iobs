-- Auth sign-up creates a linked member record through profile_member_identity().
-- Keep new accounts out of the Team category unless an administrator assigns a role.
alter table public.team_people
  alter column category set default 'user';
