// src/pages/awards/PartnersPage.tsx
import { useState } from 'react';
import AwardPageHero from '../../components/awards/AwardPageHero';
import InvestorDeckRequestModal from '../../components/awards/InvestorDeckRequestModal';

const ROLES = [
  ['Founding Host', 'Convene the inaugural assembly and give the award a place in history.'],
  ['Founding Partner', 'Build and co-manage the global Institute, its reach and long-term independence.'],
  ['Category Partner', 'Advance one scale of beautiful success with relevant expertise.'],
  ['Media Partner', 'Take responsibility for a new narrative and bring it to a global audience.'],
];

export default function PartnersPage() {
  const [deckOpen, setDeckOpen] = useState(false);

  return (
    <main>
      <AwardPageHero eyebrow="Founding roles" title="Each founding role carries a distinct institutional contribution.">What begins at the top shapes everything below.</AwardPageHero>
      <section className="ibs-section partner-roles">{ROLES.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{copy}</p>{title === 'Founding Partner' && <button className="award-text-link partner-deck-link" onClick={() => setDeckOpen(true)}>Request the Partnership Deck →</button>}</article>)}</section>
      <section className="ibs-section award-copy-grid"><h2>Global from the beginning.</h2><div><p>Our founding network connects Dubai, Shenzhen, Hong Kong, Vienna, London, San Francisco and Lithuania.</p><p>Dubai is being explored as the natural home of the inaugural assembly: a city where beauty, ambition and future-building belong in the same conversation.</p></div></section>
      <section className="ibs-section award-cta"><p className="award-label">The founding invitation</p><h2>It is in your hands to make success beautiful.</h2><p>Together we can envision, create, shape, execute and celebrate a new social contract embracing Beautiful Success.</p><div className="partner-cta-actions"><button className="award-button" onClick={() => setDeckOpen(true)}>Request Partnership Deck</button><a className="award-text-link" href="/contact">Begin a partner conversation →</a></div></section>
      <InvestorDeckRequestModal open={deckOpen} onClose={() => setDeckOpen(false)} />
    </main>
  );
}
