import { useEffect, useState, type FormEvent } from 'react';
import { ImagePlus, Pencil, Plus, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Recognition } from '../../lib/types';

const fieldClass = 'mt-1 block w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-white';
const buttonClass = 'rounded-lg border border-white/15 px-4 py-2 text-sm transition hover:bg-white/10 disabled:opacity-50';

const blankRecognition = (): Recognition => ({
  id: crypto.randomUUID(), company_name: '', acknowledgement: '', photo_url: '', photo_path: null,
  photo_alt: '', status: 'draft', display_order: 0, created_at: '', updated_at: '',
});

export default function RecognitionsAdmin() {
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingSwitch, setSavingSwitch] = useState(false);
  const [editing, setEditing] = useState<Recognition | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const [settingsResult, recognitionResult] = await Promise.all([
        supabase.from('recognition_settings').select('is_active').eq('id', true).maybeSingle(),
        supabase.from('recognitions').select('*').order('display_order').order('created_at'),
      ]);
      if (settingsResult.error) throw settingsResult.error;
      if (recognitionResult.error) throw recognitionResult.error;
      setEnabled(Boolean(settingsResult.data?.is_active));
      setRecognitions((recognitionResult.data as Recognition[]) || []);
    } catch {
      setError('Recognition CMS is not set up yet. Run the supplied Supabase SQL, then retry.');
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function changeEnabled(next: boolean) {
    setSavingSwitch(true); setError('');
    const { error: updateError } = await supabase.from('recognition_settings').update({ is_active: next, updated_at: new Date().toISOString() }).eq('id', true);
    if (updateError) setError(updateError.message);
    else setEnabled(next);
    setSavingSwitch(false);
  }

  if (editing) return <RecognitionEditor recognition={editing} onClose={() => { setEditing(null); void load(); }} />;

  return <div className="space-y-7">
    <div><h1 className="text-2xl font-bold">Recognitions</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Show the people and organizations acknowledged by the Institute. Use a certificate photo, the company name and one concise explanation—no logos.</p></div>
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div><h2 className="font-medium">Homepage recognition strip</h2><p className="mt-1 text-sm text-zinc-400">It remains hidden until you activate it. Published entries stay prepared in the CMS.</p></div>
      <label className="inline-flex items-center gap-3 text-sm"><input type="checkbox" checked={enabled} disabled={loading || savingSwitch || !!error} onChange={(event) => void changeEnabled(event.target.checked)} />{enabled ? 'Active on homepage' : 'Deactivated'}</label>
    </section>
    <div className="flex items-center justify-between gap-4"><p className="text-sm text-zinc-400">{recognitions.length}/10 prepared recognitions</p><button className={buttonClass} disabled={loading || !!error || recognitions.length >= 10} onClick={() => setEditing(blankRecognition())}><Plus className="mr-2 inline h-4 w-4" />Add recognition</button></div>
    {error && <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">{error} <button className="ml-2 underline" onClick={() => void load()}>Retry</button></p>}
    {loading ? <p className="text-zinc-500">Loading recognitions…</p> : !error && !recognitions.length ? <p className="rounded-xl border border-dashed border-white/10 p-8 text-sm text-zinc-500">No recognitions yet. Add the first certificate acknowledgement when it is ready.</p> :
      <div className="grid gap-3 md:grid-cols-2">{recognitions.map((recognition) => <article key={recognition.id} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5 text-zinc-600">{recognition.photo_url ? <img className="h-full w-full object-cover" src={recognition.photo_url} alt="" /> : <ImagePlus className="h-5 w-5" />}</div>
        <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-amber-300">{recognition.status}</p><h2 className="mt-1 break-words font-medium">{recognition.company_name || 'Untitled company'}</h2></div><button className="rounded-md p-2 text-zinc-400 hover:bg-white/5 hover:text-white" onClick={() => setEditing(recognition)} aria-label={`Edit ${recognition.company_name || 'recognition'}`}><Pencil className="h-4 w-4" /></button></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">{recognition.acknowledgement || 'No acknowledgement written yet.'}</p></div>
      </article>)}</div>}
  </div>;
}

function RecognitionEditor({ recognition, onClose }: { recognition: Recognition; onClose: () => void }) {
  const [draft, setDraft] = useState(recognition);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isNew = !recognition.created_at;

  useEffect(() => {
    if (!photo) { setPreview(''); return; }
    const url = URL.createObjectURL(photo); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function update<K extends keyof Recognition>(field: K, value: Recognition[K]) { setDraft((current) => ({ ...current, [field]: value })); }

  async function save(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!draft.company_name.trim() || !draft.acknowledgement.trim()) { setError('Add the company name and acknowledgement before saving.'); return; }
    if (photo && (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type) || photo.size > 8 * 1024 * 1024)) { setError('Choose a JPG, PNG or WebP photo up to 8 MB.'); return; }
    setSaving(true);
    try {
      let photoUrl = draft.photo_url;
      let photoPath = draft.photo_path;
      if (photo) {
        const extension = photo.type === 'image/jpeg' ? 'jpg' : photo.type.split('/')[1];
        const path = `${draft.id}/${crypto.randomUUID()}.${extension}`;
        const upload = await supabase.storage.from('recognition-photos').upload(path, photo, { contentType: photo.type });
        if (upload.error) throw upload.error;
        photoPath = path;
        photoUrl = supabase.storage.from('recognition-photos').getPublicUrl(path).data.publicUrl;
      }
      if (draft.status === 'published' && !photoUrl) { setError('Upload the certificate photo before publishing this recognition.'); return; }
      const result = await supabase.from('recognitions').upsert({
        id: draft.id,
        company_name: draft.company_name.trim(),
        acknowledgement: draft.acknowledgement.trim(),
        photo_url: photoUrl,
        photo_path: photoPath,
        photo_alt: draft.photo_alt.trim(),
        status: draft.status,
        display_order: draft.display_order,
        updated_at: new Date().toISOString(),
      }).select('id').single();
      if (result.error) throw result.error;
      onClose();
    } catch (cause) { setError(cause && typeof cause === 'object' && 'message' in cause ? String(cause.message) : 'Could not save recognition.'); }
    finally { setSaving(false); }
  }

  return <form onSubmit={save} className="max-w-2xl space-y-6"><button type="button" className="text-sm text-zinc-400 hover:text-white" onClick={onClose}><X className="mr-2 inline h-4 w-4" />Back to recognitions</button><div><h1 className="text-2xl font-bold">{isNew ? 'Add recognition' : 'Edit recognition'}</h1><p className="mt-2 text-sm text-zinc-400">This is a company acknowledgement, not a logo listing.</p></div><fieldset disabled={saving} className="space-y-5"><label className="block text-sm">Company name<input required maxLength={160} className={fieldClass} value={draft.company_name} onChange={(event) => update('company_name', event.target.value)} /></label><label className="block text-sm">Why it is acknowledged<textarea required maxLength={600} rows={5} className={fieldClass} value={draft.acknowledgement} onChange={(event) => update('acknowledgement', event.target.value)} /><span className="mt-1 block text-xs text-zinc-500">Keep this concise; the homepage card shows a compact excerpt.</span></label><label className="block text-sm">Certificate photo<input type="file" accept="image/jpeg,image/png,image/webp" className={fieldClass} onChange={(event) => setPhoto(event.target.files?.[0] || null)} /><span className="mt-1 block text-xs text-zinc-500">A person from the company holding the IOBS certificate. JPG, PNG or WebP, up to 8 MB.</span></label>{(preview || draft.photo_url) && <img className="h-48 w-full rounded-lg object-cover" src={preview || draft.photo_url} alt="Preview" />}<label className="block text-sm">Photo description<input maxLength={220} placeholder="Person receiving the IOBS certificate" className={fieldClass} value={draft.photo_alt} onChange={(event) => update('photo_alt', event.target.value)} /></label><label className="block text-sm">Publication<select className={fieldClass} value={draft.status} onChange={(event) => update('status', event.target.value as Recognition['status'])}><option value="draft">Draft — hidden</option><option value="published">Published — appears when the strip is active</option><option value="archived">Archived — hidden</option></select></label><label className="block text-sm">Display order<input type="number" className={fieldClass} value={draft.display_order} onChange={(event) => update('display_order', Number(event.target.value))} /></label>{error && <p role="alert" className="text-sm text-red-300">{error}</p>}<button className={buttonClass} type="submit"><Save className="mr-2 inline h-4 w-4" />{saving ? 'Saving…' : 'Save recognition'}</button></fieldset></form>;
}
