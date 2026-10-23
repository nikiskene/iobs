import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
type Waiver = { id: string; full_name: string; email: string; signed_at: string; legal_version: string; legal_text: string; signature_path: string };
export default function WaiversPage() {
  const [rows, setRows] = useState<Waiver[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [signature, setSignature] = useState('');
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    void supabase.from('media_waivers').select('*').order('signed_at', { ascending: false }).range(page * 50, page * 50 + 49).then(({ data, error }) => { if (active) { setRows(data || []); setError(error ? 'Could not load waivers.' : ''); setLoading(false); } });
    return () => { active = false; };
  }, [page]);
  async function showSignature(path: string) {
    const { data, error } = await supabase.storage.from('waiver-signatures').createSignedUrl(path, 120);
    if (error) setError('Could not open signature. Please try again.'); else setSignature(data.signedUrl);
  }
  return <section className="text-stone-200"><div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl">Signed media waivers</h1><Link className="underline" to="/works/waiver">Open participant form</Link></div><p className="mt-4">Share the participant form with people before recording. Signatures and contact details are private to the team.</p>{error && <p role="alert">{error}</p>}{loading ? <p className="mt-6">Loading…</p> : <div className="mt-6 space-y-4">{rows.map(row => <article key={row.id} className="rounded-xl border border-white/10 p-5"><h2 className="font-semibold">{row.full_name}</h2><p>{row.email}</p><p>{new Date(row.signed_at).toLocaleString()} · Release {row.legal_version}</p><p className="text-xs mt-2">Reference: {row.id}</p><button className="underline mt-3" onClick={() => void showSignature(row.signature_path)}>View signature</button><details className="mt-3"><summary>Legal text accepted</summary><p className="whitespace-pre-wrap mt-3">{row.legal_text}</p></details></article>)}{!rows.length && <p>No waivers on this page.</p>}</div>}<div className="flex gap-6 mt-6"><button disabled={loading || page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1}</span><button disabled={loading || rows.length < 50} onClick={() => setPage(page + 1)}>Next</button></div>{signature && <div role="dialog" aria-modal="true" aria-label="Participant signature" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6"><button autoFocus className="mb-4 underline" onClick={() => setSignature('')}>Close signature</button><img src={signature} alt="Participant’s drawn signature" className="max-w-full bg-white" /></div>}</section>;
}
