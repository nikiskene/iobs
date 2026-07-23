// supabase/functions/identity-discovery/scan.ts
import {
  completeScanRun,
  createScanRun,
  failScanRun,
  getSupabase,
  loadEntities,
  loadSources,
} from './db.ts';
import { storeDocument } from './storage.ts';
import { applyRetention } from './retention.ts';
import { discoverCandidates } from './discovery.ts';
import { analyzeCandidates } from './analysis.ts';
import { balanceCandidates } from './balancing.ts';
import { enrichEvidence } from './evidence.ts';

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
    const counts: Record<string, number> = {
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
      analysis_complete: 0,
      balanced_documents: 0,
      evidence_documents: 0,
      evidence_failures: 0,
      what_documents: 0,
      how_documents: 0,
      context_documents: 0,
    };
    const discovery = await discoverCandidates(supabase, entities, sources);
    Object.assign(counts, discovery.counts);
    const balanced = balanceCandidates(discovery.candidates, 400);
    counts.balanced_documents = uniqueDocumentCount(balanced.candidates);
    for (const [region, count] of Object.entries(documentRegions(balanced.candidates))) {
      counts[`region_${region}`] = count.size;
    }

    const hasOpenAI = !!Deno.env.get('OPENAI_API_KEY');
    const limited = balanced.candidates;

    for (const candidate of limited) {
      if (await storeDocument(supabase, candidate, runId)) counts.documents_stored++;
    }

    const evidence = await enrichEvidence(limited);
    counts.evidence_documents = evidence.retrieved;
    counts.evidence_failures = evidence.failed;
    const signalCandidates = evidence.candidates.filter((candidate) =>
      (candidate.document.analysis_text ?? candidate.document.snippet ?? '').length >= 80
    );
    if (hasOpenAI) {
      const analysis = await analyzeCandidates(supabase, signalCandidates, entities);
      counts.ai_candidates = analysis.stored;
      counts.extraction_errors = analysis.errors;
      counts.what_signals = analysis.what;
      counts.how_signals = analysis.how;
      counts.context_signals = analysis.context;
      counts.what_documents = analysis.whatDocuments;
      counts.how_documents = analysis.howDocuments;
      counts.context_documents = analysis.contextDocuments;
      counts.analysis_complete = analysis.errors === 0 ? 1 : 0;
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

function uniqueDocumentCount(candidates: Array<{ document: { canonical_url: string } }>): number {
  return new Set(candidates.map((candidate) => candidate.document.canonical_url)).size;
}

function documentRegions(
  candidates: Array<{ document: { canonical_url: string; source_region: string } }>,
): Record<string, Set<string>> {
  const regions: Record<string, Set<string>> = {};
  for (const candidate of candidates) {
    const region = candidate.document.source_region || 'other';
    (regions[region] ??= new Set()).add(candidate.document.canonical_url);
  }
  return regions;
}

function formatMessage(c: Record<string, number>, hasAI: boolean): string {
  const method = c.ai_candidates > 0 ? 'AI' : c.extraction_errors > 0
    ? 'AI incomplete' : hasAI ? 'AI, no qualifying signals' : 'analysis unavailable';
  return `Discovery complete: ${c.documents_found} observed, ${c.what_signals} identity signals, ${c.how_signals} HOW signals (${method}).`;
}
