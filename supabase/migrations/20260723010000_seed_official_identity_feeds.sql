-- supabase/migrations/20260723010000_seed_official_identity_feeds.sql
-- Begin with a small set of verified official RSS or Atom feeds.

insert into public.identity_sources
  (name, domain, source_tier, region, country_code, languages, feed_url, active, automation_allowed, terms_notes)
select
  'Apple Newsroom', 'apple.com', 'primary', 'north_america', 'US', array['en'],
  'https://www.apple.com/newsroom/rss-feed.rss', true, true,
  'Official corporate newsroom Atom feed; retain title, short excerpt, URL, and provenance only.'
where not exists (select 1 from public.identity_sources where domain = 'apple.com');

insert into public.identity_sources
  (name, domain, source_tier, region, country_code, languages, feed_url, active, automation_allowed, terms_notes)
select
  'Google Company News', 'blog.google', 'primary', 'north_america', 'US', array['en'],
  'https://blog.google/company-news/rss/', true, true,
  'Official corporate RSS feed; retain title, short excerpt, URL, and provenance only.'
where not exists (select 1 from public.identity_sources where domain = 'blog.google');

update public.identity_sources
set feed_url = 'https://www.apple.com/newsroom/rss-feed.rss',
    automation_allowed = true
where domain = 'apple.com';

update public.identity_sources
set feed_url = 'https://blog.google/company-news/rss/',
    automation_allowed = true
where domain in ('google.com', 'blog.google');

update public.identity_sources
set feed_url = 'https://www.gov.uk/search/news-and-communications.atom',
    automation_allowed = true
where domain = 'gov.uk';

update public.identity_sources
set feed_url = 'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
    automation_allowed = true
where domain = 'un.org';

update public.identity_sources
set feed_url = 'https://www.whitehouse.gov/news/feed/',
    automation_allowed = true
where domain = 'whitehouse.gov';
