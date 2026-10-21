-- Run manually in the IOBS Supabase SQL Editor. Installs deletion capability; does not delete any Work items or documents.
-- Work item deletion is a separately granted capability; files and history remain intact.
begin;
set local lock_timeout = '5s';
create table if not exists public.work_item_deletion_admins (
  user_id uuid primary key references public.profiles(id) on delete cascade
);
alter table public.work_item_deletion_admins enable row level security;
revoke all on public.work_item_deletion_admins from public, anon, authenticated;
grant all on public.work_item_deletion_admins to service_role;

create or replace function public.can_delete_work_items()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    join public.work_item_deletion_admins a on a.user_id = p.id
    where p.id = auth.uid() and p.is_active and p.role = 'admin'
  );
$$;
revoke all on function public.can_delete_work_items() from public, anon;
grant execute on function public.can_delete_work_items() to authenticated;

alter table public.momentum_items
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

create or replace function public.guard_work_item_deletion()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (tg_op = 'INSERT' and (new.deleted_at is not null or new.deleted_by is not null))
    or (tg_op = 'UPDATE' and (new.deleted_at is distinct from old.deleted_at or new.deleted_by is distinct from old.deleted_by)) then
    if not public.can_delete_work_items() then
      raise exception 'Superadmin access is required to delete Work items.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.guard_work_item_deletion() from public, anon, authenticated;
drop trigger if exists guard_work_item_deletion on public.momentum_items;
create trigger guard_work_item_deletion before insert or update of deleted_at, deleted_by
  on public.momentum_items for each row execute function public.guard_work_item_deletion();

-- Restrictive policies also protect against pre-existing permissive policies.
drop policy if exists "work hides deleted items" on public.momentum_items;
create policy "work hides deleted items" on public.momentum_items as restrictive
  for select to authenticated using (deleted_at is null);
drop policy if exists "work preserves item files and history" on public.momentum_items;
create policy "work preserves item files and history" on public.momentum_items as restrictive
  for delete to authenticated using (false);

create or replace function public.delete_work_item(item_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.can_delete_work_items() then
    raise exception 'Superadmin access is required to delete Work items.' using errcode = '42501';
  end if;
  update public.momentum_items set deleted_at = now(), deleted_by = auth.uid()
  where id = item_id and deleted_at is null;
  if not found then
    raise exception 'This Work item has already been removed or is unavailable.' using errcode = 'P0002';
  end if;
end;
$$;
revoke all on function public.delete_work_item(uuid) from public, anon;
grant execute on function public.delete_work_item(uuid) to authenticated;
-- Enable the two existing active Admin accounts, as requested. New accounts do not inherit this capability.
insert into public.work_item_deletion_admins(user_id)
select id from public.profiles where role = 'admin' and is_active
on conflict (user_id) do nothing;
-- Record manual installation before merging the website update.
insert into supabase_migrations.schema_migrations(version,name,statements)
values ('20261021180000','work_item_deletion',array[]::text[])
on conflict(version) do nothing;
commit;
