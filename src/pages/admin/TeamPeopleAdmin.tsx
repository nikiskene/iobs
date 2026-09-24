import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { TEAM_CATEGORIES, safeWebUrl, type TeamPerson } from '../../lib/team';

const inputClass = 'mt-1 block w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-white';
const buttonClass = 'rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50';
const newPerson = (): TeamPerson => ({ id: crypto.randomUUID(), full_name: '', category: 'team', status: 'draft', title: '', description: '', photo_url: '', linkedin_url: '', substack_url: '', sort_order: 0 });

export default function TeamPeopleAdmin() {
  const [people, setPeople] = useState<TeamPerson[]>([]);
  const [editing, setEditing] = useState<TeamPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await supabase.from('team_people').select('*').order('sort_order').order('full_name');
      if (result.error) throw result.error;
      setPeople(result.data || []);
    } catch { setError('Unable to load public team entries. Check that the public team database migration has been applied, then retry.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  if (editing) return <PersonEditor key={editing.id} person={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />;

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold">The people behind IOBS</h1><p className="mt-2 text-sm text-zinc-400">Manage the people shown on the public team page. Draft and archived entries stay hidden. Existing public team profiles keep their visibility.</p></div>
    <div className="flex flex-wrap gap-3"><button className={buttonClass} disabled={loading || !!error} onClick={() => setEditing(newPerson())}>Add person</button><Link className={buttonClass} to="/team" target="_blank" rel="noopener noreferrer">View public page</Link></div>
    {error && <div role="alert" className="text-red-300">{error} <button className={buttonClass} onClick={load}>Retry</button></div>}
    {loading ? <p role="status">Loading…</p> : !error && TEAM_CATEGORIES.map(([category, label]) => <section key={category}>
      <h2 className="mb-3 text-lg font-semibold">{label}</h2>
      <div className="space-y-2">{people.filter((person) => person.category === category).map((person) => <div key={person.id} className="flex items-center gap-4 rounded-lg border border-white/10 p-4">
        {safeWebUrl(person.photo_url) && <img src={person.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />}
        <div className="min-w-0 flex-1"><p className="break-words font-medium">{person.full_name}</p><p className="text-sm text-zinc-400">{person.title}</p><span className="text-xs capitalize text-amber-300">{person.status}</span></div>
        <button className={buttonClass} onClick={() => setEditing(person)}>Edit</button>
      </div>)}</div>
      {!people.some((person) => person.category === category) && <p className="text-sm text-zinc-500">No entries yet.</p>}
    </section>)}
  </div>;
}

function PersonEditor({ person, onCancel, onSaved }: { person: TeamPerson; onCancel: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState(person);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function change<K extends keyof TeamPerson>(field: K, value: TeamPerson[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setError('');
    for (const field of ['linkedin_url', 'substack_url', 'photo_url'] as const) {
      if (draft[field].trim() && !safeWebUrl(draft[field].trim())) { setError('Use complete http:// or https:// links.'); return; }
    }
    if (!draft.full_name.trim()) { setError('Please enter a name.'); return; }
    if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError('Choose a JPG, PNG or WebP photo up to 5 MB.'); return;
    }
    setBusy(true);
    let uploadedPath: string | undefined;
    try {
      let photoUrl = draft.photo_url.trim();
      if (file) {
        const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
        const path = `${draft.id}/${crypto.randomUUID()}.${extension}`;
        const result = await supabase.storage.from('team-photos').upload(path, file, { contentType: file.type });
        if (result.error) throw result.error;
        uploadedPath = path;
        photoUrl = supabase.storage.from('team-photos').getPublicUrl(path).data.publicUrl;
      }
      const result = await supabase.from('team_people').upsert({
        id: draft.id, full_name: draft.full_name.trim(), category: draft.category, status: draft.status,
        title: draft.title.trim(), description: draft.description.trim(), photo_url: photoUrl,
        linkedin_url: draft.linkedin_url.trim(), substack_url: draft.substack_url.trim(), sort_order: draft.sort_order,
      }).select('id').single();
      if (result.error) throw result.error;
      onSaved();
    } catch (cause) {
      if (uploadedPath) await supabase.storage.from('team-photos').remove([uploadedPath]);
      setError(cause && typeof cause === 'object' && 'message' in cause ? String(cause.message) : 'Could not save. Please try again.');
    } finally { setBusy(false); }
  }

  return <form onSubmit={save} className="max-w-2xl space-y-5">
    <h1 className="text-2xl font-bold">{person.full_name ? 'Edit person' : 'Add person'}</h1>
    <fieldset disabled={busy} className="space-y-5">
      <label className="block text-sm">Name<input required maxLength={160} className={inputClass} value={draft.full_name} onChange={(event) => change('full_name', event.target.value)} /></label>
      <label className="block text-sm">Category<select className={inputClass} value={draft.category} onChange={(event) => change('category', event.target.value as TeamPerson['category'])}>{TEAM_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="block text-sm">Status<select className={inputClass} value={draft.status} onChange={(event) => change('status', event.target.value as TeamPerson['status'])}><option value="draft">Draft — hidden</option><option value="published">Published — visible on /team</option><option value="archived">Archived — hidden</option></select></label>
      <label className="block text-sm">Short title<input maxLength={160} className={inputClass} value={draft.title} onChange={(event) => change('title', event.target.value)} /></label>
      <label className="block text-sm">Short description<textarea maxLength={1200} rows={4} className={inputClass} value={draft.description} onChange={(event) => change('description', event.target.value)} /></label>
      {(preview || safeWebUrl(draft.photo_url)) && <img src={preview || draft.photo_url} alt="Photo preview" className="h-40 w-32 rounded-lg object-cover" />}
      <label className="block text-sm">Upload photo<input type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} onChange={(event) => setFile(event.target.files?.[0] || null)} /><span className="mt-1 block text-xs text-zinc-400">JPG, PNG or WebP, up to 5 MB. Uploaded when you save.</span></label>
      <label className="block text-sm">Photo URL<input type="url" className={inputClass} value={draft.photo_url} onChange={(event) => change('photo_url', event.target.value)} /></label>
      <label className="block text-sm">LinkedIn<input type="url" placeholder="https://www.linkedin.com/in/…" className={inputClass} value={draft.linkedin_url} onChange={(event) => change('linkedin_url', event.target.value)} /></label>
      <label className="block text-sm">Substack<input type="url" placeholder="https://…substack.com" className={inputClass} value={draft.substack_url} onChange={(event) => change('substack_url', event.target.value)} /></label>
      <label className="block text-sm">Sort order<input type="number" required step={1} min={-2147483648} max={2147483647} className={inputClass} value={draft.sort_order} onChange={(event) => change('sort_order', Number(event.target.value))} /><span className="text-xs text-zinc-400">Lower numbers appear first within each category.</span></label>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <div className="flex gap-3"><button type="submit" className={buttonClass}>{busy ? 'Saving…' : 'Save person'}</button><button type="button" onClick={onCancel} className={buttonClass}>Cancel</button></div>
    </fieldset>
  </form>;
}
