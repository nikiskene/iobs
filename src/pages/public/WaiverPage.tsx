import { useRef, useState, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { WAIVER_VERSION } from '../../../supabase/functions/_shared/waiver';

export default function WaiverPage() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const points = useRef(0);
  const [signed, setSigned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [error, setError] = useState('');
  function position(e: PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return [(e.clientX - rect.left) * 1000 / rect.width, (e.clientY - rect.top) * 300 / rect.height];
  }
  function start(e: PointerEvent<HTMLCanvasElement>) {
    if (busy) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = e.currentTarget.getContext('2d')!;
    const [x, y] = position(e); ctx.beginPath(); ctx.moveTo(x, y);
  }
  function move(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || busy) return;
    const ctx = e.currentTarget.getContext('2d')!;
    ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#111';
    const [x, y] = position(e); ctx.lineTo(x, y); ctx.stroke();
    points.current += 1; if (points.current > 5) setSigned(true);
  }
  function clear() { canvas.current?.getContext('2d')?.clearRect(0, 0, 1000, 300); points.current = 0; setSigned(false); }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    if (!signed) { setError('Please draw your signature before submitting.'); return; }
    const form = new FormData(e.currentTarget); setBusy(true); setError('');
    try {
      const { data, error: failure } = await supabase.functions.invoke('submit-waiver', { body: {
        full_name: String(form.get('full_name') || '').trim(), email: String(form.get('email') || '').trim(),
        accepted: form.get('accepted') === 'on', version: WAIVER_VERSION,
        signature: canvas.current!.toDataURL('image/png'), website: form.get('website'),
      } });
      if (failure || !data?.id) throw new Error('Your waiver could not be saved. Please try again.');
      setReceipt(data.id);
    } catch (err) { setError(err instanceof Error ? err.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  return <main><section className="ibs-page-hero"><p className="ibs-eyebrow">Media release</p><div><h1>Your voice. Shared with permission.</h1><p>Give us permission to record and share your contribution through the Institute of Beautiful Success website, social channels and the other uses described in the release.</p></div></section><section className="ibs-section" style={{ maxWidth: 760, margin: 'auto' }}>
    {receipt ? <div role="status"><h2 className="text-2xl">Thank you. Your permission is recorded.</h2><p className="mt-4">Reference: {receipt}</p><p className="mt-4">To ask about your consent or withdraw consent for future use, email <a className="underline" href="mailto:help@iobs.cc">help@iobs.cc</a>.</p><Link className="underline" to="/works/waiver/terms">Read the release</Link></div> : <form className="award-form" onSubmit={submit}>
      <label>Full name<input name="full_name" autoComplete="name" required maxLength={120} disabled={busy} /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required maxLength={200} disabled={busy} /></label>
      <p>IACY International FZCO operates the Institute. The release also covers WorldOS, the Beautiful Success Award, educational, editorial and promotional uses. Participation is voluntary and unpaid unless separately agreed. You can request withdrawal for future use at <a href="mailto:help@iobs.cc" className="underline">help@iobs.cc</a>.</p>
      <div className="flex items-start gap-3"><input id="waiver-consent" name="accepted" type="checkbox" required disabled={busy} style={{ width: 20, height: 20, flexShrink: 0, marginTop: 4 }} /><label htmlFor="waiver-consent" style={{ display: 'block' }}>I have read and accept the <Link className="underline" to="/works/waiver/terms" target="_blank" rel="noopener">media release and consent</Link>, including the use of my material as described. I confirm that I am at least 18 and am signing for myself.</label></div>
      <div><p id="signature-label" className="mb-2">Signature — draw with your finger, pen or mouse</p><canvas ref={canvas} width={1000} height={300} aria-labelledby="signature-label" onPointerDown={start} onPointerMove={move} onPointerUp={() => { drawing.current = false; }} onPointerCancel={() => { drawing.current = false; }} style={{ width: '100%', height: 180, touchAction: 'none', background: '#fff', border: '1px solid #aaa', borderRadius: 8 }} /><button type="button" className="underline mt-2" disabled={busy} onClick={clear}>Clear signature</button><p className="text-sm mt-2">Your signature is stored privately as an image with your name, email, signing time and this release.</p></div>
      <input name="website" className="contact-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error && <p role="alert">{error}</p>}<button className="ibs-submit" disabled={busy}>{busy ? 'Saving…' : 'Sign and give permission'}</button>
    </form>}
  </section></main>;
}
