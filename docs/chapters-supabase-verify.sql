-- Read-only checks AFTER the release migration. Expected: 5 initial chapters,
-- all initially draft, RLS enabled, service-only prepare RPC, protected profile trigger.
select name,city,country,continent,status from public.chapters order by continent,city;
select relname,relrowsecurity from pg_class where oid in
 ('public.chapters'::regclass,'public.chapter_members'::regclass,'public.events'::regclass,
  'public.event_registrations'::regclass,'public.event_registration_limits'::regclass);
select has_function_privilege('anon','public.prepare_event_registration(uuid,text,text,uuid)','execute') as anon_can_prepare,
 has_function_privilege('authenticated','public.prepare_event_registration(uuid,text,text,uuid)','execute') as browser_can_prepare,
 has_function_privilege('service_role','public.prepare_event_registration(uuid,text,text,uuid)','execute') as service_can_prepare;
-- Expected false, false, true.
select tablename,policyname,permissive,cmd from pg_policies where
 (schemaname='public' and tablename in ('chapters','chapter_members','events','event_registrations'))
 or (schemaname='storage' and policyname like 'chapter_event_media%') order by tablename,policyname;
select tgname from pg_trigger where tgrelid='public.profiles'::regclass
 and tgname in ('protect_profile_access_fields','profile_member_identity') and not tgisinternal;
