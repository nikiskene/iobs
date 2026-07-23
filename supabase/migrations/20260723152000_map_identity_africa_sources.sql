-- supabase/migrations/20260723152000_map_identity_africa_sources.sql
-- Move African sources out of the generic region after the enum value is committed.

update public.identity_sources
set region = 'africa'
where country_code in ('ZA', 'KE');

update public.identity_entities
set region = 'africa'
where country_code in ('ZA', 'KE');

