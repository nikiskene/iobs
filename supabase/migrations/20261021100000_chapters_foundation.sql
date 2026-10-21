begin;
create table if not exists public.chapters (
 id uuid primary key default gen_random_uuid(),
 name text not null unique,
 city text not null,
 country text not null default '',
 continent text not null,
 latitude double precision not null check (latitude between -90 and 90),
 longitude double precision not null check (longitude between -180 and 180),
 place_id text,
 email text not null default '',
 headline text not null default '',
 hero_image_url text not null default '',
 head_member_id uuid references public.team_people(id) on delete set null,
 status text not null default 'draft' check (status in ('draft','active')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.chapter_members (
 chapter_id uuid not null references public.chapters(id) on delete cascade,
 member_id uuid not null references public.team_people(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(chapter_id,member_id)
);
alter table public.chapters enable row level security;
alter table public.chapter_members enable row level security;
create policy "Public active chapters" on public.chapters for select to anon,authenticated using (status='active' or public.is_admin((select auth.uid())) or exists (select 1 from public.profiles p where p.id=auth.uid() and p.member_id=head_member_id));
create policy "Admin manages chapters" on public.chapters for all to authenticated using (public.is_admin((select auth.uid()))) with check (public.is_admin((select auth.uid())));
create policy "Heads edit own chapters" on public.chapters for update to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.member_id=head_member_id)) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.member_id=head_member_id));
create policy "Admin or chapter head reads membership" on public.chapter_members for select to authenticated using (public.is_admin((select auth.uid())) or exists(select 1 from public.chapters c join public.profiles p on p.member_id=c.head_member_id where c.id=chapter_id and p.id=auth.uid()));
create policy "Admin manages chapter membership" on public.chapter_members for all to authenticated using (public.is_admin((select auth.uid()))) with check (public.is_admin((select auth.uid())));
create policy "Heads manage chapter membership" on public.chapter_members for all to authenticated using (exists(select 1 from public.chapters c join public.profiles p on p.member_id=c.head_member_id where c.id=chapter_id and p.id=auth.uid())) with check (exists(select 1 from public.chapters c join public.profiles p on p.member_id=c.head_member_id where c.id=chapter_id and p.id=auth.uid()));
alter table public.events add column if not exists category text not null default 'workshop' check (category in ('tour','workshop','chapter_event'));
alter table public.events add column if not exists chapter_id uuid references public.chapters(id) on delete restrict;
alter table public.events add column if not exists ticket_price_cents integer not null default 0 check(ticket_price_cents>=0);
alter table public.events add column if not exists ticket_currency text not null default 'EUR';
alter table public.events add constraint chapter_event_requires_chapter check ((category='chapter_event' and chapter_id is not null) or (category<>'chapter_event' and chapter_id is null));
create table if not exists public.event_registrations (
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.events(id) on delete cascade,
 member_id uuid references public.team_people(id) on delete set null,
 attendee_name text not null,
 attendee_email text not null,
 payment_status text not null default 'pending' check(payment_status in ('pending','paid','free','refunded','failed')),
 stripe_checkout_session_id text unique,
 created_at timestamptz not null default now()
);
alter table public.event_registrations enable row level security;
create policy "Authorized event managers read registrations" on public.event_registrations for select to authenticated using (public.is_admin((select auth.uid())) or exists(select 1 from public.events e join public.chapters c on c.id=e.chapter_id join public.profiles p on p.member_id=c.head_member_id where e.id=event_id and p.id=auth.uid()));
create index if not exists chapter_members_member_idx on public.chapter_members(member_id);
create index if not exists events_chapter_idx on public.events(chapter_id,start_date);
create index if not exists registrations_event_idx on public.event_registrations(event_id);
commit;