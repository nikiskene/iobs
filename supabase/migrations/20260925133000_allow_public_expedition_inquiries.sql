begin;

grant insert on public.expedition_inquiries to anon, authenticated;

alter table public.expedition_inquiries
  alter column company drop not null,
  alter column position drop not null,
  alter column linkedin_url drop not null,
  alter column motivation drop not null,
  alter column contribution drop not null,
  alter column curiosity_question drop not null;

drop policy if exists "Anyone can submit expedition inquiries" on public.expedition_inquiries;
create policy "Anyone can submit expedition inquiries"
on public.expedition_inquiries
for insert
to anon, authenticated
with check (
  user_id is null
  and status = 'new'
  and char_length(btrim(name)) > 0
  and char_length(btrim(email)) > 0
);

commit;
