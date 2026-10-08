begin;
alter table public.acknowledgement_nominations drop constraint acknowledgement_nominations_description_check;
alter table public.acknowledgement_nominations add constraint acknowledgement_nominations_description_check
  check (length(trim(description)) >= 1 and length(description) <= 3000) not valid;
alter table public.acknowledgement_nominations validate constraint acknowledgement_nominations_description_check;

-- Enforce answer sizes for admin/direct API updates as well as member RPCs.
create function public.check_nomination_narrative_limits() returns trigger
language plpgsql set search_path = public as $$
declare item record;
begin
  if length(new.description) > 3000 then raise exception 'The description must be 3,000 characters or fewer.'; end if;
  for item in select value from jsonb_each(new.principles) loop
    if jsonb_typeof(item.value) <> 'string' then raise exception 'Invalid principle answer.'; end if;
    if length(item.value #>> '{}') > 3000 then raise exception 'Each principle answer must be 3,000 characters or fewer.'; end if;
  end loop;
  return new;
end $$;
create trigger nomination_narrative_limits before insert or update of description, principles
on public.acknowledgement_nominations for each row execute function public.check_nomination_narrative_limits();

-- Five full answers plus the existing nominee/evidence/language envelope.
alter table public.contact_messages drop constraint contact_messages_message_check;
alter table public.contact_messages add constraint contact_messages_message_check check (
  char_length(message) between 1 and case when reason like 'AWARD NOMINATION%' then 16000 else 5000 end
);
create or replace function public.submit_acknowledgement(
  p_company_name text, p_website text, p_image_url text, p_description text,
  p_ray text, p_principles jsonb, p_name text, p_email text
) returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid; item record; has_answer boolean := false;
begin
  if auth.uid() is null then raise exception 'Please sign in to submit a company.'; end if;
  if not exists (select 1 from nomination_settings where id and mode = 'acknowledgement') then raise exception 'Acknowledgement submissions are currently closed.'; end if;
  if length(p_description) > 3000 then raise exception 'The description must be 3,000 characters or fewer.'; end if;
  if p_principles is null or jsonb_typeof(p_principles) <> 'object' then raise exception 'Please answer at least one principle.'; end if;
  for item in select key, value from jsonb_each(p_principles) loop
    if item.key not in ('offer','create','echo','momentum','legacy') or jsonb_typeof(item.value) <> 'string' then raise exception 'Invalid principle answer.'; end if;
    if length(item.value #>> '{}') > 3000 then raise exception 'Each principle answer must be 3,000 characters or fewer.'; end if;
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

create or replace function public.update_my_acknowledgement(
  p_id uuid, p_company_name text, p_website text, p_image_url text, p_description text, p_ray text, p_principles jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare item record; has_answer boolean := false;
begin
  if auth.uid() is null then raise exception 'Please sign in to edit a company.'; end if;
  if not exists (select 1 from acknowledgement_nominations where id=p_id and submitted_by=auth.uid()) then raise exception 'This submission is unavailable.'; end if;
  if length(p_description) > 3000 then raise exception 'The description must be 3,000 characters or fewer.'; end if;
  if p_principles is null or jsonb_typeof(p_principles) <> 'object' then raise exception 'Please answer at least one principle.'; end if;
  for item in select key, value from jsonb_each(p_principles) loop
    if item.key not in ('offer','create','echo','momentum','legacy') or jsonb_typeof(item.value) <> 'string' then raise exception 'Invalid principle answer.'; end if;
    if length(item.value #>> '{}') > 3000 then raise exception 'Each principle answer must be 3,000 characters or fewer.'; end if;
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

-- Accept structured answers so every award answer is validated before inbox formatting.
create function public.submit_award_nomination(
  p_name text, p_email text, p_ray text, p_ray_label text, p_principles jsonb, p_link text, p_locale text
) returns void language plpgsql security definer set search_path = public as $$
declare item record; has_answer boolean := false; message_text text; principle text;
begin
  if p_principles is null or jsonb_typeof(p_principles) <> 'object' then raise exception 'Please answer at least one principle.'; end if;
  for item in select key, value from jsonb_each(p_principles) loop
    if item.key not in ('offer','create','echo','momentum','legacy') or jsonb_typeof(item.value) <> 'string' then raise exception 'Invalid principle answer.'; end if;
    if length(item.value #>> '{}') > 3000 then raise exception 'Each principle answer must be 3,000 characters or fewer.'; end if;
    has_answer := has_answer or length(trim(item.value #>> '{}')) > 0;
  end loop;
  if not has_answer then raise exception 'Please answer at least one principle.'; end if;
  if p_ray not in ('me','circle','teams','organizations','country','society','world') or p_ray is null then raise exception 'Please choose a ray of impact.'; end if;
  if length(p_ray_label) > 40 or length(p_link) > 500 or p_locale not in ('en','ar') then raise exception 'Invalid nomination details.'; end if;
  message_text := 'Nominee: ' || trim(p_name) || E'\nRay: ' || p_ray_label || ' (' || p_ray || ')';
  foreach principle in array array['offer','create','echo','momentum','legacy'] loop
    message_text := message_text || E'\n\n' || upper(principle) || E':\n' || coalesce(nullif(trim(p_principles ->> principle),''),'Not provided');
  end loop;
  if coalesce(trim(p_link),'') <> '' then message_text := message_text || E'\n\nEvidence: ' || trim(p_link); end if;
  message_text := message_text || E'\n\nLanguage: ' || upper(p_locale);
  perform set_config('app.validated_award_nomination','true',true);
  insert into contact_messages(name,email,organization,reason,message)
    values(trim(p_name),trim(p_email),null,'AWARD NOMINATION · ' || upper(p_ray_label),message_text);
  perform set_config('app.validated_award_nomination','false',true);
end $$;
revoke all on function public.submit_award_nomination(text,text,text,text,jsonb,text,text) from public;
grant execute on function public.submit_award_nomination(text,text,text,text,jsonb,text,text) to anon, authenticated;
-- Public inbox inserts must use the structured, validated award API.
create function public.require_validated_award_nomination() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.reason like 'AWARD NOMINATION%' and coalesce(current_setting('app.validated_award_nomination',true),'') <> 'true' then
    raise exception 'Please submit award nominations through the nomination form.';
  end if;
  return new;
end $$;
create trigger validated_award_nomination before insert on public.contact_messages
for each row execute function public.require_validated_award_nomination();
commit;
