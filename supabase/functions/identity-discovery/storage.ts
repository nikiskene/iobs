// supabase/functions/identity-discovery/storage.ts
import type { CandidateSignal } from './extraction.ts';
import { isVerifiedWhat } from './qualityGate.ts';

const RETENTION_DAYS = 7;

export async function storeDocument(
  supabase: ReturnType<typeof import('./db.ts').getSupabase>,
  candidate: CandidateSignal,
  runId: string,
): Promise<boolean> {
  const retainUntil = new Date();
  retainUntil.setDate(retainUntil.getDate() + RETENTION_DAYS);
  const { error } = await supabase.from('identity_documents').insert({
    source_id: candidate.document.source_id,
    scan_run_id: runId,
    canonical_url: candidate.document.canonical_url,
    title: candidate.document.title,
    snippet: candidate.document.snippet,
    published_at: candidate.document.published_at,
    language: candidate.document.language,
    source_region: candidate.document.source_region,
    status: 'discovered',
    content_hash: candidate.document.content_hash,
    retain_until: retainUntil.toISOString().slice(0, 10),
    metadata: { domain: candidate.document.domain, source_name: candidate.document.source_name },
  });
  if (error?.code === '23505' || error?.message.includes('duplicate')) return false;
  if (error) throw error;
  return true;
}

export async function storeSignal(
  supabase: ReturnType<typeof import('./db.ts').getSupabase>,
  candidate: CandidateSignal,
): Promise<boolean> {
  const { data: doc } = await supabase
    .from('identity_documents')
    .select('id')
    .eq('canonical_url', candidate.document.canonical_url)
    .maybeSingle();
  const documentId = doc?.id;
  if (!documentId) return false;

  const { error } = await supabase.from('identity_signals').insert({
    entity_id: candidate.entity_id,
    document_id: documentId,
    speaker_type: candidate.signal.speaker_type,
    evidence_text: candidate.signal.evidence_text,
    classification: candidate.signal.classification,
    signal_type: candidate.signal.signal_type,
    direction: candidate.signal.direction,
    explicitness: candidate.signal.explicitness,
    candidate_sentence: candidate.signal.candidate_sentence,
    model_interpretation: candidate.signal.model_interpretation,
    model_confidence: candidate.signal.model_confidence,
    identity_relevance: candidate.signal.identity_relevance,
    evidence_strength: candidate.signal.evidence_strength,
    extraction_model: candidate.signal.extraction_model,
    prompt_version: candidate.signal.prompt_version,
    review_status: 'pending',
    review_eligible: isReviewEligible(candidate),
    quality_status: 'verified',
  });
  if (error?.code === '23505' || error?.message.includes('duplicate')) return false;
  if (error) throw error;
  return true;
}

function isReviewEligible(candidate: CandidateSignal): boolean {
  return isVerifiedWhat(candidate)
    && !String(candidate.signal.extraction_model ?? '').startsWith('heuristic');
}
