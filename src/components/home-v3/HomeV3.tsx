import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { HOME_V3_COPY } from '../../content/homeV3Content';
import HomeV3Hero from './HomeV3Hero';
import HomeV3FivePrinciples from './HomeV3FivePrinciples';
import HomeV3ImpactRadius from './HomeV3ImpactRadius';
import InstituteFooter from '../institute/InstituteFooter';
import './homeV3.css';

export default function HomeV3() {
  const { get } = useAwardSiteContent();
  const principle = get('principle');
  const principleOutcome = outcomeFrom(principle?.headline);
  useBetaMetadata();

  return <main className="home-v3">
    <HomeV3Hero />
    <section id="the-principle" className="home-v3-proposition" aria-labelledby="principle-title">
      <p className="home-v3-label">02 — THE PRINCIPLE</p>
      <h2 id="principle-title">THE MORE SUCCESSFUL<br />IT BECOMES,</h2>
      <p className="home-v3-script">{principleOutcome}</p>
      <p className="home-v3-proposition-support">{HOME_V3_COPY.principleSupport}</p>
    </section>
    <HomeV3FivePrinciples />
    <HomeV3ImpactRadius />
    <section className="home-v3-question" aria-labelledby="opening-question-title">
      <p className="home-v3-label">05 — SO LET&apos;S BEGIN.</p>
      <h2 id="opening-question-title">If you could build<br />anything in the world…</h2>
      <p>what would you build?</p>
      <div><Link to="/about">EXPLORE THE INSTITUTE</Link><Link to="/nominate">NOMINATE / ENTER</Link></div>
    </section>
    <InstituteFooter />
  </main>;
}

function outcomeFrom(headline?: string | null) {
  if (!headline) return 'the better the world becomes.';
  const [, ...outcome] = headline.split(',');
  return outcome.join(',').trim() || 'the better the world becomes.';
}

function useBetaMetadata() {
  useEffect(() => {
    const previousTitle = document.title;
    const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobots = existing?.content;
    const robots = existing ?? document.head.appendChild(document.createElement('meta'));
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.title = 'Beautiful Success — Homepage V3 Beta';
    return () => {
      document.title = previousTitle;
      if (existing && previousRobots !== undefined) existing.content = previousRobots;
      else robots.remove();
    };
  }, []);
}
