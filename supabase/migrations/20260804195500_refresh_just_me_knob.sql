-- supabase/migrations/20260804195500_refresh_just_me_knob.sql
update public.impact_scales
set knob_image_url = 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/Just%20me%20Knob.png?v=2'
where slug = 'me';
