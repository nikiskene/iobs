// supabase/functions/identity-discovery/gdelt.ts
export type GdeltArticle = {
  url: string;
  title: string;
  snippet: string | null;
  publishedAt: string | null;
  language: string | null;
  domain: string | null;
  sourceName: string | null;
};

const IDENTITY_PATTERNS = [
  'we are',
  'we will become',
  'our purpose',
  'our mission',
  'we believe',
  'we stand for',
  'committed to',
  'future of',
  'new direction',
  'is becoming',
  'repositions',
  'shifts from',
  'aims to be',
];

type RawGdeltArticle = {
  url?: string;
  title?: string;
  seendate?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
};

function buildQuery(entities: { name: string; aliases: string[] }[]): string {
  const names = entities.flatMap((entity) => [entity.name, ...entity.aliases].slice(0, 1))
    .map((name) => `"${name}"`);
  const namePart = `(${names.join(' OR ')})`;
  const keyPatterns = ['"we are"', '"our purpose"', '"our mission"', '"future of"', '"committed to"', '"is becoming"', '"aims to be"'];
  const patternGroup = `(${keyPatterns.join(' OR ')})`;
  return `${namePart} AND ${patternGroup}`;
}

export function buildGdeltQueries(
  entities: { name: string; aliases: string[] }[],
  maxEntities = entities.length,
): string[] {
  const selected = entities.slice(0, maxEntities);
  const groups = [];
  for (let offset = 0; offset < selected.length; offset += 5) {
    groups.push(buildQuery(selected.slice(offset, offset + 5)));
  }
  return groups;
}

function parseGdeltDate(seendate: string | undefined): string | null {
  if (!seendate) return null;
  // GDELT format: 20260722T174500Z
  const m = seendate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
}

export async function searchGdelt(
  query: string,
  maxRecords = 50,
): Promise<GdeltArticle[]> {
  const params = new URLSearchParams({
    query,
    mode: 'ArtList',
    maxrecords: String(maxRecords),
    format: 'json',
    sort: 'DateDesc',
  });
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params}`;
  const resp = await fetch(url, { headers: { 'User-Agent': 'WorldOS-Identity-Research/1.0' } });
  if (!resp.ok) {
    throw new Error(`GDELT returned ${resp.status}`);
  }
  const text = await resp.text();
  if (!text.trim()) return [];
  if (text.includes('limit requests') || !text.trim().startsWith('{')) return [];
  let data: { articles?: RawGdeltArticle[] };
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }
  return (data.articles ?? []).slice(0, maxRecords).map((a) => ({
    url: a.url ?? '',
    title: a.title ?? '',
    snippet: null,
    publishedAt: parseGdeltDate(a.seendate),
    language: a.language ?? null,
    domain: a.domain ?? null,
    sourceName: a.sourcecountry ?? null,
  }));
}

export function hashContent(url: string, title: string): string {
  const input = `${url}::${title}`.toLowerCase().trim();
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

export function isIdentityHeadline(title: string): boolean {
  const lower = title.toLowerCase();
  if (lower.startsWith('there is') || lower.startsWith('there are')) return false;
  return IDENTITY_PATTERNS.some((p) => lower.includes(p));
}
