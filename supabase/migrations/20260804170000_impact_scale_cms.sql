-- supabase/migrations/20260804170000_impact_scale_cms.sql
create table if not exists public.impact_scales (
  slug text primary key check (slug in ('me','circle','teams','organizations','society','world')),
  label text not null,
  position integer not null unique check (position between 1 and 6),
  eyebrow text not null default '',
  title text not null default '',
  introduction text not null default '',
  i_am text not null default '',
  i_can_be text not null default '',
  what_to_do text not null default '',
  knob_image_url text not null,
  icon_url text,
  text_image_url text,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.thesis_impact_scales (
  thesis_id uuid not null references public.theses(id) on delete cascade,
  scale_slug text not null references public.impact_scales(slug) on delete cascade,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  primary key (thesis_id, scale_slug)
);

alter table public.impact_scales enable row level security;
alter table public.thesis_impact_scales enable row level security;

create policy "Public reads published impact scales" on public.impact_scales
  for select using (is_published);
create policy "Admins manage impact scales" on public.impact_scales
  for all to authenticated using (public.identity_is_admin()) with check (public.identity_is_admin());
create policy "Public reads thesis scale links" on public.thesis_impact_scales
  for select using (true);
create policy "Admins manage thesis scale links" on public.thesis_impact_scales
  for all to authenticated using (public.identity_is_admin()) with check (public.identity_is_admin());

grant select on public.impact_scales, public.thesis_impact_scales to anon, authenticated;
grant insert, update, delete on public.impact_scales, public.thesis_impact_scales to authenticated;

insert into public.impact_scales
  (slug,label,position,eyebrow,title,introduction,i_am,i_can_be,what_to_do,knob_image_url,icon_url,text_image_url)
values
  ('me','Me',1,'A private beginning','What would you build if success could be beautiful?','Every world begins with a person willing to imagine a different life.','The author of my identity, attention and direction.','More intentional, more alive and more fully myself.','Explore public tours, intimate talks and personal expeditions.','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/Pos%20me.png','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/justmepic.png','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/justmetxt.png'),
  ('circle','My Circle',2,'The intimate world','Every relationship creates a tiny civilization.','Beautiful success grows through the people who shape and challenge us.','A friend, peer, partner and participant in something shared.','Part of a circle where candour, imagination and belonging flourish.','Join salons, shared journeys and small-group encounters.','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/Pos1.png',null,null),
  ('teams','Teams',3,'The shared endeavour','Turn a group of people into a beautiful force.','Teams are where identity becomes trust, rhythm and collective possibility.','A contributor to a purpose none of us can reach alone.','Part of a team that combines excellence with humanity.','Enter workshops, facilitated sessions and team expeditions.','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/Pos%202.png',null,null),
  ('organizations','Organizations',4,'The living institution','Build the organization people wish existed.','Organizations turn repeated choices into culture, systems and consequence.','A steward of culture, resources and institutional possibility.','Part of an organization designed around a more generous definition of success.','Explore custom programmes, leadership journeys and institutional expeditions.','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/Pos%203.png',null,null),
  ('society','Society',5,'The civic imagination','Make society feel newly possible.','Communities, cities and industries are stories made durable through systems.','A citizen and co-designer of the structures around me.','Part of a place that rewards participation, dignity and imagination.','Discover civic programmes, public events and system-level cases.','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/Pos%204.png','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/mycommunitypic.png','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/mycommunitytxt.png'),
  ('world','World',6,'The beautiful impossible','The whole world is still ours to imagine.','At the widest scale, beautiful success becomes a civilizational proposition.','A temporary custodian of a living planet and a shared future.','Part of a civilization worthy of its extraordinary potential.','Enter flagship gatherings, global expeditions and transformative questions.','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/pos%20world.png','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/wholeworldglobe.png','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/wholeworldtext.png')
on conflict (slug) do nothing;
