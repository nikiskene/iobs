// supabase/functions/identity-discovery/retention.ts
import type { getSupabase } from './db.ts';

type Client = ReturnType<typeof getSupabase>;

export async function applyRetention(supabase: Client): Promise<Record<string, number>> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: expired, error } = await supabase
    .from('identity_documents')
    .select('id')
    .lt('retain_until', today);
  if (error) throw new Error(`Retention lookup failed: ${error.message}`);
  const ids = (expired ?? []).map((row) => row.id);
  if (!ids.length) return { expired_documents: 0, signals_removed: 0, documents_removed: 0 };

  const { data: approved } = await supabase
    .from('identity_signals')
    .select('document_id')
    .in('document_id', ids)
    .eq('review_status', 'approved');
  const preserved = new Set((approved ?? []).map((row) => row.document_id));
  const removable = ids.filter((id) => !preserved.has(id));

  let signalsRemoved = 0;
  if (removable.length) {
    const signalResult = await supabase.from('identity_signals').delete().in('document_id', removable).select('id');
    if (signalResult.error) throw new Error(`Signal retention failed: ${signalResult.error.message}`);
    signalsRemoved = signalResult.data?.length ?? 0;
    const docResult = await supabase.from('identity_documents').delete().in('id', removable).select('id');
    if (docResult.error) throw new Error(`Document retention failed: ${docResult.error.message}`);
  }

  const preservedIds = [...preserved];
  if (preservedIds.length) {
    const { error: pruneError } = await supabase
      .from('identity_documents')
      .update({ snippet: null, evidence_excerpt: null, status: 'discovery_only' })
      .in('id', preservedIds);
    if (pruneError) throw new Error(`Approved-source pruning failed: ${pruneError.message}`);
  }
  return { expired_documents: ids.length, signals_removed: signalsRemoved, documents_removed: removable.length };
}
