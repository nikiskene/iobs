// src/lib/identity/identityApi.ts
import { supabase } from '../supabase';
import type {
  IdentityEntity,
  IdentityScanRun,
  IdentitySource,
  ScanRunCounts,
  SignalWithRelations,
} from './types';

export async function fetchLastScan(): Promise<IdentityScanRun | null> {
  const { data, error } = await supabase
    .from('identity_scan_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchScanHistory(limit = 10): Promise<IdentityScanRun[]> {
  const { data, error } = await supabase
    .from('identity_scan_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchOverviewCounts(): Promise<ScanRunCounts> {
  const [docs, clusters, candidates, pending, approved] = await Promise.all([
    supabase.from('identity_documents').select('id', { count: 'exact', head: true }),
    supabase.from('identity_story_clusters').select('id', { count: 'exact', head: true }),
    supabase
      .from('identity_signals')
      .select('id', { count: 'exact', head: true })
      .neq('review_status', 'rejected'),
    supabase
      .from('identity_signals')
      .select('id', { count: 'exact', head: true })
      .eq('review_status', 'pending'),
    supabase
      .from('identity_signals')
      .select('id', { count: 'exact', head: true })
      .eq('review_status', 'approved'),
  ]);
  for (const r of [docs, clusters, candidates, pending, approved]) {
    if (r.error) throw r.error;
  }
  return {
    documents_found: docs.count ?? 0,
    clusters: clusters.count ?? 0,
    candidate_signals: candidates.count ?? 0,
    pending_review: pending.count ?? 0,
    approved_signals: approved.count ?? 0,
  };
}

export async function fetchSources(): Promise<IdentitySource[]> {
  const { data, error } = await supabase
    .from('identity_sources')
    .select('*')
    .order('source_tier', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchEntities(): Promise<IdentityEntity[]> {
  const { data, error } = await supabase
    .from('identity_entities')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPendingSignals(): Promise<SignalWithRelations[]> {
  const { data, error } = await supabase
    .from('identity_signals')
    .select(
      '*, entity:identity_entities(name, slug), document:identity_documents(title, canonical_url, snippet, source_region)',
    )
    .eq('review_status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SignalWithRelations[];
}

export type DailyScanSignal = SignalWithRelations & {
  final_sentence: string;
  final_classification: string;
  final_signal_type: string | null;
  reviewer_confidence: number | null;
};

export async function fetchDailyScan(date: string): Promise<DailyScanSignal[]> {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const { data: signals, error } = await supabase
    .from('identity_signals')
    .select('*, entity:identity_entities(name, slug), document:identity_documents(title, canonical_url, snippet, source_region)')
    .eq('review_status', 'approved')
    .gte('updated_at', start.toISOString())
    .lt('updated_at', end.toISOString())
    .order('model_confidence', { ascending: false });
  if (error) throw error;
  if (!signals?.length) return [];

  const { data: reviews, error: reviewError } = await supabase
    .from('identity_reviews')
    .select('signal_id, approved_sentence, classification_override, signal_type_override, reviewer_confidence, created_at')
    .in('signal_id', signals.map((signal) => signal.id))
    .in('decision', ['approved', 'rewritten'])
    .order('created_at', { ascending: false });
  if (reviewError) throw reviewError;
  const latest = new Map<string, Record<string, unknown>>();
  for (const review of reviews ?? []) if (!latest.has(review.signal_id)) latest.set(review.signal_id, review);

  return (signals as SignalWithRelations[]).map((signal) => {
    const review = latest.get(signal.id);
    return {
      ...signal,
      final_sentence: (review?.approved_sentence as string) || signal.candidate_sentence,
      final_classification: (review?.classification_override as string) || signal.classification,
      final_signal_type: (review?.signal_type_override as string) || signal.signal_type,
      reviewer_confidence: (review?.reviewer_confidence as number) ?? null,
    };
  });
}

export type ReviewAction = 'approved' | 'rejected' | 'rewritten' | 'needs_evidence';

export type ReviewOverrides = {
  approvedSentence?: string;
  classification?: string;
  signalType?: string;
  reviewerConfidence?: number;
  comment?: string;
  visibility?: string;
};

export async function submitReview(
  signalId: string,
  decision: ReviewAction,
  reviewerId: string,
  overrides: ReviewOverrides = {},
): Promise<void> {
  const { error: reviewError } = await supabase.from('identity_reviews').insert({
    signal_id: signalId,
    reviewer_id: reviewerId,
    decision,
    approved_sentence: overrides.approvedSentence ?? null,
    classification_override: overrides.classification ?? null,
    signal_type_override: overrides.signalType ?? null,
    reviewer_confidence: overrides.reviewerConfidence ?? null,
    comment: overrides.comment ?? null,
  });
  if (reviewError) throw reviewError;

  const statusMap: Record<ReviewAction, 'approved' | 'rejected' | 'needs_evidence' | 'pending'> = {
    approved: 'approved',
    rejected: 'rejected',
    rewritten: 'pending',
    needs_evidence: 'needs_evidence',
  };
  const { error: signalError } = await supabase
    .from('identity_signals')
    .update({ review_status: statusMap[decision], visibility: overrides.visibility, updated_at: new Date().toISOString() })
    .eq('id', signalId);
  if (signalError) throw signalError;
}

export async function deleteDuplicateSignal(signalId: string): Promise<void> {
  const { error } = await supabase.from('identity_signals').delete().eq('id', signalId);
  if (error) throw error;
}

export async function triggerScan(mode: string = 'manual'): Promise<{ ok: boolean; message: string; runId?: string }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return { ok: false, message: 'Not authenticated.' };

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/identity-discovery`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mode }),
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) return { ok: false, message: body.error || `Scan failed (${resp.status})` };
  return { ok: true, message: body.message || 'Scan completed.', runId: body.runId };
}
