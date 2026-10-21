-- Read-only verification after manually applying the approval migration.
select jsonb_build_object(
 'migration_recorded',exists(select 1 from supabase_migrations.schema_migrations where version='20261021200000'),
 'approval_rls_enabled',(select relrowsecurity from pg_class where oid='public.beau_member_access'::regclass),
 'member_can_write_approval',has_table_privilege('authenticated','public.beau_member_access','INSERT'),
 'member_can_update_approval',has_table_privilege('authenticated','public.beau_member_access','UPDATE'),
 'anonymous_can_call_admin_switch',has_function_privilege('anon','public.admin_set_beau_access(uuid,boolean)','EXECUTE'),
 'approved_members',(select count(*) from beau_member_access where enabled),
 'cache_invalidation_installed',exists(select 1 from pg_trigger where tgrelid='public.beau_member_access'::regclass and tgname='beau_member_access_invalidate')
) as beau_access_verification;
