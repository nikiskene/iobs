// src/lib/identity/identityOverviewApi.ts
import { supabase } from '../supabase';
import type { ScanRunCounts } from './types';

export async function fetchOverviewCounts(): Promise<ScanRunCounts> {
  const [docs, clusters, candidates, pending, approved] = await Promise.all([
    supabase.from('identity_documents').select('id', { count: 'exact', head: true }),
    supabase.from('identity_story_clusters').select('id', { count: 'exact', head: true }),
    countSignals({ eligible: true, excludeRejected: true }),
    countSignals({ eligible: true, status: 'pending' }),
    countSignals({ status: 'approved' }),
  ]);
  for (const result of [docs, clusters, candidates, pending, approved]) {
    if (result.error) throw result.error;
  }
  return {
    documents_found: docs.count ?? 0,
    clusters: clusters.count ?? 0,
    candidate_signals: candidates.count ?? 0,
    pending_review: pending.count ?? 0,
    approved_signals: approved.count ?? 0,
  };
}

function countSignals(options: {
  eligible?: boolean;
  status?: string;
  excludeRejected?: boolean;
}) {
  let query = supabase
    .from('identity_signals')
    .select('id', { count: 'exact', head: true })
    .eq('quality_status', 'verified');
  if (options.eligible) query = query.eq('review_eligible', true);
  if (options.status) query = query.eq('review_status', options.status);
  if (options.excludeRejected) query = query.neq('review_status', 'rejected');
  return query;
}
