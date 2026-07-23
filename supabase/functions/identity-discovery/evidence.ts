// supabase/functions/identity-discovery/evidence.ts
import type { CandidateSignal } from './extraction.ts';

const CONCURRENCY = 5;
const MAX_ANALYSIS_CHARS = 12000;

export async function enrichEvidence(
  candidates: CandidateSignal[],
): Promise<{ candidates: CandidateSignal[]; retrieved: number; failed: number }> {
  const cache = new Map<string, Promise<string | null>>();
  const retrievedUrls = new Set<string>();
  const failedUrls = new Set<string>();
  let cursor = 0;

  async function worker() {
    while (cursor < candidates.length) {
      const candidate = candidates[cursor++];
      if (!candidate.document.retrieval_allowed) continue;
      const url = candidate.document.canonical_url;
      if (!cache.has(url)) cache.set(url, retrieveText(url));
      const text = await cache.get(url)!;
      if (text) {
        candidate.document.analysis_text = text;
        retrievedUrls.add(url);
      } else {
        failedUrls.add(url);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, candidates.length) }, worker));
  return { candidates, retrieved: retrievedUrls.size, failed: failedUrls.size };
}

async function retrieveText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'WorldOS-Identity-Research/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('html')) return null;
    const html = await response.text();
    const text = readableText(html);
    return text.length >= 120 ? text : null;
  } catch {
    return null;
  }
}

function readableText(html: string): string {
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]
    ?? html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]
    ?? html;
  return decode(article
    .replace(/<(script|style|nav|header|footer|svg|form)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(br|\/p|\/li|\/h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length >= 30)
    .join('\n')
    .slice(0, MAX_ANALYSIS_CHARS);
}

function decode(value: string): string {
  return value
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}
