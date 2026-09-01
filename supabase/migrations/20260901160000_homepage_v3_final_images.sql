-- Apply the supplied final Supabase imagery to Homepage V3 CMS slots.
update public.award_site_content as content
set media_url = images.media_url,
    media_path = images.media_path,
    updated_at = now()
from (values
  ('v3_principle', 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/principle.png', 'V3/principle.png'),
  ('v3_principle_philanthropy', 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/philantropy.png', 'V3/philantropy.png'),
  ('v3_principle_new_focus', 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/new%20focus.png', 'V3/new focus.png'),
  ('v3_principle_echo', 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/echo.png', 'V3/echo.png'),
  ('v3_principle_momentum', 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/momentum.png', 'V3/momentum.png'),
  ('v3_principle_legacy', 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/legacy.png', 'V3/legacy.png'),
  ('v3_scale', 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/scale-of-impact.png', 'V3/scale-of-impact.png'),
  ('v3_question', 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/closing-question-background.png', 'V3/closing-question-background.png')
) as images(content_key, media_url, media_path)
where content.content_key = images.content_key
  and content.locale = 'en';
