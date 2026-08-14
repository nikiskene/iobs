-- supabase/migrations/20260814152000_multilingual_theses.sql
create table if not exists public.thesis_translations (
  thesis_id uuid not null references public.theses(id) on delete cascade,
  locale text not null check (locale in ('de','fr','ar','zh','es')),
  title text,
  subheadline text,
  short_explanation text,
  body text,
  updated_at timestamptz not null default now(),
  primary key (thesis_id, locale)
);

alter table public.thesis_translations enable row level security;

create policy "Public reads published thesis translations"
on public.thesis_translations
for select
using (
  exists (
    select 1 from public.theses
    where theses.id = thesis_translations.thesis_id
      and theses.status = 'published'
  )
);

create policy "Admins manage thesis translations"
on public.thesis_translations
for all
to authenticated
using (public.identity_is_admin())
with check (public.identity_is_admin());

grant select on public.thesis_translations to anon, authenticated;
grant insert, update, delete on public.thesis_translations to authenticated;

create index if not exists thesis_translations_locale_idx
  on public.thesis_translations(locale, thesis_id);
