-- supabase/migrations/20260813190000_contact_messages.sql
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  organization text check (organization is null or char_length(organization) <= 200),
  reason text not null check (char_length(reason) between 1 and 120),
  message text not null check (char_length(message) between 1 and 5000),
  status text not null default 'new' check (status in ('new','in_progress','answered','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "public can submit contact messages"
  on public.contact_messages for insert to anon, authenticated
  with check (status = 'new');

create policy "admins can read contact messages"
  on public.contact_messages for select to authenticated
  using (public.identity_is_admin());

create policy "admins can update contact messages"
  on public.contact_messages for update to authenticated
  using (public.identity_is_admin()) with check (public.identity_is_admin());

revoke all on public.contact_messages from anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, update on public.contact_messages to authenticated;
