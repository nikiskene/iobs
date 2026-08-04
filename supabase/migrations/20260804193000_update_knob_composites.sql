-- supabase/migrations/20260804193000_update_knob_composites.sql
update public.impact_scales
set label = 'Just Me',
    knob_image_url = 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/Just%20me%20Knob.png',
    icon_url = null,
    text_image_url = null
where slug = 'me';

update public.impact_scales
set label = 'My Community',
    knob_image_url = 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/My%20community%20Knob.png',
    icon_url = null,
    text_image_url = null
where slug = 'circle';

update public.impact_scales
set label = 'My Team',
    knob_image_url = 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/My%20Team%20Knob.png'
where slug = 'teams';

update public.impact_scales
set label = 'My Company',
    knob_image_url = 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/my%20company%20knob.png'
where slug = 'organizations';

update public.impact_scales
set label = 'The World',
    eyebrow = 'The beautiful possible',
    title = 'The whole world is still ours to imagine.',
    introduction = 'At the widest human scale, beautiful success becomes a civilizational proposition.',
    i_am = 'A temporary custodian of a living planet and a shared future.',
    i_can_be = 'Part of a civilization worthy of its extraordinary potential.',
    what_to_do = 'Enter flagship gatherings, global expeditions and transformative questions.',
    knob_image_url = 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/world%20knob.png',
    icon_url = null,
    text_image_url = null
where slug = 'society';

update public.impact_scales
set label = 'Beyond World',
    eyebrow = 'The beautiful impossible',
    title = 'What becomes possible beyond the world we know?',
    introduction = 'The final position is the courage to imagine beyond inherited limits.',
    i_am = 'An explorer at the edge of what humanity believes it can become.',
    i_can_be = 'Part of a future that does not yet have a name.',
    what_to_do = 'Enter speculative gatherings, frontier expeditions and impossible questions.',
    knob_image_url = 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/Beyond%20World.png',
    icon_url = null,
    text_image_url = null
where slug = 'world';
