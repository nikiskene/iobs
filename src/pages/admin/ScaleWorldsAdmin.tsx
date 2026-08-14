// src/pages/admin/ScaleWorldsAdmin.tsx
import { useEffect, useState } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type ScaleRow = {
  slug: string;
  label: string;
  position: number;
  knob_image_url: string;
  is_published: boolean;
};

const inputClass = 'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500';

export default function ScaleWorldsAdmin() {
  const [worlds, setWorlds] = useState<ScaleRow[]>([]);
  const [editing, setEditing] = useState<ScaleRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('impact_scales')
      .select('slug,label,position,knob_image_url,is_published')
      .order('position');
    setWorlds((data as ScaleRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (editing) {
    return <ScaleEditor world={editing} onClose={() => { setEditing(null); load(); }} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Award Categories &amp; Dial</h1>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
        Manage the seven dial positions used by the current Beautiful Success homepage. Headlines and copy are edited separately under Site Copy.
      </p>
      <div className="mt-8 space-y-3">
        {loading && <p className="text-zinc-500">Loading...</p>}
        {!loading && worlds.length === 0 && <p className="text-zinc-500">No dial positions found.</p>}
        {worlds.map((world) => (
          <button
            className="flex w-full items-center gap-5 rounded-xl border border-white/5 bg-white/[0.02] p-5 text-left hover:border-amber-400/30"
            key={world.slug}
            onClick={() => setEditing(world)}
          >
            <span className="grid h-10 w-10 place-items-center rounded-full border border-amber-400/30 text-xs text-amber-300">{String(world.position).padStart(2, '0')}</span>
            <span className="min-w-0 flex-1">
              <strong className="block">{world.label}</strong>
              <span className="mt-1 block font-mono text-xs text-zinc-600">{world.slug}</span>
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
    const { error: updateError } = await supabase
      .from('impact_scales')
      .update({
        label: draft.label,
        knob_image_url: draft.knob_image_url,
        is_published: draft.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', draft.slug);
    if (updateError) { setError(updateError.message); setSaving(false); return; }
    onClose();
  };

  return (
    <div>
      <button onClick={onClose} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><X className="h-4 w-4" /> Back</button>
      <p className="text-xs uppercase tracking-[0.24em] text-amber-400">Dial Position {String(draft.position).padStart(2, '0')}</p>
      <h1 className="mt-2 text-2xl font-bold">{draft.label}</h1>
      <div className="mt-6 max-w-3xl space-y-5">
        <TextField label="Dial / category label" value={draft.label} onChange={(value) => set('label', value)} />
        <TextField label="Knob image URL" value={draft.knob_image_url} onChange={(value) => set('knob_image_url', value)} />
        {draft.knob_image_url && (
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <img src={draft.knob_image_url} alt="" className="mx-auto h-44 w-44 object-contain" />
          </div>
        )}
        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input type="checkbox" checked={draft.is_published} onChange={(event) => set('is_published', event.target.checked)} /> Published
        </label>
        {error && <p className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">{error}</p>}
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-5 py-2.5 font-medium text-white hover:bg-amber-500 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save dial position'}
        </button>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-zinc-300">
      <span className="mb-1.5 block">{label}</span>
      <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
