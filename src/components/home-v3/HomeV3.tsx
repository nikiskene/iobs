import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { cmsLines, HOME_V3_HERO_IMAGES } from '../../content/homeV3Content';
import HomeV3Hero from './HomeV3Hero';
import HomeV3FivePrinciples from './HomeV3FivePrinciples';
import HomeV3ImpactRadius from './HomeV3ImpactRadius';
import InstituteFooter from '../institute/InstituteFooter';
import './homeV3.css';
import './homeV3Mockup.css';

export default function HomeV3() {
  const { get } = useAwardSiteContent();
  const hero = get('v3_hero');
  const configuredImages = cmsLines(get('v3_hero_images')?.body);
  const heroImages = configuredImages?.length ? configuredImages : HOME_V3_HERO_IMAGES;
  const principle = get('v3_principle');
  const question = get('v3_question');
  const [heroImage, setHeroImage] = useState(0);
  const principleImage = principle?.media_url === heroImages[heroImage]
    ? heroImages[(heroImage + 5) % heroImages.length]
    : principle?.media_url;
  const questionActions = question?.body?.split('|') ?? [];
  const principleParts = principle?.headline?.split(',') ?? [];
  useBetaMetadata();

  return <main className="home-v3">
    <HomeV3Hero content={hero} images={heroImages} onImageChange={setHeroImage} />
    <section id="the-principle" className="home-v3-proposition" aria-labelledby="principle-title" style={principleImage ? { backgroundImage:`linear-gradient(90deg,#030609 0%,#030609ee 38%,#03060922 72%),url(${principleImage})` } : undefined}>
      <p className="home-v3-label">{principle?.label}</p>
      <h2 id="principle-title"><span>{principleParts[0]}{principleParts.length > 1 ? ',' : ''}</span>{principleParts.length > 1 && <em>{principleParts.slice(1).join(',').trim()}</em>}</h2>
      <p className="home-v3-proposition-support">{principle?.body}</p>
    </section>
    <HomeV3FivePrinciples />
    <HomeV3ImpactRadius />
    <section className="home-v3-question" aria-labelledby="opening-question-title" style={question?.media_url ? { backgroundImage:`linear-gradient(90deg,#20000ddd,#20000d88),url(${question.media_url})` } : undefined}>
      <p className="home-v3-label">{question?.label}</p>
      <h2 id="opening-question-title">{question?.headline}</h2>
      <p>{question?.subheadline}</p>
      <div><Link to="/about">{questionActions[0]}</Link><Link to="/nominate">{questionActions[1]}</Link></div>
    </section>
    <InstituteFooter />
  </main>;
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
