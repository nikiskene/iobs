begin;
create table public.media_waivers (
  id uuid primary key,
  full_name text not null check (length(trim(full_name)) between 1 and 120),
  email text not null check (length(email) between 3 and 200),
  accepted boolean not null check (accepted),
  legal_version text not null,
  legal_text text not null,
  signature_path text not null unique,
  signed_at timestamptz not null default now()
);
alter table public.media_waivers enable row level security;
revoke all on public.media_waivers from anon, authenticated;
grant select on public.media_waivers to authenticated;
create policy "Team reads signed waivers" on public.media_waivers for select to authenticated
  using (public.has_team_momentum_access());
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('waiver-signatures', 'waiver-signatures', false, 300000, array['image/png']);
create policy "Team reads waiver signatures" on storage.objects for select to authenticated
using (bucket_id = 'waiver-signatures' and public.has_team_momentum_access());
-- Service-only rate limiter. No public table or signature writes are allowed.
create table public.waiver_request_limits (request_key text primary key, window_start timestamptz not null, requests integer not null);
alter table public.waiver_request_limits enable row level security;
revoke all on public.waiver_request_limits from anon, authenticated;
create function public.waiver_allow_request(request_key text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  insert into public.waiver_request_limits as limits values ($1, now(), 1)
  on conflict on constraint waiver_request_limits_pkey do update set
    requests = case when limits.window_start < now() - interval '10 minutes' then 1 else limits.requests + 1 end,
    window_start = case when limits.window_start < now() - interval '10 minutes' then now() else limits.window_start end
  returning requests into n;
  delete from public.waiver_request_limits where window_start < now() - interval '1 day';
  return n <= 10;
end;
$$;
revoke all on function public.waiver_allow_request(text) from public, anon, authenticated;
grant execute on function public.waiver_allow_request(text) to service_role;
commit;
