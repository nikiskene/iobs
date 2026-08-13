// src/pages/awards/EnterAwardPage.tsx
import { Link } from 'react-router-dom';
import AwardPageHero from '../../components/awards/AwardPageHero';
import { AWARD_CATEGORIES } from '../../content/awardContent';

export default function EnterAwardPage() {
  return (
    <main>
      <AwardPageHero eyebrow="Founding Edition entries" title="Enter a beautiful success.">Paid submissions will open after the Founding Jury and integrity standards are announced. Register an expression of interest now.</AwardPageHero>
      <section className="ibs-section category-index">{AWARD_CATEGORIES.map((item, index) => <article key={item.slug}><span>0{index + 1}</span><div><h2>{item.name}</h2><p>{item.definition}</p></div><strong>{item.fee}</strong></article>)}</section>
      <section className="ibs-section award-cta"><h2>Have an achievement ready?</h2><p>Tell us what you intend to enter and we will include you in the Founding Edition briefing.</p><a className="award-button" href="mailto:worldos@iacy.com?subject=Founding%20Edition%20entry%20interest">Register interest</a><Link className="award-text-link" to="/judging">Review the judging standard →</Link></section>
    </main>
  );
}
