import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNominationMode } from '../../providers/NominationModeProvider';
import { getNominationContent, NOMINATION_RAYS, PRINCIPLE_IDS } from '../../content/nominationContent';
import { safeWebUrl } from '../../lib/acknowledgements';
import '../awards/nomination.css';
import './acknowledgement.css';

export default function AcknowledgementForm() {
  const { mode, error: modeError, refresh } = useNominationMode();
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const sending = useRef(false);
  const uploadedImage = useRef<{ file: File; url: string } | null>(null);
  const copy = getNominationContent('en');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (name: string) => String(data.get(name) || '').trim();
    const principles = Object.fromEntries(PRINCIPLE_IDS.map(id => [id, read(id)]));
    if (!Object.values(principles).some(Boolean)) { setError(copy.required); return; }
    if (!safeWebUrl(read('website'))) { setError('Please enter an http or https company website.'); return; }
    const file = (form.elements.namedItem('image') as HTMLInputElement).files?.[0];
    if (file && (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 3145728)) { setError('Choose a JPG, PNG or WebP image up to 3 MB.'); return; }
    sending.current = true; setSaving(true); setError('');
    try {
      let imageUrl = '';
      if (file) {
        if (uploadedImage.current?.file === file) imageUrl = uploadedImage.current.url;
        else {
          const path = `${crypto.randomUUID()}.${file.type.split('/')[1]}`;
          const upload = await supabase.storage.from('acknowledgement-images').upload(path, file);
          if (upload.error) throw new Error('The image could not be uploaded. Please try again.');
          imageUrl = supabase.storage.from('acknowledgement-images').getPublicUrl(path).data.publicUrl;
          uploadedImage.current = { file, url: imageUrl };
        }
      }
      const result = await supabase.rpc('submit_acknowledgement', {
        p_company_name: read('company'), p_website: read('website'), p_image_url: imageUrl,
        p_description: read('description'), p_ray: read('ray'), p_principles: principles,
        p_name: read('name'), p_email: read('email'),
      });
      if (result.error) throw new Error('The nomination could not be submitted. Please check your answers and try again. Submissions are limited to five per email per day.');
      setSent(true); form.reset(); uploadedImage.current = null;
    } catch (err) { setError(err instanceof Error ? err.message : 'Please try again. Your answers are still here.'); }
    finally { sending.current = false; setSaving(false); }
  }
  if (modeError) return <section className="ibs-section"><p role="alert">{modeError}</p><button onClick={() => void refresh()}>Try again</button></section>;
  if (!mode) return <div className="route-loader" aria-label="Loading" />;
  if (sent) return <section className="ack-page ack-hero"><p className="ibs-eyebrow">Nomination submitted</p><h1>Thank you for<br /><em>bringing it to light.</em></h1><p>Your nomination is now with the Institute for review. It will appear in the public gallery once it has been approved.</p><Link className="award-button" to="/acknowledgement">See the nominations</Link></section>;
  if (mode !== 'acknowledgement') return <section className="ibs-section"><h1>Acknowledgement submissions are closed.</h1><Link to="/acknowledgement">Explore the nominations</Link></section>;
  return <main className="ack-page"><section className="ack-hero"><Link className="ack-back" to="/acknowledgement">← All nominations</Link><p className="ibs-eyebrow">Beautiful Success · Acknowledgement</p><h1>Bring beautiful<br /><em>success into view.</em></h1><p>Nominate a company and tell us what makes its contribution matter.</p></section>
    <section className="ibs-section nomination-layout"><div><h2>A company.<br />A contribution.<br />A reason to notice.</h2><p>Choose the main ray of impact and answer at least one of the five principles.</p><p>Each nomination is reviewed by the Institute before it appears publicly. Company details and your principle answers will appear in the gallery once approved. Your name and email stay private.</p></div>
      <form className="award-form nomination-form" onSubmit={submit}><fieldset className="nomination-fields" disabled={saving}>
        <label>Company name<input name="company" required maxLength={120} pattern=".*\S.*" /></label>
        <label>Company website<input name="website" type="url" required maxLength={500} placeholder="https://" /></label>
        <label>Short description<textarea name="description" required maxLength={360} rows={3} placeholder="What does this company do, and what difference does it make?" /></label>
        <label>Photo or logo (optional)<input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label><p className="nomination-help">JPG, PNG or WebP, up to 3 MB. Use an image you have permission to share.</p>
        <label>{copy.ray}<select name="ray" required defaultValue=""><option value="" disabled>{copy.choose}</option>{NOMINATION_RAYS.map(([id,en]) => <option key={id} value={id}>{en}</option>)}</select></label><p className="nomination-help">{copy.rayHelp}</p>
        <fieldset className="nomination-principles"><legend>{copy.title}</legend><p className="nomination-help">{copy.guidance}</p>{PRINCIPLE_IDS.map((id,index) => { const [title,question,explanation,example] = copy.principles[index]; return <div className="nomination-principle" key={id}><label htmlFor={`ack-${id}`}><span>{title}</span><span className="nomination-question">{question}</span></label><p id={`ack-${id}-help`} className="nomination-help">{explanation}</p><p className="nomination-example">For example: {example}</p><textarea id={`ack-${id}`} name={id} maxLength={750} rows={4} aria-describedby={`ack-${id}-help`} /></div>; })}</fieldset>
        <label>Your name<input name="name" required maxLength={120} pattern=".*\S.*" autoComplete="name" /></label>
        <label>Your email<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" className="award-button">{saving ? 'Submitting…' : 'Submit company nomination'}</button>
      </fieldset></form>
    </section>
  </main>;
}
