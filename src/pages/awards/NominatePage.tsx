import { useRef, useState, type FormEvent } from 'react';
import AwardPageHero from '../../components/awards/AwardPageHero';
import { supabase } from '../../lib/supabase';
import { useLocale } from '../../providers/LocaleProvider';
import { getAwardLocaleContent } from '../../content/awardLocaleContent';
import { getNominationContent, NARRATIVE_MAX_LENGTH, narrativeLimitError, NOMINATION_RAYS, PRINCIPLE_IDS } from '../../content/nominationContent';
import FieldHelp from '../../components/acknowledgement/FieldHelp';
import './nomination.css';

export default function NominatePage() {
  const { locale } = useLocale();
  const p = getAwardLocaleContent(locale).pages;
  const copy = getNominationContent(locale);
  const [state, setState] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [limitError, setLimitError] = useState('');
  const [missingPrinciple, setMissingPrinciple] = useState(false);
  const sending = useRef(false);
  const firstAnswer = useRef<HTMLTextAreaElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const read = (key: string) => String(data.get(key) || '').trim();
    const lengthError = narrativeLimitError('', Object.fromEntries(PRINCIPLE_IDS.map(id => [id, String(data.get(id) || '')])));
    setLimitError(lengthError);
    if (lengthError) return;
    const answers = PRINCIPLE_IDS.map(read);
    if (!answers.some(Boolean)) {
      setMissingPrinciple(true);
      firstAnswer.current?.focus();
      return;
    }
    const ray = NOMINATION_RAYS.find(([id]) => id === read('ray'));
    if (!ray) return;
    setMissingPrinciple(false);
    sending.current = true;
    setState('sending');
    try {
      const { error } = await supabase.rpc('submit_award_nomination', {
        p_name: read('name'), p_email: read('email'), p_ray: ray[0], p_ray_label: ray[1],
        p_principles: Object.fromEntries(PRINCIPLE_IDS.map((id, index) => [id, answers[index]])),
        p_link: read('link'), p_locale: locale,
      });
      if (error) throw error;
      formElement.reset();
      setState('sent');
    } catch {
      setState('error');
    } finally {
      sending.current = false;
    }
  }

  return (
    <main>
      <AwardPageHero eyebrow={p.nominateEyebrow} title={p.nominateTitle}>{p.nominateIntro}</AwardPageHero>
      <section className="ibs-section nomination-layout">
        <div><h2>{p.searchOpen}</h2><p>{p.searchCopy}</p></div>
        <form className="award-form nomination-form" onSubmit={submit} onChange={() => {
          if (state === 'sent') setState('idle');
        }}>
          <fieldset disabled={state === 'sending'} className="nomination-fields">
            <label>{p.who}<input name="name" required maxLength={120} pattern=".*\S.*" /></label>
            <label>{copy.ray}<select name="ray" required defaultValue="" aria-describedby="ray-help">
              <option value="" disabled>{copy.choose}</option>
              {NOMINATION_RAYS.map(([id, en, ar]) => <option key={id} value={id}>{locale === 'ar' ? ar : en}</option>)}
            </select></label>
            <p id="ray-help" className="nomination-help">{copy.rayHelp}</p>
            <fieldset className="nomination-principles" aria-describedby="principles-help">
              <legend>{copy.title}</legend>
              <p id="principles-help" className="nomination-help">{copy.guidance}</p>
              <p className="nomination-help">{copy.limit}</p>
              {missingPrinciple && <p id="principles-error" role="alert">{copy.required}</p>}
              {PRINCIPLE_IDS.map((id, index) => {
                const [title, question, explanation, example] = copy.principles[index];
                return <div key={id} className="nomination-principle">
                  <div className="nomination-field-heading"><label htmlFor={`principle-${id}`}><span>{title}</span><span className="nomination-question">{question}</span></label><FieldHelp field={id} locale={locale} /></div>
                  <p id={`${id}-help`} className="nomination-help">{explanation}</p>
                  <p id={`${id}-example`} className="nomination-example">{copy.example}: {example}</p>
                  <textarea id={`principle-${id}`} name={id} rows={4} maxLength={NARRATIVE_MAX_LENGTH}
                    ref={index === 0 ? firstAnswer : undefined}
                    aria-describedby={`${id}-help ${id}-example${missingPrinciple ? ' principles-error' : ''}`}
                    onChange={(event) => { if (event.target.value.trim()) setMissingPrinciple(false); }} />
                </div>;
              })}
            </fieldset>
            <label>{p.evidence}<input name="link" type="url" maxLength={500} /></label>
            <label>{p.yourEmail}<input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
            <button className="award-button" type="submit">{state === 'sending' ? '…' : p.prepare}</button>
          </fieldset>
          {limitError && <p role="alert">{limitError}</p>}
          {state === 'sent' && <p role="status">{p.sent}</p>}
          {state === 'error' && <p role="alert">{copy.error}</p>}
        </form>
      </section>
    </main>
  );
}
