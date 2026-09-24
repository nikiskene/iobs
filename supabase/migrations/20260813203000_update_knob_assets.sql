-- supabase/migrations/20260813203000_update_knob_assets.sql
update public.impact_scales
set knob_image_url = case slug
  when 'me' then 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/knobs/Just%20me%20Knob.png'
  when 'circle' then 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/knobs/My%20community%20Knob.png'
  when 'teams' then 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/knobs/My%20Team%20Knob.png'
  when 'organizations' then 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/knobs/my%20company%20knob.png'
  when 'country' then 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/knobs/country%20knob.png'
  when 'society' then 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/knobs/world%20knob.png'
  when 'world' then 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/knobs/Beyond%20World.png'
  else knob_image_url
end,
updated_at = now()
where slug in ('me','circle','teams','organizations','country','society','world');
