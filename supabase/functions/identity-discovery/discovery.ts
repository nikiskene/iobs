// supabase/functions/identity-discovery/discovery.ts
import { recordSourceHealth } from './db.ts';
import type { EntityRow, SourceRow, getSupabase } from './db.ts';
import { buildGdeltQueries, hashContent, searchGdelt } from './gdelt.ts';
import { buildHeuristicCandidate, matchEntities, matchOfficialEntities } from './extraction.ts';
import type { CandidateSignal } from './extraction.ts';
import { fetchOfficialFeed } from './officialFeeds.ts';
import { prioritizeArticles } from './relevance.ts';

const MAX_GDELT_RECORDS = 50;
const MAX_RAW_CANDIDATES = 1200;
const GDELT_DELAY_MS = 6000;

export type DiscoveryCounts = {
  documents_found: number;
  documents_screened_in: number;
  official_documents: number;
  discovery_documents: number;
  source_errors: number;
};

export async function discoverCandidates(
  supabase: ReturnType<typeof getSupabase>,
  entities: EntityRow[],
  sources: SourceRow[],
): Promise<{ candidates: CandidateSignal[]; counts: DiscoveryCounts }> {
  const counts: DiscoveryCounts = {
    documents_found: 0,
    documents_screened_in: 0,
    official_documents: 0,
    discovery_documents: 0,
    source_errors: 0,
  };
  const seen = new Set<string>();
  const candidates: CandidateSignal[] = [];
  const officialSources = sources.filter((source) =>
    source.source_tier === 'primary'
    && source.automation_allowed
    && source.rights_status === 'allowed'
    && source.feed_url
  );

  await Promise.all(officialSources.map(async (source) => {
    try {
      const articles = await fetchOfficialFeed(source);
      counts.documents_found += articles.length;
      await recordSourceHealth(supabase, source.id, articles.length);
      const screened = prioritizeArticles(articles, 60);
      counts.documents_screened_in += screened.length;
      const owners = matchOfficialEntities(source, entities);
      for (const article of screened) {
        addArticle(article, source, owners, entities, seen, candidates);
        counts.official_documents++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown source error';
      counts.source_errors++;
      await recordSourceHealth(supabase, source.id, 0, message);
    }
  }));

  const queries = buildGdeltQueries(entities);
  for (let index = 0; index < queries.length && candidates.length < MAX_RAW_CANDIDATES; index++) {
    if (index > 0) await sleep(GDELT_DELAY_MS);
    try {
      const articles = await searchGdelt(queries[index], MAX_GDELT_RECORDS);
      counts.documents_found += articles.length;
      const screened = prioritizeArticles(articles, MAX_GDELT_RECORDS);
      counts.documents_screened_in += screened.length;
      for (const article of screened) {
        addArticle(article, null, [], entities, seen, candidates);
        counts.discovery_documents++;
      }
    } catch (error) {
      console.error('GDELT query failed', error);
      counts.source_errors++;
    }
  }
  return { candidates: candidates.slice(0, MAX_RAW_CANDIDATES), counts };
}

function addArticle(
  article: Parameters<typeof matchEntities>[0],
  source: SourceRow | null,
  owners: EntityRow[],
  entities: EntityRow[],
  seen: Set<string>,
  candidates: CandidateSignal[],
): void {
  const hash = hashContent(article.url, article.title);
  if (seen.has(hash)) return;
  seen.add(hash);
  const matched = owners.length ? owners : matchEntities(article, entities);
  for (const entity of matched) {
    candidates.push(buildHeuristicCandidate(article, entity, source));
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
