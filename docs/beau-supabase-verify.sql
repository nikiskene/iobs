-- Read-only verification after manually installing the private BEAU release.
select jsonb_build_object(
 'migration_recorded',exists(select 1 from supabase_migrations.schema_migrations where version='20261021190000'),
 'tables_with_rls',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('beau_knowledge','beau_knowledge_versions','beau_conversations','beau_messages','beau_files','beau_file_cleanup','beau_settings','beau_revision','beau_answer_cache','beau_usage','beau_turns','beau_audit','beau_seed_imports') and c.relrowsecurity),
 'seed_entries',(select count(*) from public.beau_knowledge),
 'approved_entries',(select count(*) from public.beau_knowledge where status='approved'),
 'restricted_entries',(select count(*) from public.beau_knowledge where visibility='restricted'),
 'anonymous_can_read_chats',has_table_privilege('anon','public.beau_messages','SELECT'),
 'member_can_write_chats',has_table_privilege('authenticated','public.beau_messages','INSERT'),
 'member_can_read_raw_knowledge',has_table_privilege('authenticated','public.beau_knowledge','SELECT'),
 'member_can_access_retrieval_for_arbitrary_identity',has_function_privilege('authenticated','public.beau_retrieve(uuid,text)','EXECUTE'),
 'member_can_write_cache',has_function_privilege('authenticated','public.beau_cache_store(uuid,text,jsonb,bigint)','EXECUTE'),
 'private_storage',(select not public and file_size_limit=5242880 from storage.buckets where id='beau-files'),
 'owner_chat_policy',exists(select 1 from pg_policies where schemaname='public' and tablename='beau_messages' and policyname='beau_owner_messages'),
 'seed_recorded',exists(select 1 from public.beau_seed_imports)
) as beau_release_verification;
