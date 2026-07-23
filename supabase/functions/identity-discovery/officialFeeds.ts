// supabase/functions/identity-discovery/officialFeeds.ts
import type { SourceRow } from './db.ts';
import type { GdeltArticle } from './gdelt.ts';

const MAX_FEED_ITEMS = 60;
const MAX_AGE_DAYS = 8;

export async function fetchOfficialFeed(source: SourceRow): Promise<GdeltArticle[]> {
  if (!source.feed_url) return [];
  const response = await fetch(source.feed_url, {
    headers: {
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      'User-Agent': 'WorldOS-Identity-Research/1.0',
    },
  });
  if (!response.ok) throw new Error(`${source.name} feed returned ${response.status}`);
  const xml = await response.text();
  if (!/<(?:rss|feed|rdf:RDF)[\s>]/i.test(xml)) throw new Error(`${source.name} did not return RSS or Atom`);
  return parseFeed(xml, source).filter(isRecent).slice(0, MAX_FEED_ITEMS);
}

function parseFeed(xml: string, source: SourceRow): GdeltArticle[] {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi)
    ?? xml.match(/<entry\b[\s\S]*?<\/entry>/gi)
    ?? [];
  return blocks.flatMap((block) => {
    const title = clean(readTag(block, 'title'));
    const url = readLink(block);
    if (!title || !url) return [];
    return [{
      url,
      title,
      snippet: clean(readTag(block, 'description') || readTag(block, 'summary') || readTag(block, 'content')).slice(0, 500) || null,
      publishedAt: parseDate(readTag(block, 'pubDate') || readTag(block, 'published') || readTag(block, 'updated')),
      language: 'English',
      domain: source.domain,
      sourceName: source.name,
    }];
  });
}

function readTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match?.[1] ?? '';
}

function readLink(block: string): string {
  const atom = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
  return clean(atom || readTag(block, 'link') || readTag(block, 'guid'));
}

function clean(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}

function parseDate(value: string): string | null {
  const timestamp = Date.parse(clean(value));
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function isRecent(article: GdeltArticle): boolean {
  if (!article.publishedAt) return true;
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  return new Date(article.publishedAt).getTime() >= cutoff;
}
