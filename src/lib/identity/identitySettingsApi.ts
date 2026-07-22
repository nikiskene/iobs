// src/lib/identity/identitySettingsApi.ts
import { supabase } from '../supabase';

export type IdentitySettings = {
  singleton: boolean;
  enabled: boolean;
  scan_hour_utc: number;
  retention_days: number;
  updated_at: string;
};

export async function fetchIdentitySettings(): Promise<IdentitySettings> {
  const { data, error } = await supabase.from('identity_settings').select('*').eq('singleton', true).single();
  if (error) throw error;
  return data as IdentitySettings;
}

export async function saveIdentitySettings(settings: Pick<IdentitySettings, 'enabled' | 'scan_hour_utc'>): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from('identity_settings').update({
    ...settings,
    updated_at: new Date().toISOString(),
    updated_by: auth.user?.id ?? null,
  }).eq('singleton', true);
  if (error) throw error;
}
