import { useEffect, useState } from 'react';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import type { AwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { useNearViewport } from '../../hooks/useNearViewport';
import { optimizedImageUrl, viewportImageWidth } from '../../lib/media';

const PRINCIPLE_KEYS = ['v3_principle_philanthropy','v3_principle_new_focus','v3_principle_echo','v3_principle_momentum','v3_principle_legacy'];

export default function HomeV3FivePrinciples() {
  const { get } = useAwardSiteContent();
  const intro = get('v3_principles_intro');
  const [openPrinciple, setOpenPrinciple] = useState<AwardSiteContent | null>(null);
  const section = useNearViewport<HTMLElement>('150px');
  const imageWidth = viewportImageWidth(700, 420);
  useEffect(() => {
    if (!openPrinciple) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenPrinciple(null); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [openPrinciple]);
  return <section ref={section.ref} id="principles" className="home-v3-principles" aria-labelledby="five-principles-title">
    <header className="home-v3-section-head">
      <p className="home-v3-label">{intro?.label}</p>
      <h2 id="five-principles-title">{intro?.headline}</h2>
    </header>
    <div className="home-v3-principle-territories">
      {PRINCIPLE_KEYS.map((key,index) => { const principle = get(key); return <button type="button" key={key} aria-haspopup="dialog" onClick={() => principle && setOpenPrinciple(principle)} style={section.isNear && principle?.media_url ? { backgroundImage:`linear-gradient(0deg,#020204 0%,#02020499 50%,#02020422 100%),url(${optimizedImageUrl(principle.media_url, imageWidth)})` } : undefined}>
        <div><h3>{principle?.label}</h3><p>{principle?.headline}</p></div>
        <span>{String(index + 1).padStart(2,'0')}</span>
      </button>; })}
    </div>
    {openPrinciple && <div className="home-v3-principle-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenPrinciple(null); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="principle-dialog-title">
        <button type="button" className="home-v3-modal-close" aria-label="Close" onClick={() => setOpenPrinciple(null)}>×</button>
        <p className="home-v3-label">The Five Principles</p>
        <h2 id="principle-dialog-title">{openPrinciple.label}</h2>
        {openPrinciple.headline && <h3>{openPrinciple.headline}</h3>}
        {openPrinciple.subheadline && <p className="home-v3-modal-lead">{openPrinciple.subheadline}</p>}
        {openPrinciple.body && <p>{openPrinciple.body}</p>}
      </section>
    </div>}
  </section>;
}
