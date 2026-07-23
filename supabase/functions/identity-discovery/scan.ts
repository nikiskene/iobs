// supabase/functions/identity-discovery/scan.ts
import {
  completeScanRun,
  createScanRun,
  failScanRun,
  getSupabase,
  loadEntities,
  loadSources,
} from './db.ts';
import { buildGdeltQueries, hashContent, searchGdelt } from './gdelt.ts';
import {
  buildHeuristicCandidate,
  matchEntities,
  matchOfficialEntities,
  type CandidateSignal,
} from './extraction.ts';
import { extractWithOpenAI } from './aiExtraction.ts';
import { fetchOfficialFeed } from './officialFeeds.ts';
import { storeDocument, storeSignal } from './storage.ts';
import { applyRetention } from './retention.ts';

const MAX_ENTITIES = 3;
const MAX_GDELT_RECORDS = 50;
const MAX_DOCUMENTS = 20;
const MAX_SIGNALS = 20;
const GDELT_DELAY_MS = 6000;

export type ScanResult = {
  ok: boolean;
  message: string;
  runId: string;
  counts: Record<string, number>;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runScan(mode: string): Promise<ScanResult> {
  const supabase = getSupabase();
  const retention = await applyRetention(supabase);
  const entities = await loadEntities(supabase);
  const sources = await loadSources(supabase);

  const gdeltSource = sources.find((s) => s.source_tier === 'discovery' && s.automation_allowed);
  const scope = {
    entity_count: entities.length,
    source_count: sources.length,
    discovery_source: gdeltSource?.name ?? 'GDELT',
    max_entities: MAX_ENTITIES,
    max_documents: MAX_DOCUMENTS,
    retention,
  };
  const runId = await createScanRun(supabase, mode, scope);

  try {
    const counts = {
      documents_found: 0,
      documents_stored: 0,
      clusters: 0,
      candidate_signals: 0,
      ai_candidates: 0,
      heuristic_candidates: 0,
      extraction_errors: 0,
      official_documents: 0,
      source_errors: 0,
    };

    const queries = buildGdeltQueries(entities, MAX_ENTITIES);
    const seenHashes = new Set<string>();
    const candidates: CandidateSignal[] = [];

    const officialSources = sources.filter((source) =>
      source.source_tier === 'primary' && source.automation_allowed && source.feed_url
    );
    for (const source of officialSources) {
      try {
        const articles = await fetchOfficialFeed(source);
        const sourceEntities = matchOfficialEntities(source, entities);
        counts.documents_found += articles.length;
        for (const article of articles) {
          const hash = hashContent(article.url, article.title);
          if (seenHashes.has(hash)) continue;
          seenHashes.add(hash);
          for (const entity of sourceEntities.length ? sourceEntities : matchEntities(article, entities)) {
            candidates.push(buildHeuristicCandidate(article, entity, source));
            counts.official_documents++;
          }
        }
      } catch (error) {
        console.error('Official feed failed', source.name, error);
        counts.source_errors++;
      }
    }

    for (let i = 0; i < queries.length && candidates.length < MAX_DOCUMENTS; i++) {
      const entity = entities[i];
      if (!entity) continue;
      if (i > 0) await sleep(GDELT_DELAY_MS);

      let articles;
      try {
        articles = await searchGdelt(queries[i], MAX_GDELT_RECORDS);
      } catch {
        continue;
      }
      counts.documents_found += articles.length;

      for (const article of articles) {
        const hash = hashContent(article.url, article.title);
        if (seenHashes.has(hash)) continue;
        seenHashes.add(hash);

        const matched = matchEntities(article, entities);
        for (const ent of matched) {
          const source = sources.find((s) => s.domain === article.domain) ?? null;
          candidates.push(buildHeuristicCandidate(article, ent, source));
        }
      }
    }

    const hasOpenAI = !!Deno.env.get('OPENAI_API_KEY');
    const limited = candidates.slice(0, MAX_DOCUMENTS);

    for (const candidate of limited) {
      await storeDocument(supabase, candidate, runId);
      counts.documents_stored++;
    }

    const signalCandidates = limited.slice(0, MAX_SIGNALS);
    let useHeuristicFallback = !hasOpenAI;
    if (hasOpenAI) {
      try {
        for (const entity of entities.slice(0, MAX_ENTITIES)) {
          const entityCandidates = signalCandidates.filter((candidate) => candidate.entity_id === entity.id);
          if (!entityCandidates.length) continue;
          const aiSignals = await extractWithOpenAI(
            entityCandidates.map((c) => ({
              url: c.document.canonical_url,
              title: c.document.title,
              snippet: c.document.snippet ?? '',
              publishedAt: c.document.published_at,
              language: c.document.language,
              domain: c.document.domain,
              sourceName: c.document.source_name,
            })),
            entity,
          );
          counts.ai_candidates += aiSignals.length;
          for (const signal of aiSignals) await storeSignal(supabase, signal);
        }
        useHeuristicFallback = false;
      } catch (error) {
        console.error('OpenAI extraction failed', error);
        counts.extraction_errors++;
        useHeuristicFallback = true;
      }
    }

    for (const candidate of signalCandidates) {
      if (useHeuristicFallback) {
        await storeSignal(supabase, candidate);
        counts.heuristic_candidates++;
      }
    }
    counts.candidate_signals = counts.ai_candidates + counts.heuristic_candidates;

    await completeScanRun(supabase, runId, counts);
    return {
      ok: true,
      message: formatMessage(counts, hasOpenAI),
      runId,
      counts,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    await failScanRun(supabase, runId, msg);
    return { ok: false, message: msg, runId, counts: {} };
  }
}

function formatMessage(c: Record<string, number>, hasAI: boolean): string {
  const method = c.ai_candidates > 0 ? 'AI' : c.extraction_errors > 0 ? 'heuristic fallback' : hasAI ? 'AI, no qualifying signals' : 'heuristic';
  return `Discovery complete: ${c.documents_found} found, ${c.documents_stored} stored, ${c.candidate_signals} candidates (${method}).`;
}
