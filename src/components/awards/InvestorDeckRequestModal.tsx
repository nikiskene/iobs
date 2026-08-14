// src/components/awards/InvestorDeckRequestModal.tsx
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Props = { open: boolean; onClose: () => void };

export default function InvestorDeckRequestModal({ open, onClose }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', close); };
  }, [open, onClose]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending'); setError('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (form.get('website')) { setState('sent'); return; }
    const note = String(form.get('message') || '').trim();
    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      organization: String(form.get('organization') || '').trim() || null,
      reason: 'PARTNERSHIP DECK REQUEST · FOUNDING PARTNERS',
      message: note || 'Requested the Beautiful Success Award Founding Partnership Deck.',
    });
    if (insertError) { setError('Your request could not be sent. Please use the main contact form.'); setState('error'); return; }
    formElement.reset(); setState('sent');
  }

  if (!open) return null;

  return <div className="deck-modal" role="dialog" aria-modal="true" aria-labelledby="deck-modal-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="deck-modal-card">
      <button className="deck-modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
      {state === 'sent' ? <div className="deck-modal-success"><p className="award-label">Request received</p><h2 id="deck-modal-title">The founding conversation starts here.</h2><p>Your request is in the Institute inbox. We will send the partnership deck personally.</p><button className="award-button" onClick={onClose}>Close</button></div> : <>
        <p className="award-label">Founding Partners</p>
        <h2 id="deck-modal-title">Request the Partnership Deck.</h2>
        <p className="deck-modal-intro">Six ways to found, advance, amplify, sustain and celebrate Beautiful Success. Tell us who you are and we will send you the full partnership architecture.</p>
        <form className="award-form deck-modal-form" onSubmit={submit}>
          <label>Name<input name="name" required maxLength={120} autoFocus /></label>
          <label>Email<input name="email" type="email" required maxLength={200} /></label>
          <label>Organization<input name="organization" maxLength={200} /></label>
          <label>Anything we should know?<textarea name="message" rows={4} maxLength={3000} /></label>
          <input className="contact-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          {state === 'error' && <p className="ibs-form-error">{error}</p>}
          <button className="ibs-submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Request Partnership Deck'}</button>
        </form>
      </>}
    </div>
  </div>;
}
