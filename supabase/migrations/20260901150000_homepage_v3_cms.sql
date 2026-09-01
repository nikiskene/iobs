-- Homepage V3 copy and replaceable Supabase-hosted image slots.
insert into public.award_site_content
  (content_key, locale, section, label, headline, subheadline, body, media_url, media_path, display_order, is_active)
values
  ('v3_hero','en','homepage_v3','The Institute of Beautiful Success','Beautiful Success',E'Success is not the problem.\nOur definition of it is.','Discover the Institute',null,null,200,true),
  ('v3_hero_images','en','homepage_v3',null,null,null,
   'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/01.png\nhttps://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/02.png\nhttps://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/03.png\nhttps://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/04.png\nhttps://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/05.png\nhttps://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/06.png\nhttps://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/07.png\nhttps://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/08.png\nhttps://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/09.png\nhttps://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/10.png\nhttps://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/11.png\nhttps://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/12.png',null,null,210,true),
  ('v3_principle','en','homepage_v3','02 — The Principle','The more successful it becomes, the better the world becomes.',null,'For humans. For non-humans. For society. For the planet. For what comes after us.','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/principle.png','V3/principle.png',220,true),
  ('v3_principles_intro','en','homepage_v3','03','The five principles that define Beautiful Success',null,null,null,null,225,true),
  ('v3_principle_philanthropy','en','homepage_v3','Philanthropy','What can I offer?',null,null,'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/philantropy.png','V3/philantropy.png',230,true),
  ('v3_principle_new_focus','en','homepage_v3','New Focus','What can I create?',null,null,'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/new%20focus.png','V3/new focus.png',240,true),
  ('v3_principle_echo','en','homepage_v3','Echo','Whose choices do I influence?',null,null,'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/echo.png','V3/echo.png',250,true),
  ('v3_principle_momentum','en','homepage_v3','Momentum','What can my assets set in motion?',null,null,'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/momentum.png','V3/momentum.png',260,true),
  ('v3_principle_legacy','en','homepage_v3','Legacy','What outlasts me?',null,null,'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/legacy.png','V3/legacy.png',270,true),
  ('v3_scale','en','homepage_v3','04 — The Scale of Impact','How far does your success reach?','Scale is not score.',E'Beautiful Success is not measured by how large it becomes.\nScale tells us how far it reaches.\nThe principles tell us whether it is beautiful.','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/scale-of-impact.png','V3/scale-of-impact.png',280,true),
  ('v3_question','en','homepage_v3','05','If you could build anything in the world…','what would you build?','Explore the Institute|Nominate / Enter','https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/closing-question-background.png','V3/closing-question-background.png',290,true)
on conflict (content_key, locale) do update set
  section = excluded.section,
  label = excluded.label,
  headline = excluded.headline,
  subheadline = excluded.subheadline,
  body = excluded.body,
  media_url = excluded.media_url,
  media_path = excluded.media_path,
  display_order = excluded.display_order,
  is_active = excluded.is_active,
  updated_at = now();
