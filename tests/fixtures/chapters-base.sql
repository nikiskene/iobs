-- Schema-only fixture captured read-only from IOBS on 2026-10-21; no production data.
create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create schema storage;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name,'/') $$;
create table public.team_people(id uuid primary key default gen_random_uuid() not null,full_name text not null,category text default 'user'::text not null,status text default 'draft'::text not null,title text default ''::text not null,description text default ''::text not null,photo_url text default ''::text not null,linkedin_url text default ''::text not null,substack_url text default ''::text not null,sort_order integer default 0 not null,created_at timestamp with time zone default now() not null,location text default ''::text not null,directory_public boolean default false not null,primary_profile_id uuid,merged_into uuid,updated_at timestamp with time zone default now() not null);
alter table public.team_people enable row level security;
create table public.profiles(id uuid primary key not null,created_at timestamp with time zone default now() not null,updated_at timestamp with time zone default now() not null,full_name text,email text,linkedin_url text,location text,bio text,photo_url text,role text default 'explorer'::text not null,is_active boolean default true not null,is_team_member boolean default false not null,team_role text,team_bio text,team_sort_order integer,is_event_master boolean default false not null,is_public boolean default true not null,city text,location_label text,geo_lat double precision,geo_lng double precision,show_on_map boolean default true,profile_name text not null,member_id uuid not null);
alter table public.profiles enable row level security;
create table public.events(id uuid primary key default gen_random_uuid() not null,created_at timestamp with time zone default now() not null,updated_at timestamp with time zone default now() not null,title text not null,slug text not null,status text default 'scheduled'::text not null,start_date date not null,end_date date,location text,description text,hero_image_url text,hero_image_path text,investment text,participation_info text,past_summary text,youtube_url text,display_order integer default 0 not null,is_featured boolean default false not null,is_active boolean default true not null);
alter table public.events enable row level security;
create table public.event_rsvps(id uuid primary key default gen_random_uuid() not null,created_at timestamp with time zone default now() not null,event_id uuid not null,name text not null,email text not null,message text,status text default 'new'::text not null);
alter table public.event_rsvps enable row level security;
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$function$
;
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = user_id
      AND p.is_active = true
      AND (
        p.role = 'admin'
        OR p.role = 'super_admin'
      )
  );
$function$
;
CREATE OR REPLACE FUNCTION public.profile_member_identity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if tg_op='INSERT' then
    -- Account creation always gets a fresh person, never a name-based auto-link.
    if new.member_id is not null then
      raise exception 'Link accounts through member management.' using errcode='42501';
    end if;
    new.member_id=new.id;
    insert into public.team_people(id,full_name,status,title,description,photo_url,linkedin_url,location,directory_public)
    values(new.id,coalesce(nullif(btrim(new.full_name),''),'Member'),'draft',coalesce(new.team_role,''),coalesce(new.bio,''),
      case when new.photo_url ~* '^https?://' then new.photo_url else '' end,
      case when new.linkedin_url ~* '^https?://' then new.linkedin_url else '' end,
      coalesce(new.location,''),new.is_public);
  elsif new.member_id is distinct from old.member_id and not public.is_admin((select auth.uid())) then
    raise exception 'Only administrators can link accounts.' using errcode='42501';
  end if;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.protect_profile_access_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  caller_is_admin boolean;
begin
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and coalesce(p.is_active, true)
  ) into caller_is_admin;

  if tg_op = 'INSERT' then
    if (
      coalesce(new.role, 'explorer') <> 'explorer'
      or coalesce(new.is_team_member, false)
      or not coalesce(new.is_active, true)
    ) and not caller_is_admin then
      raise exception 'Only an admin can set profile access fields.'
        using errcode = '42501';
    end if;
  elsif (
    new.role is distinct from old.role
    or new.is_team_member is distinct from old.is_team_member
    or new.is_active is distinct from old.is_active
  ) and not caller_is_admin then
    raise exception 'Only an admin can change profile access fields.'
      using errcode = '42501';
  end if;

  return new;
end;
$function$
;
create policy "Admins and event masters can read RSVPs" on public.event_rsvps for SELECT to public using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::text) OR (profiles.is_event_master = true))))));
create policy "Admins and event masters can update RSVPs" on public.event_rsvps for UPDATE to public using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::text) OR (profiles.is_event_master = true)))))) with check ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::text) OR (profiles.is_event_master = true))))));
create policy "Anyone can submit event RSVPs for active scheduled events" on public.event_rsvps for INSERT to anon,authenticated with check (((name IS NOT NULL) AND (length(TRIM(BOTH FROM name)) > 1) AND (email IS NOT NULL) AND (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'::text) AND (EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_rsvps.event_id) AND (events.is_active = true) AND (events.status = 'scheduled'::text))))));
create policy "Admins and event masters can manage events" on public.events for ALL to public using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::text) OR (profiles.is_event_master = true)))))) with check ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::text) OR (profiles.is_event_master = true))))));
create policy "Anyone can read active public events" on public.events for SELECT to public using (((is_active = true) AND (status = ANY (ARRAY['scheduled'::text, 'past'::text]))));
create policy "Admins can update all profiles" on public.profiles for UPDATE to public using ((EXISTS ( SELECT 1
   FROM profiles admin_profile
  WHERE ((admin_profile.id = auth.uid()) AND (admin_profile.role = 'admin'::text))))) with check ((EXISTS ( SELECT 1
   FROM profiles admin_profile
  WHERE ((admin_profile.id = auth.uid()) AND (admin_profile.role = 'admin'::text)))));
create policy "Anyone can read active profiles" on public.profiles for SELECT to public using ((is_active = true));
create policy "Users can insert their own profile" on public.profiles for INSERT to public with check ((auth.uid() = id));
create policy "Users can update their own profile" on public.profiles for UPDATE to public using ((auth.uid() = id)) with check ((auth.uid() = id));
create policy "Administrators manage people" on public.team_people for ALL to authenticated using (is_admin(( SELECT auth.uid() AS uid))) with check (is_admin(( SELECT auth.uid() AS uid)));
create policy "Published people are public" on public.team_people for SELECT to anon,authenticated using ((status = 'published'::text));
create policy "Anyone can upload event media test" on storage.objects for INSERT to anon,authenticated with check ((bucket_id = 'event-media'::text));
create policy "Authenticated users can upload event media" on storage.objects for INSERT to authenticated with check ((bucket_id = 'event-media'::text));
create trigger protect_profile_access_fields before insert or update on public.profiles for each row execute function public.protect_profile_access_fields();
create trigger profile_member_identity before update of member_id on public.profiles for each row execute function public.profile_member_identity();
grant usage on schema public,auth,storage to anon,authenticated,service_role;
grant all on all tables in schema public,storage,auth to anon,authenticated,service_role;
