-- supabase/migrations/20260723151000_add_identity_africa_region.sql
-- Extend the existing source-region enum without depending on its generated name.

do $$
declare
  region_type text;
begin
  for region_type in
    select distinct field.udt_name
    from information_schema.columns field
    where field.table_schema = 'public'
      and field.table_name in ('identity_sources', 'identity_entities')
      and field.column_name = 'region'
      and field.data_type = 'USER-DEFINED'
  loop
    execute format(
      'alter type public.%I add value if not exists %L',
      region_type,
      'africa'
    );
  end loop;
end $$;
