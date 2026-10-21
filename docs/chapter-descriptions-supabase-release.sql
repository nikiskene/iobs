-- Run in the IOBS Supabase SQL Editor. No existing chapter descriptions, assignments or permissions are changed.
-- Public chapter copy, editable by administrators and the assigned Chapter Head.
begin;
set local lock_timeout = '5s';
alter table public.chapters add column if not exists description text not null default '';
alter table public.chapters
  drop constraint if exists chapters_description_length,
  add constraint chapters_description_length check (char_length(description) <= 3000);
create or replace function public.chapter_update_details(cid uuid, details jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not (public.chapter_admin() or public.heads_chapter(cid)) then
    raise exception 'Chapter access required.' using errcode = '42501';
  end if;
  update public.chapters set
    email = coalesce(details->>'email', email),
    headline = coalesce(details->>'headline', headline),
    description = coalesce(details->>'description', description),
    hero_image_url = coalesce(details->>'hero_image_url', hero_image_url),
    updated_at = now()
  where id = cid;
end $$;
revoke all on function public.chapter_update_details(uuid,jsonb) from public;
grant execute on function public.chapter_update_details(uuid,jsonb) to authenticated;
-- Record manual installation before merging the website update.
insert into supabase_migrations.schema_migrations(version, name, statements)
values ('20261021170000', 'chapter_descriptions', array[]::text[])
on conflict (version) do nothing;
commit;
