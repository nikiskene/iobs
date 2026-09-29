begin;
create table public.nomination_settings (
  id boolean primary key default true check (id),
  mode text not null default 'acknowledgement' check (mode in ('award', 'acknowledgement'))
);
insert into public.nomination_settings (id, mode) values (true, 'acknowledgement');
alter table public.nomination_settings enable row level security;
create policy "Public nomination mode" on public.nomination_settings for select to anon, authenticated using (true);
create policy "Admins change nomination mode" on public.nomination_settings for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
grant select on public.nomination_settings to anon, authenticated;
grant update on public.nomination_settings to authenticated;

create table public.acknowledgement_nominations (
  id uuid primary key default gen_random_uuid(),
  company_name text not null check (length(trim(company_name)) between 1 and 120),
  website text not null check (length(website) <= 500 and website ~ '^https?://[^/[:space:]]+'),
  image_url text not null default '' check (length(image_url) <= 2000 and (image_url = '' or image_url ~ '^https://[^[:space:]]+')),
  description text not null check (length(trim(description)) between 1 and 360),
  ray text not null check (ray in ('me','circle','teams','organizations','country','society','world')),
  principles jsonb not null check (jsonb_typeof(principles) = 'object'),
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.acknowledgement_submitters (
  nomination_id uuid primary key references public.acknowledgement_nominations on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  email text not null check (length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  created_at timestamptz not null default now()
);
create table public.acknowledgement_votes (
  nomination_id uuid not null references public.acknowledgement_nominations on delete cascade,
  voter_id uuid not null references auth.users on delete cascade,
  value smallint not null check (value in (-1,1)),
  primary key (nomination_id, voter_id)
);
alter table public.acknowledgement_nominations enable row level security;
alter table public.acknowledgement_submitters enable row level security;
alter table public.acknowledgement_votes enable row level security;
create policy "Visible acknowledgement nominations" on public.acknowledgement_nominations for select to anon, authenticated using (is_visible or public.is_admin(auth.uid()));
create policy "Admins manage acknowledgement nominations" on public.acknowledgement_nominations for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "Admins read acknowledgement submitters" on public.acknowledgement_submitters for select to authenticated using (public.is_admin(auth.uid()));
grant select on public.acknowledgement_nominations to anon, authenticated;
grant update on public.acknowledgement_nominations to authenticated;
grant select on public.acknowledgement_submitters to authenticated;
-- All vote writes go through the function. Individual voter identities are never public.
revoke all on public.acknowledgement_votes from anon, authenticated;

create function public.submit_acknowledgement(
  p_company_name text, p_website text, p_image_url text, p_description text,
  p_ray text, p_principles jsonb, p_name text, p_email text
) returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid; item record; has_answer boolean := false;
begin
  if not exists (select 1 from nomination_settings where id and mode = 'acknowledgement') then
    raise exception 'Acknowledgement submissions are currently closed.';
  end if;
  if p_principles is null or jsonb_typeof(p_principles) <> 'object' then raise exception 'Please answer at least one principle.'; end if;
  for item in select key, value from jsonb_each(p_principles) loop
    if item.key not in ('offer','create','echo','momentum','legacy') or jsonb_typeof(item.value) <> 'string' or length(item.value #>> '{}') > 750 then
      raise exception 'Invalid principle answer.';
    end if;
    has_answer := has_answer or length(trim(item.value #>> '{}')) > 0;
  end loop;
  if not has_answer then raise exception 'Please answer at least one principle.'; end if;
  -- Serialize submissions from the same email so the limit also holds for concurrent calls.
  perform pg_advisory_xact_lock(hashtextextended(lower(trim(p_email)), 0));
  if (select count(*) from acknowledgement_submitters where email = lower(trim(p_email)) and created_at > now() - interval '1 day') >= 5 then
    raise exception 'Please wait before submitting more companies.';
  end if;
  insert into acknowledgement_nominations(company_name,website,image_url,description,ray,principles)
    values(trim(p_company_name),trim(p_website),coalesce(trim(p_image_url),''),trim(p_description),p_ray,p_principles) returning id into new_id;
  insert into acknowledgement_submitters(nomination_id,name,email) values(new_id,trim(p_name),lower(trim(p_email)));
  return new_id;
end $$;
revoke all on function public.submit_acknowledgement(text,text,text,text,text,jsonb,text,text) from public;
grant execute on function public.submit_acknowledgement(text,text,text,text,text,jsonb,text,text) to anon, authenticated;

create function public.vote_acknowledgement(p_nomination_id uuid, p_value smallint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Please sign in to vote.'; end if;
  if p_value is null or p_value not in (-1,0,1) then raise exception 'Invalid vote.'; end if;
  if not exists(select 1 from acknowledgement_nominations where id = p_nomination_id and is_visible) then raise exception 'This nomination is unavailable.'; end if;
  if p_value = 0 then
    delete from acknowledgement_votes where nomination_id = p_nomination_id and voter_id = auth.uid();
  else
    insert into acknowledgement_votes(nomination_id,voter_id,value) values(p_nomination_id,auth.uid(),p_value)
      on conflict(nomination_id,voter_id) do update set value = excluded.value;
  end if;
end $$;
revoke all on function public.vote_acknowledgement(uuid,smallint) from public;
grant execute on function public.vote_acknowledgement(uuid,smallint) to authenticated;

create function public.list_acknowledgements(p_offset integer default 0, p_limit integer default 24)
returns table(id uuid, company_name text, website text, image_url text, description text, ray text, principles jsonb, created_at timestamptz, upvotes bigint, downvotes bigint, my_vote smallint)
language sql stable security definer set search_path = public as $$
  select n.id,n.company_name,n.website,n.image_url,n.description,n.ray,n.principles,n.created_at,
    (select count(*) from acknowledgement_votes v where v.nomination_id=n.id and v.value=1),
    (select count(*) from acknowledgement_votes v where v.nomination_id=n.id and v.value=-1),
    coalesce((select value from acknowledgement_votes v where v.nomination_id=n.id and v.voter_id=auth.uid()),0)::smallint
  from acknowledgement_nominations n where n.is_visible
  order by n.created_at desc,n.id limit least(greatest(p_limit,1),100) offset greatest(p_offset,0);
$$;
revoke all on function public.list_acknowledgements(integer,integer) from public;
grant execute on function public.list_acknowledgements(integer,integer) to anon,authenticated;
create index acknowledgement_nominations_recent on public.acknowledgement_nominations(created_at desc,id) where is_visible;
create index acknowledgement_submitters_rate on public.acknowledgement_submitters(email,created_at);

-- Keep the existing award inbox delivery, but enforce the admin switch server-side too.
create function public.check_award_nomination_mode() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.reason like 'AWARD NOMINATION%' and not exists(select 1 from nomination_settings where id and mode='award') then
    raise exception 'Award nominations are currently closed.';
  end if;
  return new;
end $$;
create trigger award_nomination_mode before insert on public.contact_messages for each row execute function public.check_award_nomination_mode();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('acknowledgement-images','acknowledgement-images',true,3145728,array['image/jpeg','image/png','image/webp']);
create policy "Public acknowledgement images" on storage.objects for select to anon, authenticated using(bucket_id='acknowledgement-images');
create policy "Submit acknowledgement images" on storage.objects for insert to anon, authenticated with check(bucket_id='acknowledgement-images' and exists(select 1 from public.nomination_settings where id and mode='acknowledgement'));
create policy "Admins remove acknowledgement images" on storage.objects for delete to authenticated using(bucket_id='acknowledgement-images' and public.is_admin(auth.uid()));
commit;
