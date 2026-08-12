// src/pages/awards/PartnersPage.tsx
import AwardPageHero from '../../components/awards/AwardPageHero';

const ROLES = [
  ['Founding Host', 'Convene the inaugural global assembly and welcome the world’s defining successes.'],
  ['Founding Partner', 'Help establish the institution, standards and international nomination network.'],
  ['Category Partner', 'Support discovery and evidence review without influencing jury decisions.'],
  ['Media Partner', 'Bring the stories of beautiful success to a global audience.'],
];

export default function PartnersPage() {
  return (
    <main>
      <AwardPageHero eyebrow="Institutional Relations" title="Help establish what the world chooses to celebrate.">The Founding Edition is an invitation to institutions that believe success should create more possibility through its growth.</AwardPageHero>
      <section className="ibs-section partner-roles">{ROLES.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{copy}</p></article>)}</section>
      <section className="ibs-section award-copy-grid"><h2>Global from the beginning.</h2><div><p>Our founding network connects Dubai, Shenzhen, Hong Kong, Vienna, London, San Francisco and Lithuania.</p><p>Dubai is being explored as the natural home of the inaugural assembly: a city where beauty, ambition and future-building belong in the same conversation.</p></div></section>
      <section className="ibs-section award-cta"><p className="award-label">Partner briefing</p><h2>Build the Founding Edition with us.</h2><p>This page is the live one-page partner briefing. A formal deck will follow the first host and standards conversations.</p><a className="award-button" href="mailto:hello@worldos.institute?subject=Beautiful%20Success%20Awards%20partnership">Request the partner deck</a></section>
    </main>
  );
}
