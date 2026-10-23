import { Link } from 'react-router-dom';
import { WAIVER_PARAGRAPHS, WAIVER_VERSION } from '../../../supabase/functions/_shared/waiver';
export default function WaiverTermsPage() {
  return <main><section className="ibs-page-hero"><p className="ibs-eyebrow">Media release · Version {WAIVER_VERSION}</p><div><h1>Permission to share your contribution.</h1><p>Please read this release before signing.</p></div></section><section className="ibs-section" style={{ maxWidth: 850, margin: 'auto' }}>{WAIVER_PARAGRAPHS.map((text, i) => /^\d+\./.test(text) ? <h2 key={i} className="mt-8 mb-3 text-xl font-semibold">{text}</h2> : <p key={i} className="my-3 whitespace-pre-wrap">{text}</p>)}<Link to="/works/waiver" className="ibs-submit inline-block mt-8">Back to signing</Link></section></main>;
}
