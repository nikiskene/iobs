-- supabase/migrations/20260723133000_identity_autopilot_sources.sql
-- Add source ownership, rights provenance, and operational health for unattended scans.

alter table public.identity_sources
  add column if not exists owner_entity_id uuid references public.identity_entities(id),
  add column if not exists rights_status text not null default 'review'
    check (rights_status in ('allowed', 'metadata_only', 'review', 'licensed')),
  add column if not exists perspective text not null default 'unknown'
    check (perspective in ('official', 'public_media', 'independent_media', 'commercial_media', 'discovery', 'unknown')),
  add column if not exists last_checked_at timestamptz,
  add column if not exists last_success_at timestamptz,
  add column if not exists last_error text,
  add column if not exists last_item_count integer not null default 0,
  add column if not exists consecutive_failures integer not null default 0;

update public.identity_sources
set rights_status = case when automation_allowed then 'allowed' else 'review' end,
    perspective = case
      when source_tier = 'primary' then 'official'
      when source_tier = 'discovery' then 'discovery'
      else 'unknown'
    end;

update public.identity_sources s
set owner_entity_id = e.id
from public.identity_entities e
where (s.domain = any(e.official_domains)
  or exists (
    select 1 from unnest(e.official_domains) value
    where replace(replace(value, 'https://', ''), 'http://', '') like '%' || s.domain || '%'
  ))
and s.owner_entity_id is null;

insert into public.identity_sources
  (name, domain, source_tier, region, country_code, languages, feed_url, active,
   automation_allowed, rights_status, perspective, terms_notes, owner_entity_id)
values
  ('EU Council Press', 'consilium.europa.eu', 'primary', 'europe', 'BE', array['en'],
   'https://www.consilium.europa.eu/en/rss/pressreleases.ashx', true, true,
   'allowed', 'official',
   'Official RSS explicitly supports automatic loading and headline/summary display.', null),
  ('Hong Kong Government News', 'info.gov.hk', 'primary', 'asia', 'HK', array['en'],
   'https://www.info.gov.hk/gia/rss/general_en.xml', true, true,
   'allowed', 'official',
   'Official HKSAR machine-readable press-release feed; metadata and short excerpt only.', null),
  ('South Africa Justice', 'justice.gov.za', 'primary', 'other', 'ZA', array['en'],
   'https://www.justice.gov.za/rssjustice.xml', true, true,
   'allowed', 'official',
   'Official department RSS feed; metadata and short excerpt only.',
   (select id from public.identity_entities where country_code = 'ZA' and entity_type = 'country' limit 1)),
  ('Agencia Brasil', 'agenciabrasil.ebc.com.br', 'primary', 'south_america', 'BR', array['pt'],
   'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', true, true,
   'allowed', 'public_media',
   'Public agency permits journalistic reproduction with attribution; store minimal source text.',
   (select id from public.identity_entities where country_code = 'BR' and entity_type = 'country' limit 1))
on conflict do nothing;

update public.identity_sources
set owner_entity_id = (
  select id from public.identity_entities
  where country_code = identity_sources.country_code and entity_type = 'country'
  limit 1
)
where owner_entity_id is null
  and source_tier = 'primary'
  and country_code in ('US', 'GB', 'BR', 'RU', 'ZA', 'CN');

