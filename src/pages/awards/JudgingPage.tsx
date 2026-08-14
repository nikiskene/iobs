// src/pages/awards/JudgingPage.tsx
import { Rocket } from 'lucide-react';
import AwardPageHero from '../../components/awards/AwardPageHero';
import { useLocale, type Locale } from '../../providers/LocaleProvider';
import { getAwardLocaleContent } from '../../content/awardLocaleContent';

const FORMULA: Record<Locale,string> = {
  en:'Identity × Choices × Speed',
  de:'Identität × Entscheidungen × Geschwindigkeit',
  fr:'Identité × Choix × Vitesse',
  ar:'الهوية × الخيارات × السرعة',
  zh:'身份 × 选择 × 速度',
  es:'Identidad × Elecciones × Velocidad',
};

export default function JudgingPage() {
  const { locale } = useLocale();
  const content = getAwardLocaleContent(locale);
  const p = content.pages;
  return (
    <main>
      <AwardPageHero eyebrow={p.judgingEyebrow} title={p.judgingTitle}>{p.judgingIntro}</AwardPageHero>
      <section className="ibs-section"><div className="award-test-grid">{content.test.map(([title, copy], index) => <article key={title} className={index === 5 ? 'award-test-moonshot' : undefined}>{index === 5 && <Rocket className="moonshot-icon" aria-hidden="true" />}<span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      <section className="ibs-section award-copy-grid"><h2>{FORMULA[locale]}</h2><div><p>{p.judgingIdentity}</p><p>{p.judgingResult}</p></div></section>
      <section className="ibs-section award-copy-grid"><h2>{p.integrityTitle}</h2><div><p>{p.integrity1}</p><p>{p.integrity2}</p></div></section>
    </main>
  );
}
