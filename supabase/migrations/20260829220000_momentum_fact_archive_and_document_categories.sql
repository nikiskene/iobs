-- Add reversible FACT archiving and a single required repository category.

begin;

alter table public.momentum_items
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id) on delete set null;

alter table public.momentum_items
  drop constraint if exists momentum_fact_archive_consistent,
  add constraint momentum_fact_archive_consistent
    check (archived_at is null or status = 'fact');

create index if not exists momentum_items_archived_facts_idx
  on public.momentum_items (archived_at desc)
  where archived_at is not null;

create or replace function public.prepare_momentum_fact_archive()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.archived_at is distinct from old.archived_at then
    if new.archived_at is not null then
      if new.status <> 'fact' then
        raise exception 'Only FACT items can be archived.' using errcode = '23514';
      end if;
      new.archived_at := now();
      new.archived_by := (select auth.uid());
    else
      new.archived_by := null;
    end if;
  else
    new.archived_by := old.archived_by;
  end if;
  return new;
end;
$$;

revoke all on function public.prepare_momentum_fact_archive() from public, anon, authenticated;

drop trigger if exists prepare_momentum_fact_archive on public.momentum_items;
create trigger prepare_momentum_fact_archive
before update of archived_at on public.momentum_items
for each row execute function public.prepare_momentum_fact_archive();

alter table public.momentum_documents
  add column if not exists category text;

update public.momentum_documents
set category = 'other'
where category is null;

alter table public.momentum_documents
  alter column category set default 'other',
  alter column category set not null,
  drop constraint if exists momentum_documents_category_check,
  add constraint momentum_documents_category_check check (category in (
    'legal', 'pitch', 'partner', 'sales', 'research',
    'interview_media', 'event', 'operations', 'case_content', 'other'
  ));

create index if not exists momentum_documents_category_created_idx
  on public.momentum_documents (category, created_at desc);

comment on column public.momentum_items.archived_at is
  'Hides a FACT from the live scoreboard without deleting its item or documents.';
comment on column public.momentum_documents.category is
  'Single required repository category selected during upload.';

commit;
