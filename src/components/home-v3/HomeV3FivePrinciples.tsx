import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';

const PRINCIPLE_KEYS = ['v3_principle_philanthropy','v3_principle_new_focus','v3_principle_echo','v3_principle_momentum','v3_principle_legacy'];

export default function HomeV3FivePrinciples() {
  const { get } = useAwardSiteContent();
  const intro = get('v3_principles_intro');
  return <section className="home-v3-principles" aria-labelledby="five-principles-title">
    <header className="home-v3-section-head">
      <p className="home-v3-label">{intro?.label}</p>
      <h2 id="five-principles-title">{intro?.headline}</h2>
    </header>
    <div className="home-v3-principle-territories">
      {PRINCIPLE_KEYS.map((key,index) => { const principle = get(key); return <article key={key} style={principle?.media_url ? { backgroundImage:`linear-gradient(0deg,#020204 0%,#02020499 50%,#02020422 100%),url(${principle.media_url})` } : undefined}>
        <div><h3>{principle?.label}</h3><p>{principle?.headline}</p></div>
        <span>{String(index + 1).padStart(2,'0')}</span>
      </article>; })}
    </div>
  </section>;
}
