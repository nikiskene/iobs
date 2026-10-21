begin;
-- Existing role='admin' is the application's superadmin. Heads get no global role.
create or replace function public.chapter_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role in ('admin','super_admin') and is_active);
$$;
create or replace function public.heads_chapter(cid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.chapters c join public.profiles p on p.member_id=c.head_member_id where c.id=cid and p.id=auth.uid() and p.is_active);
$$;
create or replace function public.manages_event(eid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.chapter_admin() or exists(select 1 from public.events e where e.id=eid and ((e.category='chapter_event' and public.heads_chapter(e.chapter_id)) or (e.category<>'chapter_event' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and p.is_event_master))));
$$;
revoke all on function public.chapter_admin(),public.heads_chapter(uuid),public.manages_event(uuid) from public;
grant execute on function public.chapter_admin(),public.heads_chapter(uuid),public.manages_event(uuid) to anon,authenticated;
-- Remove inherited chapter policies, including any unsafe policy from earlier drafts.
do $$ declare p record; begin for p in select policyname,tablename from pg_policies where schemaname='public' and tablename in ('chapters','chapter_members','event_registrations') loop execute format('drop policy %I on public.%I',p.policyname,p.tablename); end loop; end $$;
create policy chapter_read on public.chapters for select using(status='active' or public.chapter_admin() or public.heads_chapter(id));
create policy chapter_write on public.chapters for all to authenticated using(public.chapter_admin()) with check(public.chapter_admin());
create policy membership_read on public.chapter_members for select to authenticated using(public.chapter_admin() or public.heads_chapter(chapter_id));
create policy membership_write on public.chapter_members for all to authenticated using(public.chapter_admin() or public.heads_chapter(chapter_id)) with check(public.chapter_admin() or public.heads_chapter(chapter_id));
create policy registration_read on public.event_registrations for select to authenticated using(public.manages_event(event_id));
-- Restrictive guards intersect all pre-existing permissive event policies.
alter table public.events enable row level security;
create policy chapters_event_read_guard on public.events as restrictive for select using((is_active and status in ('scheduled','past') and (chapter_id is null or exists(select 1 from public.chapters c where c.id=chapter_id and c.status='active'))) or (public.chapter_admin() or (category='chapter_event' and public.heads_chapter(chapter_id)) or (category<>'chapter_event' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and p.is_event_master))));
create policy chapters_event_manager_read on public.events for select to authenticated using((public.chapter_admin() or (category='chapter_event' and public.heads_chapter(chapter_id)) or (category<>'chapter_event' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and p.is_event_master))));
create policy chapters_event_insert on public.events for insert to authenticated with check(public.chapter_admin() or ((category='chapter_event' and public.heads_chapter(chapter_id)) or (category<>'chapter_event' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and p.is_event_master))));
create policy chapters_event_update on public.events for update to authenticated using((public.chapter_admin() or (category='chapter_event' and public.heads_chapter(chapter_id)) or (category<>'chapter_event' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and p.is_event_master)))) with check(public.chapter_admin() or ((category='chapter_event' and public.heads_chapter(chapter_id)) or (category<>'chapter_event' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and p.is_event_master))));
create policy chapters_event_delete on public.events for delete to authenticated using((public.chapter_admin() or (category='chapter_event' and public.heads_chapter(chapter_id)) or (category<>'chapter_event' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and p.is_event_master))));
create policy chapters_event_insert_guard on public.events as restrictive for insert to authenticated with check(public.chapter_admin() or ((category='chapter_event' and public.heads_chapter(chapter_id)) or (category<>'chapter_event' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and p.is_event_master))));
create policy chapters_event_update_guard on public.events as restrictive for update to authenticated using((public.chapter_admin() or (category='chapter_event' and public.heads_chapter(chapter_id)) or (category<>'chapter_event' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and p.is_event_master)))) with check(public.chapter_admin() or ((category='chapter_event' and public.heads_chapter(chapter_id)) or (category<>'chapter_event' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and p.is_event_master))));
create policy chapters_event_delete_guard on public.events as restrictive for delete to authenticated using((public.chapter_admin() or (category='chapter_event' and public.heads_chapter(chapter_id)) or (category<>'chapter_event' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and p.is_event_master))));
create or replace function public.chapter_validate_head() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.head_member_id is not null and (tg_op='INSERT' or new.head_member_id is distinct from old.head_member_id) and not exists(select 1 from public.profiles p join public.team_people t on t.id=p.member_id where p.member_id=new.head_member_id and p.is_active and t.merged_into is null) then raise exception 'Chapter Head needs an active linked account.'; end if;
 new.updated_at=now(); return new;
end $$;
create trigger chapter_validate_head before insert or update on public.chapters for each row execute function public.chapter_validate_head();
create or replace function public.chapter_update_details(cid uuid, details jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if not (public.chapter_admin() or public.heads_chapter(cid)) then raise exception 'Chapter access required.' using errcode='42501'; end if;
 update public.chapters set email=coalesce(details->>'email',email), headline=coalesce(details->>'headline',headline),hero_image_url=coalesce(details->>'hero_image_url',hero_image_url) where id=cid;
end $$;
create or replace function public.my_managed_chapters() returns setof public.chapters language sql stable security definer set search_path='' as $$
 select c.* from public.chapters c where public.chapter_admin() or public.heads_chapter(c.id) order by c.city;
$$;
revoke all on function public.my_managed_chapters() from public;
grant execute on function public.my_managed_chapters() to authenticated;
-- Only a minimal projection is exposed; heads cannot read unrelated private members.
create or replace function public.chapter_member_options(cid uuid) returns table(id uuid, full_name text) language plpgsql stable security definer set search_path='' as $$
begin
 if not (public.chapter_admin() or public.heads_chapter(cid)) then raise exception 'Chapter access required.' using errcode='42501'; end if;
 return query select t.id,t.full_name from public.team_people t where t.merged_into is null and (public.chapter_admin() or t.directory_public or exists(select 1 from public.chapter_members m where m.chapter_id=cid and m.member_id=t.id)) order by t.full_name;
end $$;
create or replace function public.public_chapter_heads() returns table(chapter_id uuid,member_id uuid,full_name text,photo_url text,title text,description text,linkedin_url text,substack_url text) language sql stable security definer set search_path='' as $$
 select c.id,t.id,t.full_name,t.photo_url,t.title,t.description,t.linkedin_url,t.substack_url from public.chapters c join public.team_people t on t.id=c.head_member_id where c.status='active' and t.merged_into is null;
$$;
revoke all on function public.chapter_update_details(uuid,jsonb),public.chapter_member_options(uuid),public.public_chapter_heads() from public;
grant execute on function public.chapter_update_details(uuid,jsonb),public.chapter_member_options(uuid) to authenticated;
grant execute on function public.public_chapter_heads() to anon,authenticated;
alter table public.events add constraint event_currency_supported check(ticket_currency in ('EUR','USD','GBP','AED'));
alter table public.event_registrations add column amount_cents integer not null default 0, add column currency text not null default 'EUR', add column stripe_payment_intent_id text, add column checkout_attempt integer not null default 0;
create unique index event_registration_email_unique on public.event_registrations(event_id,lower(attendee_email));
-- Bounded, atomic service-only request counter; no public access to request keys.
create table public.event_registration_limits(key text primary key,window_start timestamptz not null,hits integer not null);
alter table public.event_registration_limits enable row level security;
revoke all on public.event_registration_limits from public,anon,authenticated;
create function public.event_registration_allow_request(request_key text) returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 insert into public.event_registration_limits(key,window_start,hits) values(request_key,now(),1)
 on conflict(key) do update set hits=case when event_registration_limits.window_start<now()-interval '1 minute' then 1 else event_registration_limits.hits+1 end, window_start=case when event_registration_limits.window_start<now()-interval '1 minute' then now() else event_registration_limits.window_start end returning hits into n;
 delete from public.event_registration_limits where window_start<now()-interval '1 day';
 return n<=15;
end $$;
revoke all on function public.event_registration_allow_request(text) from public,anon,authenticated;
grant execute on function public.event_registration_allow_request(text) to service_role;
-- Service-only atomic registration: price and publication come from the locked event.
create or replace function public.prepare_event_registration(eid uuid, attendee text, email text, verified_user uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare e public.events; r public.event_registrations; mid uuid;
begin
 select * into e from public.events where id=eid for update;
 if not found or not e.is_active or e.status<>'scheduled' or e.start_date::date<current_date or (e.chapter_id is not null and not exists(select 1 from public.chapters where id=e.chapter_id and status='active')) then raise exception 'Registration is closed.'; end if;
 if length(btrim(attendee)) not between 1 and 200 or length(prepare_event_registration.email)>254 or prepare_event_registration.email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Valid name and email required.'; end if;
 select p.member_id into mid from public.profiles p join auth.users u on u.id=p.id where p.id=verified_user and p.is_active and u.email_confirmed_at is not null and lower(u.email)=lower(btrim(prepare_event_registration.email));
 insert into public.event_registrations(event_id,attendee_name,attendee_email,member_id,payment_status,amount_cents,currency) values(eid,btrim(attendee),lower(btrim(prepare_event_registration.email)),mid,case when e.ticket_price_cents=0 then 'free' else 'pending' end,e.ticket_price_cents,e.ticket_currency) on conflict do nothing;
 select * into r from public.event_registrations where event_id=eid and lower(attendee_email)=lower(btrim(prepare_event_registration.email)) for update;
 return to_jsonb(r)||jsonb_build_object('event_title',e.title,'event_slug',e.slug);
end $$;
revoke all on function public.prepare_event_registration(uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.prepare_event_registration(uuid,text,text,uuid) to service_role;
-- Old RSVP endpoint must not provide a parallel bypass for paid registrations.
create policy chapters_legacy_rsvp_guard on public.event_rsvps as restrictive for insert with check(false);
-- Protect the legacy event-master capability as well as global roles.
create or replace function public.protect_profile_access_fields() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='UPDATE' and row(new.role,new.is_team_member,new.is_active,new.is_event_master) is distinct from row(old.role,old.is_team_member,old.is_active,old.is_event_master) and not public.chapter_admin() then raise exception 'Only administrators can change access fields.' using errcode='42501'; end if;
 if tg_op='INSERT' and (coalesce(new.role,'user') not in ('user','explorer') or coalesce(new.is_team_member,false) or coalesce(new.is_event_master,false) or not coalesce(new.is_active,true)) and not public.chapter_admin() then raise exception 'Only administrators can assign access fields.' using errcode='42501'; end if;
 return new;
end $$;
-- Retain historical free RSVPs in the new attendee list.
insert into public.event_registrations(event_id,attendee_name,attendee_email,payment_status,created_at)
 select distinct on (event_id,lower(btrim(email))) event_id,name,lower(btrim(email)),'free',created_at from public.event_rsvps where email is not null and name is not null order by event_id,lower(btrim(email)),created_at
 on conflict do nothing;
-- Intersect existing broad upload policies, preserving unrelated storage buckets.
create policy chapter_event_media_guard on storage.objects as restrictive for insert with check(bucket_id<>'event-media' or public.chapter_admin() or ((storage.foldername(objects.name))[1]='chapters' and exists(select 1 from public.chapters c where c.id::text=(storage.foldername(objects.name))[2] and public.heads_chapter(c.id))) or exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and p.is_event_master));
-- Chapter images use an isolated path; no broad access to other media.
create policy chapter_event_media_insert on storage.objects for insert to authenticated with check(bucket_id='event-media' and (storage.foldername(objects.name))[1]='chapters' and exists(select 1 from public.chapters c where c.id::text=(storage.foldername(objects.name))[2] and public.heads_chapter(c.id)));
insert into public.chapters(name,city,country,continent,latitude,longitude) values
 ('Amsterdam','Amsterdam','Netherlands','Europe',52.3676,4.9041),('Kaunas','Kaunas','Lithuania','Europe',54.8985,23.9036),('Vienna','Vienna','Austria','Europe',48.2082,16.3738),('San Francisco','San Francisco','United States','North America',37.7749,-122.4194),('Dubai','Dubai','United Arab Emirates','Asia',25.2048,55.2708) on conflict(name) do nothing;
revoke all on function public.chapter_validate_head(),public.protect_profile_access_fields() from public,anon,authenticated;
grant select,insert,update,delete on public.chapters,public.chapter_members to authenticated;
grant select on public.chapters to anon;
grant select on public.event_registrations to authenticated;
grant all on public.event_registrations to service_role;
commit;
