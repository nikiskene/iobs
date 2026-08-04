-- supabase/migrations/20260804203000_add_country_impact_scale.sql
alter table public.impact_scales drop constraint if exists impact_scales_slug_check;
alter table public.impact_scales drop constraint if exists impact_scales_position_check;

update public.impact_scales set position = position + 10 where position >= 5;
update public.impact_scales set position = 6 where slug = 'society';
update public.impact_scales set position = 7 where slug = 'world';

insert into public.impact_scales
  (slug,label,position,eyebrow,title,introduction,i_am,i_can_be,what_to_do,knob_image_url)
values
  ('country','My Country',5,'The national imagination',
   'What could a country make beautifully possible?',
   'A country is a shared promise expressed through culture, institutions and choice.',
   'A citizen with a stake in the character and direction of my country.',
   'Part of a nation that turns belonging into possibility.',
   'Explore national cases, public programmes and civic expeditions.',
   'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/country%20knob.png')
on conflict (slug) do update set
  label = excluded.label,
  position = excluded.position,
  eyebrow = excluded.eyebrow,
  title = excluded.title,
  introduction = excluded.introduction,
  i_am = excluded.i_am,
  i_can_be = excluded.i_can_be,
  what_to_do = excluded.what_to_do,
  knob_image_url = excluded.knob_image_url;

alter table public.impact_scales
  add constraint impact_scales_slug_check
  check (slug in ('me','circle','teams','organizations','country','society','world'));
alter table public.impact_scales
  add constraint impact_scales_position_check check (position between 1 and 7);
