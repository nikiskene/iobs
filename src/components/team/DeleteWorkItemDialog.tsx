import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { MomentumItem } from '../../lib/momentumTypes';

export default function DeleteWorkItemDialog({ item, onCancel, onDeleted }: {
  item: MomentumItem; onCancel: () => void; onDeleted: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const openerRef = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const dialog = ref.current;
    const opener = openerRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      requestAnimationFrame(() => { if (!dialog?.open && opener?.isConnected) opener.focus(); });
    };
  }, []);
  async function remove() {
    setBusy(true); setError('');
    try {
      const { error: deleteError } = await supabase.rpc('delete_work_item', { item_id: item.id });
      if (deleteError) throw deleteError;
      onDeleted();
    } catch {
      setError('The item could not be deleted. Check your access and try again.');
      setBusy(false);
    }
  }
  return <dialog ref={ref} aria-labelledby="delete-work-item-title" aria-describedby="delete-work-item-description"
    onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}
    className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-[#171310] p-6 text-stone-200 shadow-2xl backdrop:bg-black/75">
    <h2 id="delete-work-item-title" className="text-xl font-semibold">Delete Work item?</h2>
    <p className="mt-4 break-words font-medium text-white">{item.title}</p>
    <p id="delete-work-item-description" className="mt-3 text-sm leading-relaxed text-stone-400">This removes the item from Work and its totals. Linked documents stay in the Work repository.</p>
    {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button type="button" autoFocus disabled={busy} onClick={onCancel} className="min-h-11 rounded-full border border-white/20 px-5 text-sm disabled:opacity-50">Keep item</button>
      <button type="button" disabled={busy} onClick={() => void remove()} className="min-h-11 rounded-full bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50">{busy ? 'Deleting…' : 'Delete item'}</button>
    </div>
  </dialog>;
}
