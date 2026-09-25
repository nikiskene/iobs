begin;

create table public.recognition_settings (
  id boolean primary key default true check (id),
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.recognition_settings (id, is_active)
values (true, false)
on conflict (id) do nothing;

create table public.recognitions (
  id uuid primary key default gen_random_uuid(),
  company_name text not null check (char_length(btrim(company_name)) between 1 and 160),
  acknowledgement text not null check (char_length(btrim(acknowledgement)) between 1 and 600),
  photo_url text not null default '' check (photo_url = '' or photo_url ~* '^https?://'),
  photo_path text,
  photo_alt text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recognitions_public_order_idx on public.recognitions (display_order, created_at)
  where status = 'published';

create or replace function public.touch_recognition_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_recognition_updated_at
before update on public.recognitions
for each row execute function public.touch_recognition_updated_at();

create or replace function public.touch_recognition_settings_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_recognition_settings_updated_at
before update on public.recognition_settings
for each row execute function public.touch_recognition_settings_updated_at();

alter table public.recognition_settings enable row level security;
alter table public.recognitions enable row level security;

grant select on public.recognition_settings, public.recognitions to anon, authenticated;
grant insert, update, delete on public.recognition_settings, public.recognitions to authenticated;

create policy "Recognition switch is public only when active"
on public.recognition_settings for select to anon, authenticated
using (is_active = true);

create policy "Published recognitions are public when switch is active"
on public.recognitions for select to anon, authenticated
using (
  status = 'published'
  and exists (select 1 from public.recognition_settings where id = true and is_active = true)
);

create policy "Administrators manage recognition settings"
on public.recognition_settings for all to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

create policy "Administrators manage recognitions"
on public.recognitions for all to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recognition-photos', 'recognition-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Administrators upload recognition photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'recognition-photos' and public.is_admin((select auth.uid())));

create policy "Administrators update recognition photos"
on storage.objects for update to authenticated
using (bucket_id = 'recognition-photos' and public.is_admin((select auth.uid())))
with check (bucket_id = 'recognition-photos' and public.is_admin((select auth.uid())));

create policy "Administrators delete recognition photos"
on storage.objects for delete to authenticated
using (bucket_id = 'recognition-photos' and public.is_admin((select auth.uid())));

create policy "Administrators read recognition photo records"
on storage.objects for select to authenticated
using (bucket_id = 'recognition-photos' and public.is_admin((select auth.uid())));

revoke all on function public.touch_recognition_updated_at() from public, anon, authenticated;
revoke all on function public.touch_recognition_settings_updated_at() from public, anon, authenticated;

commit;
