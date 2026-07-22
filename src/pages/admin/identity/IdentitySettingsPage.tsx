// src/pages/admin/identity/IdentitySettingsPage.tsx
import { useEffect, useState } from 'react';
import { Clock, Database, Save } from 'lucide-react';
import { fetchIdentitySettings, saveIdentitySettings, type IdentitySettings } from '../../../lib/identity/identitySettingsApi';
import { ErrorBanner, PageHeader, Spinner } from './identityUi';

export default function IdentitySettingsPage() {
  const [settings, setSettings] = useState<IdentitySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIdentitySettings().then(setSettings).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load settings.')).finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true); setError(null); setMessage(null);
    try {
      await saveIdentitySettings(settings);
      setMessage('Daily schedule updated.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save settings.');
    } finally { setSaving(false); }
  }

  if (loading) return <Spinner label="Loading scan settings…" />;
  return <div className="space-y-8">
    <PageHeader eyebrow="Identity Research · Admin only" title="Schedule & retention" description="Control when the daily scan runs and how little raw source material WorldOS keeps." />
    {error && <ErrorBanner message={error} />}{message && <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">{message}</p>}
    {settings && <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"><Clock className="h-5 w-5 text-sky-400" /><h2 className="mt-4 text-lg text-white">Daily scan</h2><p className="mt-2 text-sm leading-6 text-zinc-500">The scheduler checks hourly and runs once during the selected UTC hour.</p><label className="mt-6 flex items-center justify-between gap-4 text-sm text-zinc-300">Automation enabled<input type="checkbox" checked={settings.enabled} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })} className="h-5 w-5 accent-sky-500" /></label><label className="mt-5 block text-xs uppercase tracking-wider text-zinc-500">Run hour (UTC)<select value={settings.scan_hour_utc} onChange={(e) => setSettings({ ...settings, scan_hour_utc: Number(e.target.value) })} className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white">{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00 UTC</option>)}</select></label></section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"><Database className="h-5 w-5 text-violet-400" /><h2 className="mt-4 text-lg text-white">Rolling source window</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Raw headlines and introductions are retained for seven days. Expired, unapproved material is deleted; approved research keeps only essential provenance and evidence.</p><div className="mt-8 font-serif text-5xl text-white">{settings.retention_days}<span className="ml-2 text-base text-zinc-500">days</span></div></section>
    </div>}
    <button onClick={save} disabled={!settings || saving} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save schedule'}</button>
  </div>;
}
