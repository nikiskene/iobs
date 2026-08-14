// src/components/awards/AwardHomepageSections.tsx
import { Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AWARD_TEST, RECOGNITION_LEVELS } from '../../content/awardContent';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import AwardMethodSections from './AwardMethodSections';

export default function AwardHomepageSections() {
  const { get } = useAwardSiteContent();
  const principle = get('principle');
  const judging = get('judging_intro');
  const recognition = get('recognition_intro');
  const voices = get('voices_intro');
  const founding = get('founding_edition');

  return (
    <>
      <section className="award-principle">
        <p className="award-label">{principle?.label}</p>
        <h2>{principle?.headline}</h2>
        {principle?.body && <p>{principle.body}</p>}
      </section>
      <AwardMethodSections />
      <section className="award-home-section">
        <div className="award-section-title"><p className="award-label">{judging?.label}</p><h2>{judging?.headline}</h2></div>
        <div className="award-test-grid">{AWARD_TEST.map((item) => <article key={item.number} className={item.number === '06' ? 'award-test-moonshot' : undefined}>{item.number === '06' && <Rocket className="moonshot-icon" aria-hidden="true" />}<span>{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
        <Link className="award-text-link" to="/judging">Explore the judging standard →</Link>
      </section>
      <section className="award-home-section">
        <div className="award-section-title"><p className="award-label">{recognition?.label}</p><h2>{recognition?.headline}</h2></div>
        <div className="recognition-list">{RECOGNITION_LEVELS.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="founding-voices">
        <p className="award-label">{voices?.label}</p>
        <h2>{voices?.headline}</h2>
        {voices?.body && <p>{voices.body}</p>}
        <Link className="award-button" to="/voices">Discover Founding Voices</Link>
      </section>
      <section className="award-home-section founding-edition">
        <div className="award-section-title"><p className="award-label">{founding?.label}</p><h2>{founding?.headline}</h2></div>
        {founding?.subheadline && <p>{founding.subheadline}</p>}
        <div><Link className="award-button" to="/nominate">Nominate a beautiful success</Link><Link className="award-text-link" to="/partners">Become a Founding Partner →</Link></div>
      </section>
    </>
  );
}
