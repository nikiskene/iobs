// src/pages/admin/ContactMessagesAdmin.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type ContactMessage = { id:string; name:string; email:string; organization:string|null; reason:string; message:string; status:string; created_at:string };

export default function ContactMessagesAdmin() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    setMessages((data as ContactMessage[]) || []); setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function setStatus(id:string, status:string) {
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (!error) setMessages((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  }

  return (
    <div className="space-y-6">
      <div><p className="text-sm uppercase tracking-[.3em] text-zinc-500">Messaging</p><h1 className="mt-3 text-3xl font-semibold text-white">Contact inbox</h1><p className="mt-2 text-sm text-zinc-400">All public contact and partnership requests arrive here.</p></div>
      {loading ? <p className="text-zinc-500">Loading messages…</p> : messages.length === 0 ? <p className="rounded-xl border border-white/10 p-5 text-zinc-500">No contact messages yet.</p> :
      <div className="grid gap-4">{messages.map((item) => {
        const deckRequest = item.reason.includes('DECK REQUEST');
        return <article key={item.id} className={`rounded-2xl border p-5 ${deckRequest ? 'border-amber-400/30 bg-amber-400/[.05]' : 'border-white/10 bg-white/[.03]'}`}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className={`text-xs uppercase tracking-wider ${deckRequest ? 'text-amber-300' : 'text-sky-300'}`}>{item.reason}</p>{deckRequest && <span className="mt-2 inline-block rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-amber-200">Send partnership deck</span>}<h2 className="mt-2 text-xl text-white">{item.name}</h2><p className="text-sm text-zinc-400">{item.organization || 'Independent'} · <a className="text-sky-300" href={`mailto:${item.email}`}>{item.email}</a></p></div><select value={item.status} onChange={(e) => setStatus(item.id, e.target.value)} className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"><option value="new">New</option><option value="in_progress">In progress</option><option value="answered">Answered</option><option value="archived">Archived</option></select></div>
          <p className="mt-5 whitespace-pre-line border-t border-white/10 pt-5 text-sm leading-6 text-zinc-300">{item.message}</p><p className="mt-4 text-xs text-zinc-600">{new Date(item.created_at).toLocaleString()}</p>
        </article>;
      })}</div>}
    </div>
  );
}
