// src/lib/identity/identityScanApi.ts
import { supabase } from '../supabase';
import type { IdentityScanRun } from './types';

export async function fetchScanForDate(date: string): Promise<IdentityScanRun | null> {
  const { data, error } = await supabase
    .from('identity_scan_runs')
    .select('*')
    .eq('run_date', date)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type RunAssessment = { what: number; how: number; context: number };

export async function fetchRunAssessment(runId: string): Promise<RunAssessment> {
  const { data, error } = await supabase
    .from('identity_signals')
    .select('classification, document:identity_documents!inner(scan_run_id)')
    .eq('document.scan_run_id', runId);
  if (error) throw error;
  return (data ?? []).reduce<RunAssessment>((counts, signal) => {
    const key = signal.classification as keyof RunAssessment;
    if (key in counts) counts[key]++;
    return counts;
  }, { what: 0, how: 0, context: 0 });
}
