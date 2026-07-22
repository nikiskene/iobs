// supabase/functions/identity-discovery/db.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function getSupabase() {
  const url = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('SUPABASE_PROJECT_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE');
  if (!url || !key) throw new Error('Missing Supabase service credentials in edge runtime.');
  return createClient(url, key, { auth: { persistSession: false } });
}

export type EntityRow = {
  id: string;
  name: string;
  slug: string;
  entity_type: string;
  country_code: string | null;
  region: string | null;
  aliases: string[];
  official_domains: string[];
};

export type SourceRow = {
  id: string;
  name: string;
  domain: string | null;
  source_tier: string;
  region: string;
  feed_url: string | null;
  active: boolean;
  automation_allowed: boolean;
};

export async function loadEntities(supabase: ReturnType<typeof getSupabase>): Promise<EntityRow[]> {
  const { data, error } = await supabase
    .from('identity_entities')
    .select('id, name, slug, entity_type, country_code, region, aliases, official_domains')
    .eq('active', true)
    .order('name');
  if (error) throw new Error(`Failed to load entities: ${error.message}`);
  return data ?? [];
}

export async function loadSources(supabase: ReturnType<typeof getSupabase>): Promise<SourceRow[]> {
  const { data, error } = await supabase
    .from('identity_sources')
    .select('id, name, domain, source_tier, region, feed_url, active, automation_allowed')
    .eq('active', true)
    .order('name');
  if (error) throw new Error(`Failed to load sources: ${error.message}`);
  return data ?? [];
}

export async function createScanRun(
  supabase: ReturnType<typeof getSupabase>,
  mode: string,
  scope: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('identity_scan_runs')
    .insert({ mode, status: 'running', scope, started_at: new Date().toISOString() })
    .select('id')
    .single();
  if (error) throw new Error(`Failed to create scan run: ${error.message}`);
  return data.id;
}

export async function completeScanRun(
  supabase: ReturnType<typeof getSupabase>,
  runId: string,
  counts: Record<string, number>,
) {
  const { error } = await supabase
    .from('identity_scan_runs')
    .update({
      status: 'completed',
      counts,
      completed_at: new Date().toISOString(),
    })
    .eq('id', runId);
  if (error) throw new Error(`Failed to complete scan run: ${error.message}`);
}

export async function failScanRun(
  supabase: ReturnType<typeof getSupabase>,
  runId: string,
  message: string,
) {
  await supabase
    .from('identity_scan_runs')
    .update({ status: 'failed', error_message: message, completed_at: new Date().toISOString() })
    .eq('id', runId);
}
