import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNominationMode, type NominationMode } from '../../providers/NominationModeProvider';
import type { AcknowledgementNomination } from '../../lib/acknowledgements';
import { NARRATIVE_MAX_LENGTH, narrativeLimitError, NOMINATION_RAYS, PRINCIPLE_IDS } from '../../content/nominationContent';
type Row = Omit<AcknowledgementNomination, 'upvotes' | 'downvotes' | 'my_vote'> & { is_visible: boolean };
export default function NominationsAdmin() {
  const { mode, error: modeError, refresh } = useNominationMode();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [more, setMore] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const load = useCallback(async (offset = 0) => {
    const { data, error } = await supabase.from('acknowledgement_nominations').select('*').order('created_at', { ascending: false }).order('id').range(offset,offset+49);
    if (error) setError('Could not load company nominations.');
    else { setRows(previous => offset ? [...previous, ...data] : data); setMore(data.length === 50); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function changeMode(next: NominationMode) {
    setBusy(true); setError(''); setNotice('');
    const { data, error } = await supabase.from('nomination_settings').update({ mode: next }).eq('id', true).select('mode').single();
    if (error || data?.mode !== next) setError('The nomination mode could not be saved.');
    else { await refresh(); setNotice(`${next === 'award' ? 'Award' : 'Acknowledgement'} nominations are now active.`); }
    setBusy(false);
  }
  async function visibility(row: Row) {
    setBusy(true); setError('');
    const { data, error } = await supabase.from('acknowledgement_nominations').update({ is_visible: !row.is_visible }).eq('id', row.id).select('id').single();
    if (error || !data) setError('The nomination could not be updated.');
    else setRows(previous => previous.map(item => item.id === row.id ? { ...item, is_visible: !row.is_visible } : item));
    setBusy(false);
  }
  async function saveEdit() {
    if (!editing) return;
    const limitError = narrativeLimitError(editing.description, editing.principles);
    if (limitError) { setError(limitError); return; }
    setBusy(true); setError('');
    const { id, created_at, is_visible, ...changes } = editing;
    const { data, error } = await supabase.from('acknowledgement_nominations').update(changes).eq('id', id).select('*').single();
    if (error || !data) setError('The submission could not be saved.');
    else { setRows(current => current.map(row => row.id === id ? data as Row : row)); setEditing(null); setNotice('Submission updated.'); }
    setBusy(false);
  }
  return <div className="max-w-5xl space-y-8">
    <div><h1 className="text-3xl font-semibold">Acknowledgements</h1><p className="mt-3 text-zinc-400">One company record serves the public acknowledgement gallery and the homepage acknowledgement rail. Award nominations remain separate.</p></div>
    <section className="rounded-2xl border border-white/10 p-6"><h2 className="text-lg font-medium">Active nomination path</h2><div className="mt-4 flex flex-wrap gap-3" role="group" aria-label="Award or acknowledgement">
      {(['award','acknowledgement'] as const).map(value => <button key={value} disabled={busy || !mode} aria-pressed={mode === value} onClick={() => void changeMode(value)} className={`rounded-full border px-5 py-3 ${mode === value ? 'border-sky-400 bg-sky-500 text-white' : 'border-white/20 text-zinc-300'} disabled:opacity-50`}>{value === 'award' ? 'Award' : 'Acknowledgement'}</button>)}
    </div><p className="mt-4 text-sm text-zinc-400">Acknowledgement shows the “Acknowledgement” header button, company gallery and company submission form. Award restores the “Nominate” button and original award form. The inactive submission form is closed; existing company nominations and voting remain available.</p>
    <div className="mt-4 flex gap-6 text-sm underline"><Link to="/acknowledgement">View company gallery</Link><Link to="/award/nominate">View award nomination path</Link></div></section>
    {(error || modeError) && <p role="alert" className="text-red-400">{error || modeError} <button className="underline" onClick={() => { setError(''); void refresh(); void load(); }}>Try again</button></p>}
    {notice && <p role="status" className="text-emerald-400">{notice}</p>}
    <section><h2 className="mb-4 text-xl">Company submissions</h2><p className="mb-6 text-sm text-zinc-400">New nominations are private until approved. Approve the submissions that should appear in the public gallery and the homepage acknowledgement rail; hide a published entry if needed.</p>
      {!rows.length && !error && <p className="text-zinc-400">No company submissions yet.</p>}
      <div className="space-y-4">{rows.map(row => <article key={row.id} className="rounded-xl border border-white/10 p-5">{editing?.id === row.id ? <div className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><AdminField label="Company name" value={editing.company_name} onChange={value => setEditing(current => current ? { ...current, company_name: value } : current)} /><AdminField label="Website" value={editing.website || ''} onChange={value => setEditing(current => current ? { ...current, website: value } : current)} /><label className="md:col-span-2 text-sm">Description (up to 3,000 characters)<textarea maxLength={NARRATIVE_MAX_LENGTH} className="mt-1 w-full rounded border border-white/20 bg-transparent p-3" rows={3} value={editing.description} onChange={event => setEditing(current => current ? { ...current, description: event.target.value } : current)} /></label><label className="text-sm">Ray of impact<select className="mt-1 w-full rounded border border-white/20 bg-zinc-950 p-3" value={editing.ray} onChange={event => setEditing(current => current ? { ...current, ray: event.target.value } : current)}>{NOMINATION_RAYS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label></div><fieldset className="grid gap-3 rounded border border-white/10 p-4"><legend className="px-1 text-sm">Beautiful Success principles</legend>{PRINCIPLE_IDS.map(id => <label className="text-sm" key={id}>{id}<textarea maxLength={NARRATIVE_MAX_LENGTH} className="mt-1 w-full rounded border border-white/20 bg-transparent p-3" rows={3} value={editing.principles[id] || ''} onChange={event => setEditing(current => current ? { ...current, principles: { ...current.principles, [id]: event.target.value } } : current)} /></label>)}</fieldset><div className="flex gap-3"><button disabled={busy} onClick={() => void saveEdit()} className="rounded-lg bg-amber-300 px-4 py-2 text-sm text-black disabled:opacity-50">{busy ? 'Saving…' : 'Save submission'}</button><button disabled={busy} onClick={() => setEditing(null)} className="rounded-lg border border-white/20 px-4 py-2 text-sm">Cancel</button></div></div> : <><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg">{row.company_name}</h3><p className="mt-2 text-sm text-zinc-400">{row.description}</p><p className="mt-2 text-xs text-zinc-500">{row.is_visible ? 'Public' : 'Pending approval'} · {new Date(row.created_at).toLocaleDateString()}</p></div><div className="flex gap-2"><button disabled={busy} onClick={() => setEditing(row)} className="rounded-lg border border-white/20 px-4 py-2 text-sm">Edit</button><button disabled={busy} onClick={() => void visibility(row)} className="rounded-lg border border-white/20 px-4 py-2 text-sm disabled:opacity-50">{row.is_visible ? 'Hide' : 'Approve'}</button></div></div><details className="mt-4 text-sm"><summary className="cursor-pointer">Principle answers</summary>{Object.entries(row.principles).filter(([,value]) => value.trim()).map(([key,value]) => <p key={key} className="mt-3 whitespace-pre-wrap"><strong className="uppercase">{key}</strong><br />{value}</p>)}</details></>}</article>)}</div>
      {more && <button disabled={busy} className="mt-4 underline" onClick={() => void load(rows.length)}>Load more submissions</button>}
    </section>
  </div>;
}

function AdminField({ label, value, onChange }: { label:string; value:string; onChange:(value:string)=>void }) {
  return <label className="text-sm">{label}<input className="mt-1 w-full rounded border border-white/20 bg-transparent p-3" value={value} onChange={event => onChange(event.target.value)} /></label>;
}
