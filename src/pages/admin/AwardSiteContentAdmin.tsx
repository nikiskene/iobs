// src/pages/admin/AwardSiteContentAdmin.tsx
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { AwardSiteContent } from '../../providers/AwardSiteContentProvider';

const inputClass = 'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500';

const sectionLabels: Record<string, string> = {
  global: 'Global',
  hero: 'Homepage Hero',
  homepage: 'Homepage Sections',
  partners: 'Partners',
  general: 'General',
};

export default function AwardSiteContentAdmin() {
  const [rows, setRows] = useState<AwardSiteContent[]>([]);
  const [editing, setEditing] = useState<AwardSiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const { data, error: loadError } = await supabase
      .from('award_site_content')
      .select('*')
      .order('display_order');
    if (loadError) setError(loadError.message);
    setRows((data as AwardSiteContent[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const groups = useMemo(() => {
    return rows.reduce<Record<string, AwardSiteContent[]>>((acc, row) => {
      (acc[row.section] ||= []).push(row);
      return acc;
    }, {});
  }, [rows]);

  if (editing) {
    return <ContentEditor row={editing} onClose={() => { setEditing(null); load(); }} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Site Copy</h1>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
        Edit the text used by the current Beautiful Success website. This CMS is independent from the old WorldOS content tables.
      </p>

      {error && <p className="mt-5 rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">{error}</p>}
      {loading && <p className="mt-8 text-zinc-500">Loading...</p>}

      {!loading && Object.entries(groups).map(([section, items]) => (
        <section key={section} className="mt-9">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
            {sectionLabels[section] || section}
          </h2>
          <div className="space-y-3">
            {items.map((row) => (
              <button
                key={row.id || row.content_key}
                onClick={() => setEditing(row)}
                className="flex w-full items-center justify-between gap-5 rounded-xl border border-white/5 bg-white/[0.02] p-5 text-left hover:border-white/10"
              >
                <span className="min-w-0">
                  <span className="font-mono text-xs text-zinc-600">{row.content_key}</span>
                  <strong className="mt-1 block text-white">{row.headline || row.label || 'Untitled'}</strong>
                  {row.label && row.headline && <span className="mt-1 block text-sm text-zinc-500">{row.label}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  {!row.is_active && <span className="text-xs text-zinc-500">Inactive</span>}
                  <Pencil className="h-4 w-4 text-zinc-500" />
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ContentEditor({ row, onClose }: { row: AwardSiteContent; onClose: () => void }) {
  const [draft, setDraft] = useState(row);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof AwardSiteContent, value: string | boolean | number | null) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError('');
    const payload = {
      section: draft.section,
      label: draft.label || null,
      headline: draft.headline || null,
      subheadline: draft.subheadline || null,
      body: draft.body || null,
      media_url: draft.media_url || null,
      media_path: draft.media_path || null,
      display_order: draft.display_order,
      is_active: draft.is_active,
      updated_at: new Date().toISOString(),
    };
    const { error: updateError } = await supabase
      .from('award_site_content')
      .update(payload)
      .eq('content_key', draft.content_key);
    if (updateError) { setError(updateError.message); setSaving(false); return; }
    onClose();
  };

  return (
    <div>
      <button onClick={onClose} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><X className="h-4 w-4" /> Back</button>
      <p className="font-mono text-xs text-zinc-500">{draft.content_key}</p>
      <h1 className="mt-2 text-2xl font-bold">Edit Site Copy</h1>

      <div className="mt-6 max-w-3xl space-y-5">
        <Field label="Label / eyebrow"><input className={inputClass} value={draft.label || ''} onChange={(e) => set('label', e.target.value)} /></Field>
        <Field label="Headline"><textarea rows={3} className={`${inputClass} resize-none`} value={draft.headline || ''} onChange={(e) => set('headline', e.target.value)} /></Field>
        <Field label="Subheadline"><textarea rows={2} className={`${inputClass} resize-none`} value={draft.subheadline || ''} onChange={(e) => set('subheadline', e.target.value)} /></Field>
        <Field label="Body"><textarea rows={5} className={`${inputClass} resize-none`} value={draft.body || ''} onChange={(e) => set('body', e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Section"><input className={inputClass} value={draft.section} onChange={(e) => set('section', e.target.value)} /></Field>
          <Field label="Display order"><input type="number" className={inputClass} value={draft.display_order} onChange={(e) => set('display_order', Number(e.target.value))} /></Field>
        </div>
        <label className="flex items-center gap-3 text-sm text-zinc-300"><input type="checkbox" checked={draft.is_active} onChange={(e) => set('is_active', e.target.checked)} /> Active</label>
        {error && <p className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">{error}</p>}
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-5 py-2.5 font-medium text-white hover:bg-amber-500 disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save copy'}</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-zinc-300"><span className="mb-1.5 block">{label}</span>{children}</label>;
}
