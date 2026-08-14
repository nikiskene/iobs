-- supabase/migrations/20260814143000_refresh_beautiful_success_hero_copy.sql
-- Bring the impact-scale CMS copy in line with the current Beautiful Success homepage.
-- Legacy WorldOS fields remain untouched for compatibility.

update public.impact_scales set
  label = 'Just Me',
  eyebrow = 'A private beginning',
  title = 'What would you celebrate as success?',
  updated_at = now()
where slug = 'me';

update public.impact_scales set
  label = 'My Community',
  eyebrow = 'The intimate world',
  title = 'What would your community celebrate as success?',
  updated_at = now()
where slug = 'circle';

update public.impact_scales set
  label = 'My Team',
  eyebrow = 'The shared endeavour',
  title = 'What would your team celebrate as success?',
  updated_at = now()
where slug = 'teams';

update public.impact_scales set
  label = 'My Company',
  eyebrow = 'The living institution',
  title = 'What would your company celebrate as success?',
  updated_at = now()
where slug = 'organizations';

update public.impact_scales set
  label = 'My Country',
  eyebrow = 'The national imagination',
  title = 'What would your country celebrate as success?',
  updated_at = now()
where slug = 'country';

update public.impact_scales set
  label = 'The World',
  eyebrow = 'The beautiful possible',
  title = 'What would our world celebrate as success?',
  updated_at = now()
where slug = 'society';

update public.impact_scales set
  label = 'Beyond World',
  eyebrow = 'The beautiful impossible',
  title = 'What would the universe celebrate as success?',
  updated_at = now()
where slug = 'world';
