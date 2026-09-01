-- Repair literal backslash-n sequences saved by earlier SQL copies.
update public.award_site_content
set subheadline = replace(subheadline, E'\\n', E'\n'),
    body = replace(body, E'\\n', E'\n'),
    updated_at = now()
where locale = 'en'
  and content_key in ('v3_hero', 'v3_hero_images', 'v3_scale');
