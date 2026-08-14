// src/pages/awards/PartnersPage.tsx
import { useState } from 'react';
import AwardPageHero from '../../components/awards/AwardPageHero';
import InvestorDeckRequestModal from '../../components/awards/InvestorDeckRequestModal';
import { useLocale } from '../../providers/LocaleProvider';
import { getAwardLocaleContent } from '../../content/awardLocaleContent';

export default function PartnersPage() {
  const [deckOpen, setDeckOpen] = useState(false);
  const { locale } = useLocale();
  const content = getAwardLocaleContent(locale);
  const p = content.pages;

  return (
    <main>
      <AwardPageHero eyebrow={p.partnersEyebrow} title={p.partnersTitle}>{p.partnersIntro}</AwardPageHero>
      <section className="ibs-section partner-roles">{content.partnerRoles.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{copy}</p></article>)}</section>
      <div className="partner-deck-shared"><button onClick={() => setDeckOpen(true)}>{p.requestDeck}</button></div>
      <section className="ibs-section award-copy-grid"><h2>{p.globalTitle}</h2><div><p>{p.global1}</p><p>{p.global2}</p></div></section>
      <section className="ibs-section award-cta"><p className="award-label">{p.invitationLabel}</p><h2>{p.invitationTitle}</h2><p>{p.invitationCopy}</p><a className="award-text-link" href="/contact">{p.partnerConversation}</a></section>
      <InvestorDeckRequestModal open={deckOpen} onClose={() => setDeckOpen(false)} />
    </main>
  );
}
