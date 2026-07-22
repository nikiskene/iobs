-- supabase/migrations/20260722233000_identity_schedule_and_visibility.sql
alter type identity_visibility add value if not exists 'team';
alter type identity_visibility add value if not exists 'explorers';

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create table if not exists identity_settings (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default true,
  scan_hour_utc smallint not null default 5 check (scan_hour_utc between 0 and 23),
  retention_days smallint not null default 7 check (retention_days between 1 and 30),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
alter table identity_settings enable row level security;
insert into identity_settings (singleton) values (true) on conflict do nothing;
create policy "Admins manage identity settings" on identity_settings for all to authenticated
using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

do $$
begin
  if exists (select 1 from cron.job where jobname = 'worldos-identity-daily') then
    perform cron.unschedule('worldos-identity-daily');
  end if;
end $$;

select cron.schedule(
  'worldos-identity-daily',
  '5 * * * *',
  $schedule$
  select net.http_post(
    url := 'https://bunfdlazirfheomhvjdz.supabase.co/functions/v1/identity-discovery',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'identity_cron_secret')
    ),
    body := '{"mode":"scheduled"}'::jsonb
  );
  $schedule$
);
