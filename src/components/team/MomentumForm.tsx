import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { momentumCategories, type MomentumItem, type MomentumOwner, type MomentumStatus } from '../../lib/momentumTypes';

export default function MomentumForm({ item, owners, currentUserId, onClose, onSaved }: {
  item: MomentumItem | null; owners: MomentumOwner[]; currentUserId: string;
  onClose: () => void; onSaved: () => void;
}) {
  const [title, setTitle] = useState(item?.title || '');
  const [ownerId, setOwnerId] = useState(item?.owner_user_id || currentUserId);
  const [status, setStatus] = useState<MomentumStatus>(item?.status || 'pushing');
  const [nextMove, setNextMove] = useState(item?.next_move || '');
  const [description, setDescription] = useState(item?.description || '');
  const [category, setCategory] = useState(item?.category || '');
  const [targetDate, setTargetDate] = useState(item?.target_date || '');
  const [waitingOn, setWaitingOn] = useState(item?.waiting_on || '');
  const [stuckReason, setStuckReason] = useState(item?.stuck_reason || '');
  const [intervention, setIntervention] = useState(item?.intervention_needed || '');
  const [factSummary, setFactSummary] = useState(item?.fact_summary || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'waiting') setWaitingOn('');
    if (status !== 'stuck') { setStuckReason(''); setIntervention(''); }
  }, [status]);

  async function save() {
    if (!title.trim() || !ownerId) return setError('Title and owner are required.');
    setSaving(true); setError('');
    const payload = {
      title: title.trim(), owner_user_id: ownerId, status, next_move: nextMove.trim() || null,
      description: description.trim() || null, category: category || null,
      target_date: targetDate || null, waiting_on: waitingOn.trim() || null,
      stuck_reason: stuckReason.trim() || null, intervention_needed: intervention.trim() || null,
      fact_summary: factSummary.trim() || null,
    };
    const query = item
      ? supabase.from('momentum_items').update(payload).eq('id', item.id)
      : supabase.from('momentum_items').insert(payload);
    const { error: saveError } = await query;
    if (saveError) { setError(saveError.message); setSaving(false); return; }
    onSaved();
  }

  const input = 'w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white outline-none transition focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10';
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true">
    <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#171310] p-5 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7">
      <div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-[0.25em] text-amber-400">{item ? 'Edit momentum' : 'Create momentum'}</p><h2 className="mt-1 font-serif text-2xl text-stone-100">What are we making real?</h2></div><button onClick={onClose} className="rounded-full p-2 text-stone-400 hover:bg-white/5 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Title" wide><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className={input} placeholder="The outcome we are pushing toward" /></Field>
        <Field label="Owner"><select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className={input}>{owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.full_name || 'Unnamed team member'}</option>)}</select></Field>
        <Field label="Status"><select value={status} onChange={(e) => setStatus(e.target.value as MomentumStatus)} className={input}><option value="pushing">Pushing</option><option value="waiting">Waiting</option><option value="stuck">Stuck</option><option value="fact">Fact</option></select></Field>
        <Field label="Next move" wide><input value={nextMove} onChange={(e) => setNextMove(e.target.value)} className={input} placeholder="The next concrete action" /></Field>
        <Field label="Category"><select value={category} onChange={(e) => setCategory(e.target.value)} className={input}><option value="">No category</option>{momentumCategories.map((value) => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Target date"><input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={input} /></Field>
        {status === 'waiting' && <Field label="Waiting on" wide><input value={waitingOn} onChange={(e) => setWaitingOn(e.target.value)} className={input} placeholder="Person, organization, or response" /></Field>}
        {status === 'stuck' && <><Field label="Why is it stuck?"><input value={stuckReason} onChange={(e) => setStuckReason(e.target.value)} className={input} /></Field><Field label="Intervention needed"><input value={intervention} onChange={(e) => setIntervention(e.target.value)} className={input} /></Field></>}
        {status === 'fact' && <Field label="What became real?" wide><textarea value={factSummary} onChange={(e) => setFactSummary(e.target.value)} className={`${input} resize-none`} rows={2} placeholder="Optional—use when the achieved outcome differs from the title" /></Field>}
        <Field label="Context" wide><textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${input} resize-none`} rows={3} placeholder="Optional context" /></Field>
      </div>
      {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="rounded-full px-5 py-2.5 text-sm text-stone-400 hover:text-white">Cancel</button><button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-stone-950 hover:bg-amber-300 disabled:opacity-50"><Check className="h-4 w-4" />{saving ? 'Saving…' : item ? 'Save changes' : 'Create item'}</button></div>
    </div>
  </div>;
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? 'sm:col-span-2' : ''}><span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-stone-500">{label}</span>{children}</label>;
}
