-- IOBS release bookkeeping only. Run once AFTER chapters-supabase-release.sql.
-- Records the two manually executed migrations so GitHub/Supabase will not replay them.
-- Does not recreate tables, run migrations, or alter member/chapter/event data.
begin;
do $$
begin
 if to_regclass('public.chapters') is null
 or to_regclass('public.event_registration_limits') is null
 or to_regprocedure('public.prepare_event_registration(uuid,text,text,uuid)') is null
 or to_regprocedure('public.my_managed_chapters()') is null
 or not exists(select 1 from pg_constraint where conrelid='public.events'::regclass and conname='chapter_event_requires_chapter')
 or not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='chapter_event_media_guard' and permissive='RESTRICTIVE')
 then raise exception 'The complete Chapters release must already be installed. No migration records were changed.';
 end if;
end $$;
insert into supabase_migrations.schema_migrations(version,name,statements)
values ('20261021100000','chapters_foundation',array[]::text[]),
       ('20261021110000','chapters_security_and_registration',array[]::text[])
on conflict(version) do nothing;
commit;
-- Expect two records:
select version,name from supabase_migrations.schema_migrations
where version in ('20261021100000','20261021110000') order by version;
