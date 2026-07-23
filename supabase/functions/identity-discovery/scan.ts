// supabase/functions/identity-discovery/scan.ts
import {
  completeScanRun,
  createScanRun,
  failScanRun,
  getSupabase,
  loadEntities,
  loadSources,
} from './db.ts';
import { storeDocument, storeSignal } from './storage.ts';
import { applyRetention } from './retention.ts';
import { discoverCandidates } from './discovery.ts';
import { analyzeCandidates } from './analysis.ts';

export type ScanResult = {
  ok: boolean;
  message: string;
  runId: string;
  counts: Record<string, number>;
};

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
    max_entities: entities.length,
    max_documents: 400,
    retention,
  };
  const runId = await createScanRun(supabase, mode, scope);

  try {
    const counts = {
      documents_found: 0,
      documents_screened_in: 0,
      documents_stored: 0,
      clusters: 0,
      candidate_signals: 0,
      ai_candidates: 0,
      heuristic_candidates: 0,
      extraction_errors: 0,
      official_documents: 0,
      discovery_documents: 0,
      source_errors: 0,
      what_signals: 0,
      how_signals: 0,
      context_signals: 0,
    };
    const discovery = await discoverCandidates(supabase, entities, sources);
    Object.assign(counts, discovery.counts);
    const candidates = discovery.candidates;

    const hasOpenAI = !!Deno.env.get('OPENAI_API_KEY');
    const limited = candidates.slice(0, 400);

    for (const candidate of limited) {
      await storeDocument(supabase, candidate, runId);
      counts.documents_stored++;
    }

    const signalCandidates = limited;
    let useHeuristicFallback = !hasOpenAI;
    if (hasOpenAI) {
      const analysis = await analyzeCandidates(supabase, signalCandidates, entities);
      counts.ai_candidates = analysis.stored;
      counts.extraction_errors = analysis.errors;
      counts.what_signals = analysis.what;
      counts.how_signals = analysis.how;
      counts.context_signals = analysis.context;
      useHeuristicFallback = analysis.errors > 0 && analysis.stored === 0;
    }

    for (const candidate of signalCandidates) {
      if (useHeuristicFallback) {
        if (await storeSignal(supabase, candidate)) {
          counts.heuristic_candidates++;
          const key = `${candidate.signal.classification}_signals` as
            'what_signals' | 'how_signals' | 'context_signals';
          if (key in counts) counts[key]++;
        }
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
  return `Discovery complete: ${c.documents_found} observed, ${c.what_signals} identity signals, ${c.how_signals} HOW signals (${method}).`;
}
