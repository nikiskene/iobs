-- Acknowledgements are the single company record. Existing homepage recognition
-- entries are copied into that record set without changing or deleting their source data.
alter table public.acknowledgement_nominations
  alter column website drop not null,
  add column submitted_by uuid references auth.users(id) on delete set null,
  add column legacy_recognition_id uuid unique references public.recognitions(id) on delete set null;

insert into public.acknowledgement_nominations (
  company_name, website, image_url, description, ray, principles, is_visible, legacy_recognition_id
)
select
  r.company_name,
  null,
  coalesce(r.photo_url, ''),
  r.acknowledgement,
  'organizations',
  '{}'::jsonb,
  r.status = 'published',
  r.id
from public.recognitions r
where not exists (
  select 1 from public.acknowledgement_nominations n where n.legacy_recognition_id = r.id
);

create policy "Members read their own acknowledgement nominations"
on public.acknowledgement_nominations for select to authenticated
using (submitted_by = auth.uid());

drop policy "Submit acknowledgement images" on storage.objects;
create policy "Members upload their acknowledgement images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'acknowledgement-images'
  and split_part(name, '/', 1) = auth.uid()::text
  and exists (select 1 from public.nomination_settings where id and mode = 'acknowledgement')
);
create policy "Members update their acknowledgement images"
on storage.objects for update to authenticated
using (bucket_id = 'acknowledgement-images' and split_part(name, '/', 1) = auth.uid()::text)
with check (bucket_id = 'acknowledgement-images' and split_part(name, '/', 1) = auth.uid()::text);

create or replace function public.submit_acknowledgement(
  p_company_name text, p_website text, p_image_url text, p_description text,
  p_ray text, p_principles jsonb, p_name text, p_email text
) returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid; item record; has_answer boolean := false;
begin
  if auth.uid() is null then raise exception 'Please sign in to submit a company.'; end if;
  if not exists (select 1 from nomination_settings where id and mode = 'acknowledgement') then raise exception 'Acknowledgement submissions are currently closed.'; end if;
  if p_principles is null or jsonb_typeof(p_principles) <> 'object' then raise exception 'Please answer at least one principle.'; end if;
  for item in select key, value from jsonb_each(p_principles) loop
    if item.key not in ('offer','create','echo','momentum','legacy') or jsonb_typeof(item.value) <> 'string' or length(item.value #>> '{}') > 750 then raise exception 'Invalid principle answer.'; end if;
    has_answer := has_answer or length(trim(item.value #>> '{}')) > 0;
  end loop;
  if not has_answer then raise exception 'Please answer at least one principle.'; end if;
  if (select count(*) from acknowledgement_nominations where submitted_by = auth.uid() and created_at > now() - interval '1 day') >= 5 then raise exception 'Please wait before submitting more companies.'; end if;
  insert into acknowledgement_nominations(company_name,website,image_url,description,ray,principles,submitted_by)
  values(trim(p_company_name),nullif(trim(p_website),''),coalesce(trim(p_image_url),''),trim(p_description),p_ray,p_principles,auth.uid()) returning id into new_id;
  insert into acknowledgement_submitters(nomination_id,name,email) values(new_id,trim(p_name),lower(trim(p_email)));
  return new_id;
end $$;
revoke all on function public.submit_acknowledgement(text,text,text,text,text,jsonb,text,text) from public;
grant execute on function public.submit_acknowledgement(text,text,text,text,text,jsonb,text,text) to authenticated;

create function public.update_my_acknowledgement(
  p_id uuid, p_company_name text, p_website text, p_image_url text, p_description text, p_ray text, p_principles jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare item record; has_answer boolean := false;
begin
  if auth.uid() is null then raise exception 'Please sign in to edit a company.'; end if;
  if not exists (select 1 from acknowledgement_nominations where id=p_id and submitted_by=auth.uid()) then raise exception 'This submission is unavailable.'; end if;
  if p_principles is null or jsonb_typeof(p_principles) <> 'object' then raise exception 'Please answer at least one principle.'; end if;
  for item in select key, value from jsonb_each(p_principles) loop
    if item.key not in ('offer','create','echo','momentum','legacy') or jsonb_typeof(item.value) <> 'string' or length(item.value #>> '{}') > 750 then raise exception 'Invalid principle answer.'; end if;
    has_answer := has_answer or length(trim(item.value #>> '{}')) > 0;
  end loop;
  if not has_answer then raise exception 'Please answer at least one principle.'; end if;
  update acknowledgement_nominations set
    company_name=trim(p_company_name), website=nullif(trim(p_website),''), image_url=coalesce(trim(p_image_url),''),
    description=trim(p_description), ray=p_ray, principles=p_principles, is_visible=false
  where id=p_id and submitted_by=auth.uid();
end $$;
revoke all on function public.update_my_acknowledgement(uuid,text,text,text,text,text,jsonb) from public;
grant execute on function public.update_my_acknowledgement(uuid,text,text,text,text,text,jsonb) to authenticated;
