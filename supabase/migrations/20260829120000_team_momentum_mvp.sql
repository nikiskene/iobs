-- IOBS Team / Momentum MVP
--
-- Reuses public.profiles as the identity source. A signed-in user has Team
-- access when their active profile is either an admin or is_team_member.
-- FACT is a terminal status on momentum_items so the original item and its
-- history stay together.

begin;

-- The application already uses this column. Keep the migration safe for an
-- older database that has profiles but predates team membership.
alter table public.profiles
  add column if not exists is_team_member boolean not null default false;

-- Central server-side access check used by RLS and later by the /team route.
create or replace function public.has_team_momentum_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and coalesce(p.is_active, true)
      and (p.role = 'admin' or p.is_team_member)
  );
$$;

revoke all on function public.has_team_momentum_access() from public;
revoke all on function public.has_team_momentum_access() from anon;
grant execute on function public.has_team_momentum_access() to authenticated;

-- Prevent a normal user from granting themselves Team or admin access through
-- the existing "update own profile" policy. Admins retain profile management.
create or replace function public.protect_profile_access_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_is_admin boolean;
begin
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and coalesce(p.is_active, true)
  ) into caller_is_admin;

  if tg_op = 'INSERT' then
    if (
      coalesce(new.role, 'explorer') <> 'explorer'
      or coalesce(new.is_team_member, false)
      or not coalesce(new.is_active, true)
    ) and not caller_is_admin then
      raise exception 'Only an admin can set profile access fields.'
        using errcode = '42501';
    end if;
  elsif (
    new.role is distinct from old.role
    or new.is_team_member is distinct from old.is_team_member
    or new.is_active is distinct from old.is_active
  ) and not caller_is_admin then
    raise exception 'Only an admin can change profile access fields.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_profile_access_fields() from public;
revoke all on function public.protect_profile_access_fields() from anon, authenticated;

drop trigger if exists protect_profile_access_fields on public.profiles;
create trigger protect_profile_access_fields
before insert or update on public.profiles
for each row execute function public.protect_profile_access_fields();

create table if not exists public.momentum_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 240),
  description text check (description is null or char_length(description) <= 5000),
  owner_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pushing'
    check (status in ('pushing', 'waiting', 'stuck', 'fact')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  target_date date,
  next_move text check (next_move is null or char_length(next_move) <= 1000),
  waiting_on text check (waiting_on is null or char_length(waiting_on) <= 1000),
  waiting_since timestamptz,
  stuck_reason text check (stuck_reason is null or char_length(stuck_reason) <= 1000),
  intervention_needed text
    check (intervention_needed is null or char_length(intervention_needed) <= 1000),
  category text check (category is null or char_length(category) <= 100),
  fact_summary text check (fact_summary is null or char_length(fact_summary) <= 1000),
  created_by uuid references public.profiles(id) on delete set null,
  completed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint momentum_fact_completion_consistent check (
    (status = 'fact' and completed_at is not null)
    or (status <> 'fact' and completed_at is null)
  )
);

create index if not exists momentum_items_status_idx
  on public.momentum_items (status);
create index if not exists momentum_items_owner_status_idx
  on public.momentum_items (owner_user_id, status);
create index if not exists momentum_items_target_date_idx
  on public.momentum_items (target_date) where target_date is not null;
create index if not exists momentum_items_completed_at_idx
  on public.momentum_items (completed_at desc) where completed_at is not null;
create index if not exists momentum_items_waiting_since_idx
  on public.momentum_items (waiting_since) where status = 'waiting';

create table if not exists public.momentum_activity (
  id bigint generated always as identity primary key,
  momentum_item_id uuid not null references public.momentum_items(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('created', 'updated', 'status_changed', 'became_fact')),
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists momentum_activity_item_created_idx
  on public.momentum_activity (momentum_item_id, created_at desc);
create index if not exists momentum_activity_actor_created_idx
  on public.momentum_activity (actor_user_id, created_at desc);

-- Own all lifecycle timestamps in the database so direct API writes behave the
-- same as application writes.
create or replace function public.prepare_momentum_item()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.title := btrim(new.title);
  new.updated_at := now();

  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, (select auth.uid()));
    new.created_at := coalesce(new.created_at, now());
  else
    -- Creation attribution is immutable.
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;

  if new.status = 'waiting' then
    if tg_op = 'INSERT' or old.status is distinct from 'waiting' then
      new.waiting_since := coalesce(new.waiting_since, now());
    end if;
  else
    new.waiting_since := null;
  end if;

  if new.status = 'fact' then
    if tg_op = 'INSERT' or old.status is distinct from 'fact' then
      new.completed_at := now();
      new.completed_by := (select auth.uid());
    else
      new.completed_at := old.completed_at;
      new.completed_by := old.completed_by;
    end if;
  else
    new.completed_at := null;
    new.completed_by := null;
  end if;

  return new;
end;
$$;

revoke all on function public.prepare_momentum_item() from public;
revoke all on function public.prepare_momentum_item() from anon, authenticated;

drop trigger if exists prepare_momentum_item on public.momentum_items;
create trigger prepare_momentum_item
before insert or update on public.momentum_items
for each row execute function public.prepare_momentum_item();

-- Lightweight, automatic history. The app never needs permission to forge or
-- rewrite activity rows.
create or replace function public.log_momentum_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  activity_action text;
  activity_changes jsonb;
begin
  if tg_op = 'INSERT' then
    activity_action := case when new.status = 'fact' then 'became_fact' else 'created' end;
    activity_changes := jsonb_build_object(
      'title', new.title,
      'owner_user_id', new.owner_user_id,
      'status', new.status,
      'next_move', new.next_move,
      'waiting_on', new.waiting_on,
      'category', new.category,
      'target_date', new.target_date,
      'fact_summary', new.fact_summary
    );
  else
    activity_action := case
      when new.status = 'fact' and old.status <> 'fact' then 'became_fact'
      when new.status is distinct from old.status then 'status_changed'
      else 'updated'
    end;
    activity_changes := jsonb_strip_nulls(jsonb_build_object(
      'title', case when new.title is distinct from old.title
        then jsonb_build_object('from', old.title, 'to', new.title) end,
      'owner_user_id', case when new.owner_user_id is distinct from old.owner_user_id
        then jsonb_build_object('from', old.owner_user_id, 'to', new.owner_user_id) end,
      'status', case when new.status is distinct from old.status
        then jsonb_build_object('from', old.status, 'to', new.status) end,
      'priority', case when new.priority is distinct from old.priority
        then jsonb_build_object('from', old.priority, 'to', new.priority) end,
      'target_date', case when new.target_date is distinct from old.target_date
        then jsonb_build_object('from', old.target_date, 'to', new.target_date) end,
      'next_move', case when new.next_move is distinct from old.next_move
        then jsonb_build_object('from', old.next_move, 'to', new.next_move) end,
      'waiting_on', case when new.waiting_on is distinct from old.waiting_on
        then jsonb_build_object('from', old.waiting_on, 'to', new.waiting_on) end,
      'stuck_reason', case when new.stuck_reason is distinct from old.stuck_reason
        then jsonb_build_object('from', old.stuck_reason, 'to', new.stuck_reason) end,
      'intervention_needed', case when new.intervention_needed is distinct from old.intervention_needed
        then jsonb_build_object('from', old.intervention_needed, 'to', new.intervention_needed) end,
      'category', case when new.category is distinct from old.category
        then jsonb_build_object('from', old.category, 'to', new.category) end,
      'fact_summary', case when new.fact_summary is distinct from old.fact_summary
        then jsonb_build_object('from', old.fact_summary, 'to', new.fact_summary) end
    ));
  end if;

  insert into public.momentum_activity (
    momentum_item_id,
    actor_user_id,
    action,
    changes
  ) values (
    new.id,
    (select auth.uid()),
    activity_action,
    activity_changes
  );

  return new;
end;
$$;

revoke all on function public.log_momentum_activity() from public;
revoke all on function public.log_momentum_activity() from anon, authenticated;

drop trigger if exists log_momentum_activity on public.momentum_items;
create trigger log_momentum_activity
after insert or update on public.momentum_items
for each row execute function public.log_momentum_activity();

alter table public.momentum_items enable row level security;
alter table public.momentum_activity enable row level security;

drop policy if exists "team reads momentum items" on public.momentum_items;
create policy "team reads momentum items"
  on public.momentum_items for select to authenticated
  using (public.has_team_momentum_access());

drop policy if exists "team creates momentum items" on public.momentum_items;
create policy "team creates momentum items"
  on public.momentum_items for insert to authenticated
  with check (
    public.has_team_momentum_access()
    and (created_by is null or created_by = (select auth.uid()))
  );

drop policy if exists "team updates momentum items" on public.momentum_items;
create policy "team updates momentum items"
  on public.momentum_items for update to authenticated
  using (public.has_team_momentum_access())
  with check (public.has_team_momentum_access());

drop policy if exists "admins delete momentum items" on public.momentum_items;
create policy "admins delete momentum items"
  on public.momentum_items for delete to authenticated
  using (public.is_admin((select auth.uid())));

drop policy if exists "team reads momentum activity" on public.momentum_activity;
create policy "team reads momentum activity"
  on public.momentum_activity for select to authenticated
  using (public.has_team_momentum_access());

-- Table grants and RLS are both required. Activity writes happen only through
-- the trusted trigger above.
revoke all on public.momentum_items from anon, authenticated;
grant select, insert, update on public.momentum_items to authenticated;
grant delete on public.momentum_items to authenticated;

revoke all on public.momentum_activity from anon, authenticated;
grant select on public.momentum_activity to authenticated;

comment on function public.has_team_momentum_access() is
  'True for active IOBS admins and active profiles with is_team_member enabled.';
comment on column public.profiles.is_team_member is
  'Grants IOBS Team / Momentum access; admins have access regardless of this value.';
comment on table public.momentum_items is
  'IOBS outcomes in progress. FACT is a final status that preserves the original item.';
comment on table public.momentum_activity is
  'Trigger-generated lightweight history for momentum item changes.';

commit;
