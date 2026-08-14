-- supabase/migrations/20260814145000_multilingual_award_site_content.sql
alter table public.award_site_content
  add column if not exists locale text not null default 'en';

alter table public.award_site_content
  drop constraint if exists award_site_content_content_key_key;

drop index if exists award_site_content_content_key_key;

alter table public.award_site_content
  add constraint award_site_content_locale_check
  check (locale in ('en','de','fr','ar','zh','es'));

alter table public.award_site_content
  add constraint award_site_content_key_locale_unique
  unique (content_key, locale);

create index if not exists award_site_content_locale_section_idx
  on public.award_site_content(locale, section, display_order);
