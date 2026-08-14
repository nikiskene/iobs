// src/pages/awards/AssemblyPage.tsx
import AwardPageHero from '../../components/awards/AwardPageHero';

export default function AssemblyPage() {
  return (
    <main>
      <AwardPageHero eyebrow="The Inaugural Assembly" title="A room for the success the future deserves.">Seven Laureates, one Grand Laureate and the founding voices shaping a more beautiful definition of achievement.</AwardPageHero>
      <section className="ibs-section award-copy-grid"><h2>Designed for significance, not scale.</h2><div><p>The inaugural assembly is envisioned as an intimate global gathering of approximately 150 builders, jurors, nominators and institutional leaders.</p><p>Dubai is under exploration as the Founding Host City. No host partnership or venue will be announced before it is confirmed.</p></div></section>
      <section className="ibs-section award-cta"><h2>Host the inaugural global assembly.</h2><p>We are opening conversations with institutions that can help establish an enduring home for Beautiful Success.</p><a className="award-button" href="mailto:hello@worldos.institute?subject=Founding%20Host%20conversation">Begin a host conversation</a></section>
    </main>
  );
}
