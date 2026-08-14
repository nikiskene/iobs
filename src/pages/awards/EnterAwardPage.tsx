// src/pages/awards/EnterAwardPage.tsx
import { Link } from 'react-router-dom';
import AwardPageHero from '../../components/awards/AwardPageHero';
import { useLocale } from '../../providers/LocaleProvider';
import { getAwardLocaleContent } from '../../content/awardLocaleContent';

export default function EnterAwardPage() {
  const { locale } = useLocale();
  const content = getAwardLocaleContent(locale);
  const p = content.pages;
  return (
    <main>
      <AwardPageHero eyebrow={p.enterEyebrow} title={p.enterTitle}>{p.enterIntro}</AwardPageHero>
      <section className="ibs-section category-index">{content.categories.map((item, index) => <article key={item.slug}><span>0{index + 1}</span><div><h2>{item.name}</h2><p>{item.definition}</p></div><strong>{item.fee}</strong></article>)}</section>
      <section className="ibs-section award-cta"><h2>{p.readyTitle}</h2><p>{p.readyCopy}</p><Link className="award-button" to="/contact?reason=Founding%20Edition%20entry">{p.register}</Link><Link className="award-text-link" to="/judging">{p.reviewJudging}</Link></section>
    </main>
  );
}
