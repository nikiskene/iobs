// src/pages/admin/ScaleWorldsAdmin.tsx
import { useEffect, useState } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type ScaleRow = {
  slug: string;
  label: string;
  position: number;
  eyebrow: string;
  title: string;
  introduction: string;
  i_am: string;
  i_can_be: string;
  what_to_do: string;
  knob_image_url: string;
  icon_url: string | null;
  text_image_url: string | null;
  is_published: boolean;
};

const inputClass = 'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500';

export default function ScaleWorldsAdmin() {
  const [worlds, setWorlds] = useState<ScaleRow[]>([]);
  const [editing, setEditing] = useState<ScaleRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from('impact_scales').select('*').order('position');
    setWorlds((data as ScaleRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (editing) {
    return <ScaleEditor world={editing} onClose={() => { setEditing(null); load(); }} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Beautiful Success Award Categories</h1>
      <p className="mt-1 text-sm text-zinc-400">Edit the six editorial worlds behind the homepage knob.</p>
      <div className="mt-8 space-y-3">
        {loading && <p className="text-zinc-500">Loading...</p>}
        {!loading && worlds.length === 0 && <p className="text-zinc-500">The scale CMS migration is not available yet.</p>}
        {worlds.map((world) => (
          <button
            className="flex w-full items-center gap-5 rounded-xl border border-white/5 bg-white/[0.02] p-5 text-left hover:border-amber-400/30"
            key={world.slug}
            onClick={() => setEditing(world)}
          >
            <span className="grid h-10 w-10 place-items-center rounded-full border border-amber-400/30 text-xs text-amber-300">{world.position}</span>
            <span className="min-w-0 flex-1">
              <strong className="block">{world.label}</strong>
              <span className="text-sm text-zinc-500">{world.eyebrow}</span>
            </span>
            {!world.is_published && <span className="text-xs text-zinc-500">Draft</span>}
            <Pencil className="h-4 w-4 text-zinc-500" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ScaleEditor({ world, onClose }: { world: ScaleRow; onClose: () => void }) {
  const [draft, setDraft] = useState(world);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key: keyof ScaleRow, value: string | boolean) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError('');
    const { slug, ...payload } = draft;
    const { error: updateError } = await supabase
      .from('impact_scales')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('slug', slug);
    if (updateError) { setError(updateError.message); setSaving(false); return; }
    onClose();
  };

  return (
    <div>
      <button onClick={onClose} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><X className="h-4 w-4" /> Back</button>
      <h1 className="text-2xl font-bold">{draft.position}. {draft.label}</h1>
      <div className="mt-6 max-w-3xl space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Public label" value={draft.label} onChange={(value) => set('label', value)} />
          <TextField label="Eyebrow" value={draft.eyebrow} onChange={(value) => set('eyebrow', value)} />
        </div>
        <TextField label="Main proposition" value={draft.title} onChange={(value) => set('title', value)} multiline />
        <TextField label="Introduction" value={draft.introduction} onChange={(value) => set('introduction', value)} multiline />
        <TextField label="I AM" value={draft.i_am} onChange={(value) => set('i_am', value)} multiline />
        <TextField label="I CAN BE" value={draft.i_can_be} onChange={(value) => set('i_can_be', value)} multiline />
        <TextField label="WHAT TO DO" value={draft.what_to_do} onChange={(value) => set('what_to_do', value)} multiline />
        <TextField label="Knob image URL" value={draft.knob_image_url} onChange={(value) => set('knob_image_url', value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Icon URL" value={draft.icon_url || ''} onChange={(value) => set('icon_url', value)} />
          <TextField label="Text artwork URL" value={draft.text_image_url || ''} onChange={(value) => set('text_image_url', value)} />
        </div>
        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input type="checkbox" checked={draft.is_published} onChange={(event) => set('is_published', event.target.checked)} /> Published
        </label>
        {error && <p className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">{error}</p>}
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-5 py-2.5 font-medium text-white hover:bg-amber-500 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save world'}
        </button>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return (
    <label className="block text-sm font-medium text-zinc-300">
      <span className="mb-1.5 block">{label}</span>
      {multiline
        ? <textarea className={`${inputClass} resize-none`} rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
        : <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}
