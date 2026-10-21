-- Read-only. Does not invoke deletion or change data.
select jsonb_build_object(
  'migration_recorded', exists(select 1 from supabase_migrations.schema_migrations where version='20261021180000'),
  'permission_table_rls', (select relrowsecurity from pg_class where oid='public.work_item_deletion_admins'::regclass),
  'active_admins_enabled', (select count(*) from public.work_item_deletion_admins a join public.profiles p on p.id=a.user_id where p.is_active and p.role='admin'),
  'member_can_grant_deletion', has_table_privilege('authenticated','public.work_item_deletion_admins','insert,update,delete'),
  'anonymous_can_delete', has_function_privilege('anon','public.delete_work_item(uuid)','execute'),
  'physical_delete_guard_installed', exists(select 1 from pg_policies where schemaname='public' and tablename='momentum_items' and policyname='work preserves item files and history' and permissive='RESTRICTIVE'),
  'deleted_items_hidden', exists(select 1 from pg_policies where schemaname='public' and tablename='momentum_items' and policyname='work hides deleted items' and permissive='RESTRICTIVE')
) as work_deletion_verification;
-- Expected true, true, 2, false, false, true, true.
