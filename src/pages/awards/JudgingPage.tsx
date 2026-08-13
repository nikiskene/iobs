// src/pages/awards/JudgingPage.tsx
import AwardPageHero from '../../components/awards/AwardPageHero';
import { AWARD_TEST } from '../../content/awardContent';

export default function JudgingPage() {
  return (
    <main>
      <AwardPageHero eyebrow="A new social contract, measured" title="Recognition begins where ordinary success metrics end.">The evaluation parameters are transparent to everyone. WorldOS provides the criteria of judgment.</AwardPageHero>
      <section className="ibs-section"><div className="award-test-grid">{AWARD_TEST.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></section>
      <section className="ibs-section award-copy-grid"><h2>Identity × Choices × Speed</h2><div><p>We ask who an entrant is becoming, what they choose to do with what they have, and how quickly they pursue it - including the cost of that speed.</p><p>The result is not a score for success alone, but a view of whether success creates a better system as it grows.</p></div></section>
      <section className="ibs-section award-copy-grid"><h2>Integrity before acclaim.</h2><div><p>Claims require verifiable evidence. Jurors disclose conflicts and recuse themselves where necessary. The Institute may withhold or withdraw recognition when standards are not met.</p><p>Full entry rules, evidence standards and the independent integrity process will be published before paid submissions open.</p></div></section>
    </main>
  );
}
