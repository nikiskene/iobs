-- Read-only post-install check. One result contains every important signal.
select jsonb_build_object(
 'migration_recorded',exists(select 1 from supabase_migrations.schema_migrations where version='20261021140000'),
 'rls_enabled',(select bool_and(relrowsecurity) from pg_class where oid in ('public.member_email_permissions'::regclass,'public.iobs_mailboxes'::regclass,'public.member_email_rate_limits'::regclass)),
 'anonymous_can_reserve',has_function_privilege('anon','public.email_service_reserve(uuid,text)','execute'),
 'member_can_reserve_directly',has_function_privilege('authenticated','public.email_service_reserve(uuid,text)','execute'),
 'service_can_reserve',has_function_privilege('service_role','public.email_service_reserve(uuid,text)','execute'),
 'member_can_write_eligibility',has_table_privilege('authenticated','public.member_email_permissions','insert,update,delete'),
 'member_can_read_worker_token',has_column_privilege('authenticated','public.iobs_mailboxes','lease_token','select'),
 'member_merge_guard_installed',exists(select 1 from pg_trigger where tgrelid='public.team_people'::regclass and tgname='email_guard_member_merge' and not tgisinternal),
 'mailbox_records',(select count(*) from public.iobs_mailboxes)
) as email_release_verification;
-- Expected true,true,false,false,true,false,false,true,0 on a fresh installation.
