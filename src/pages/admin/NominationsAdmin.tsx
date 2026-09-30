import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNominationMode, type NominationMode } from '../../providers/NominationModeProvider';
import type { AcknowledgementNomination } from '../../lib/acknowledgements';
type Row = Omit<AcknowledgementNomination, 'upvotes' | 'downvotes' | 'my_vote'> & { is_visible: boolean };
export default function NominationsAdmin() {
  const { mode, error: modeError, refresh } = useNominationMode();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [more, setMore] = useState(false);
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
      <div className="space-y-4">{rows.map(row => <article key={row.id} className="rounded-xl border border-white/10 p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg">{row.company_name}</h3><p className="mt-2 text-sm text-zinc-400">{row.description}</p><p className="mt-2 text-xs text-zinc-500">{row.is_visible ? 'Public' : 'Pending approval'} · {new Date(row.created_at).toLocaleDateString()}</p></div><button disabled={busy} onClick={() => void visibility(row)} className="rounded-lg border border-white/20 px-4 py-2 text-sm disabled:opacity-50">{row.is_visible ? 'Hide' : 'Approve'}</button></div><details className="mt-4 text-sm"><summary className="cursor-pointer">Principle answers</summary>{Object.entries(row.principles).filter(([,value]) => value.trim()).map(([key,value]) => <p key={key} className="mt-3 whitespace-pre-wrap"><strong className="uppercase">{key}</strong><br />{value}</p>)}</details></article>)}</div>
      {more && <button disabled={busy} className="mt-4 underline" onClick={() => void load(rows.length)}>Load more submissions</button>}
    </section>
  </div>;
}
