// src/pages/awards/NominatePage.tsx
import { useState, type FormEvent } from 'react';
import AwardPageHero from '../../components/awards/AwardPageHero';
import { supabase } from '../../lib/supabase';
import { useLocale } from '../../providers/LocaleProvider';
import { getAwardLocaleContent } from '../../content/awardLocaleContent';

export default function NominatePage() {
  const { locale } = useLocale();
  const content = getAwardLocaleContent(locale);
  const p = content.pages;
  const [state, setState] = useState<'idle'|'sending'|'sent'|'error'>('idle');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const nominee = String(data.get('name') || '').trim();
    const category = String(data.get('category') || '').trim();
    const why = String(data.get('why') || '').trim();
    const link = String(data.get('link') || '').trim();
    const email = String(data.get('email') || '').trim();
    const { error } = await supabase.from('contact_messages').insert({
      name: nominee,
      email,
      organization: null,
      reason: `AWARD NOMINATION · ${category.toUpperCase()}`,
      message: `Nominee: ${nominee}\nCategory: ${category}\nWhy Beautiful Success: ${why}${link ? `\nEvidence: ${link}` : ''}\nLanguage: ${locale.toUpperCase()}`,
    });
    if (error) { setState('error'); return; }
    formElement.reset();
    setState('sent');
  }

  return (
    <main>
      <AwardPageHero eyebrow={p.nominateEyebrow} title={p.nominateTitle}>{p.nominateIntro}</AwardPageHero>
      <section className="ibs-section nomination-layout">
        <div><h2>{p.searchOpen}</h2><p>{p.searchCopy}</p></div>
        <form className="award-form" onSubmit={submit}>
          <label>{p.scale}<select name="category" required>{content.categories.map((item) => <option key={item.slug} value={item.name}>{item.name}</option>)}</select></label>
          <label>{p.who}<input name="name" required /></label>
          <label>{p.whyBeautiful}<textarea name="why" required rows={5} /></label>
          <label>{p.evidence}<input name="link" type="url" /></label>
          <label>{p.yourEmail}<input name="email" type="email" required /></label>
          <button className="award-button" type="submit" disabled={state === 'sending'}>{state === 'sending' ? '…' : p.prepare}</button>
          {state === 'sent' && <p>{p.sent}</p>}
          {state === 'error' && <p>Could not send. Please use the contact page.</p>}
        </form>
      </section>
    </main>
  );
}
