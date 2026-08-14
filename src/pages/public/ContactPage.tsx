// src/pages/public/ContactPage.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const REASONS = ['Founding Host', 'Founding Partner', 'Category Partner', 'Media Partner', 'Award nomination', 'Press', 'Other'];

export default function ContactPage() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending'); setError('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (form.get('website')) { setState('sent'); return; }
    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      organization: String(form.get('organization') || '').trim() || null,
      reason: String(form.get('reason') || '').trim(),
      message: String(form.get('message') || '').trim(),
    });
    if (insertError) { setError('Your message could not be sent. Please email hello@worldos.institute.'); setState('error'); return; }
    formElement.reset(); setState('sent');
  }

  return (
    <main>
      <section className="ibs-page-hero"><p className="ibs-eyebrow">The founding invitation</p><div><h1>Begin a beautiful conversation.</h1><p>Tell us how you would like to help establish what the world celebrates as success.</p></div></section>
      <section className="ibs-section nomination-layout">
        <div><p className="award-label">Contact the Institute</p><h2>It begins with one conversation.</h2><p>Founding host, partner, media, award and press inquiries arrive directly in the Institute's private inbox.</p><a className="ibs-contact-link" href="mailto:hello@worldos.institute">hello@worldos.institute</a></div>
        {state === 'sent' ? <div className="award-form award-form-success"><h2>Thank you.</h2><p>Your message has reached the Institute. We will be in touch personally.</p><button className="award-text-link" onClick={() => setState('idle')}>Send another message</button></div> :
        <form className="award-form" onSubmit={submit}>
          <label>Name<input name="name" required maxLength={120} /></label>
          <label>Email<input name="email" type="email" required maxLength={200} /></label>
          <label>Organization<input name="organization" maxLength={200} /></label>
          <label>Reason<select name="reason" required defaultValue=""><option value="" disabled>Select one</option>{REASONS.map((reason) => <option key={reason}>{reason}</option>)}</select></label>
          <label>Message<textarea name="message" rows={7} required maxLength={5000} /></label>
          <input className="contact-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          {state === 'error' && <p className="ibs-form-error">{error}</p>}
          <button className="ibs-submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message'}</button>
        </form>}
      </section>
    </main>
  );
}
