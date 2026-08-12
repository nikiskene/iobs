// src/pages/awards/JudgingPage.tsx
import AwardPageHero from '../../components/awards/AwardPageHero';
import { AWARD_TEST } from '../../content/awardContent';

const CRITERIA = [['30%', 'Demonstrated impact'], ['25%', 'Beauty of means'], ['20%', 'Originality and courage'], ['15%', 'Enduring value'], ['10%', 'Quality of evidence']];

export default function JudgingPage() {
  return (
    <main>
      <AwardPageHero eyebrow="How we judge" title="Success must withstand evidence—and scale beautifully.">WorldOS informs a rigorous assessment of outcome, means, human consequence and endurance.</AwardPageHero>
      <section className="ibs-section"><div className="award-test-grid">{AWARD_TEST.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></section>
      <section className="ibs-section award-copy-grid"><h2>The assessment</h2><div className="criteria-list">{CRITERIA.map(([weight, title]) => <p key={title}><strong>{weight}</strong><span>{title}</span></p>)}</div></section>
      <section className="ibs-section award-copy-grid"><h2>Integrity before acclaim.</h2><div><p>Claims require verifiable evidence. Jurors disclose conflicts and recuse themselves where necessary. The Institute may withhold or withdraw recognition when standards are not met.</p><p>Full entry rules, evidence standards and the independent integrity process will be published before paid submissions open.</p></div></section>
    </main>
  );
}
