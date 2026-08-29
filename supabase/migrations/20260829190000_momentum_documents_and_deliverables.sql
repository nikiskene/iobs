-- IOBS Work: structured deliverables and private document repository.
-- Run before the 2026-08-29 Jour Fixe seed and before shipping upload UI.

begin;

alter table public.momentum_items
  add column if not exists desired_output text,
  add column if not exists definition_of_done text,
  add column if not exists dependency_note text,
  add column if not exists target_period text,
  add column if not exists requires_document boolean not null default false,
  add column if not exists document_requirement_note text,
  add column if not exists source_key text;

alter table public.momentum_items
  drop constraint if exists momentum_desired_output_length,
  add constraint momentum_desired_output_length
    check (desired_output is null or char_length(desired_output) <= 1000),
  drop constraint if exists momentum_definition_of_done_length,
  add constraint momentum_definition_of_done_length
    check (definition_of_done is null or char_length(definition_of_done) <= 2000),
  drop constraint if exists momentum_dependency_note_length,
  add constraint momentum_dependency_note_length
    check (dependency_note is null or char_length(dependency_note) <= 2000),
  drop constraint if exists momentum_target_period_length,
  add constraint momentum_target_period_length
    check (target_period is null or char_length(target_period) <= 120),
  drop constraint if exists momentum_document_requirement_note_length,
  add constraint momentum_document_requirement_note_length
    check (document_requirement_note is null or char_length(document_requirement_note) <= 1000),
  drop constraint if exists momentum_source_key_length,
  add constraint momentum_source_key_length
    check (source_key is null or char_length(source_key) between 3 and 160);

create unique index if not exists momentum_items_source_key_unique_idx
  on public.momentum_items (source_key)
  where source_key is not null;

create table if not exists public.momentum_documents (
  id uuid primary key default gen_random_uuid(),
  momentum_item_id uuid not null references public.momentum_items(id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 1 and 240),
  description text check (description is null or char_length(description) <= 2000),
  file_name text not null check (char_length(file_name) between 1 and 255),
  storage_path text not null unique check (char_length(storage_path) between 3 and 1000),
  mime_type text check (mime_type is null or char_length(mime_type) <= 200),
  file_size bigint check (file_size is null or file_size between 0 and 52428800),
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint momentum_document_path_matches_item check (
    split_part(storage_path, '/', 1) = momentum_item_id::text
  )
);

create index if not exists momentum_documents_item_created_idx
  on public.momentum_documents (momentum_item_id, created_at desc);
create index if not exists momentum_documents_created_idx
  on public.momentum_documents (created_at desc);

create or replace function public.prepare_momentum_document()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and not exists (
    select 1
    from storage.objects o
    where o.bucket_id = 'momentum-documents'
      and o.name = new.storage_path
  ) then
    raise exception 'The document file must be uploaded before its repository record is created.'
      using errcode = '23503';
  end if;

  new.title := btrim(new.title);
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.uploaded_by := coalesce(new.uploaded_by, (select auth.uid()));
    new.created_at := coalesce(new.created_at, now());
  else
    new.uploaded_by := old.uploaded_by;
    new.created_at := old.created_at;
    new.storage_path := old.storage_path;
  end if;
  return new;
end;
$$;

revoke all on function public.prepare_momentum_document() from public, anon, authenticated;

drop trigger if exists prepare_momentum_document on public.momentum_documents;
create trigger prepare_momentum_document
before insert or update on public.momentum_documents
for each row execute function public.prepare_momentum_document();

-- The database, not merely the form, enforces documentary completion.
create or replace function public.enforce_momentum_document_requirement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'fact'
    and coalesce(new.requires_document, false)
    and not exists (
      select 1
      from public.momentum_documents d
      where d.momentum_item_id = new.id
    ) then
    raise exception 'Upload the required document before marking this item as FACT.'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_momentum_document_requirement() from public, anon, authenticated;

drop trigger if exists enforce_momentum_document_requirement on public.momentum_items;
create trigger enforce_momentum_document_requirement
before insert or update of status, requires_document on public.momentum_items
for each row execute function public.enforce_momentum_document_requirement();

-- Preserve ordinary app attribution while allowing an administrator-run seed
-- in SQL Editor to supply explicit historic completion attribution.
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
      new.completed_at := coalesce(new.completed_at, now());
      new.completed_by := coalesce((select auth.uid()), new.completed_by, new.created_by);
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

revoke all on function public.prepare_momentum_item() from public, anon, authenticated;

alter table public.momentum_documents enable row level security;

drop policy if exists "team reads momentum documents" on public.momentum_documents;
create policy "team reads momentum documents"
  on public.momentum_documents for select to authenticated
  using (public.has_team_momentum_access());

drop policy if exists "team uploads momentum documents" on public.momentum_documents;
create policy "team uploads momentum documents"
  on public.momentum_documents for insert to authenticated
  with check (
    public.has_team_momentum_access()
    and (uploaded_by is null or uploaded_by = (select auth.uid()))
  );

drop policy if exists "team updates own momentum documents" on public.momentum_documents;
create policy "team updates own momentum documents"
  on public.momentum_documents for update to authenticated
  using (
    public.has_team_momentum_access()
    and (uploaded_by = (select auth.uid()) or public.is_admin((select auth.uid())))
  )
  with check (public.has_team_momentum_access());

drop policy if exists "team deletes own momentum documents" on public.momentum_documents;
create policy "team deletes own momentum documents"
  on public.momentum_documents for delete to authenticated
  using (
    public.has_team_momentum_access()
    and (uploaded_by = (select auth.uid()) or public.is_admin((select auth.uid())))
  );

revoke all on public.momentum_documents from anon, authenticated;
grant select, insert, update, delete on public.momentum_documents to authenticated;

-- Private storage. Upload paths will be item-id/random-id-original-name.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'momentum-documents',
  'momentum-documents',
  false,
  52428800,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/markdown',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do nothing;

drop policy if exists "team reads momentum document files" on storage.objects;
create policy "team reads momentum document files"
  on storage.objects for select to authenticated
  using (bucket_id = 'momentum-documents' and public.has_team_momentum_access());

drop policy if exists "team uploads momentum document files" on storage.objects;
create policy "team uploads momentum document files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'momentum-documents'
    and owner_id = (select auth.uid()::text)
    and public.has_team_momentum_access()
  );

drop policy if exists "team updates own momentum document files" on storage.objects;
create policy "team updates own momentum document files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'momentum-documents'
    and public.has_team_momentum_access()
    and (owner_id = (select auth.uid()::text) or public.is_admin((select auth.uid())))
  )
  with check (bucket_id = 'momentum-documents' and public.has_team_momentum_access());

drop policy if exists "team deletes own momentum document files" on storage.objects;
create policy "team deletes own momentum document files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'momentum-documents'
    and public.has_team_momentum_access()
    and (owner_id = (select auth.uid()::text) or public.is_admin((select auth.uid())))
  );

comment on table public.momentum_documents is
  'Private IOBS Work document repository; uploads may be linked to momentum items.';
comment on column public.momentum_items.requires_document is
  'When true, the item cannot become FACT until a linked momentum_documents row exists.';
comment on column public.momentum_items.source_key is
  'Stable external/import identity used for idempotent seeds and integrations.';

commit;
