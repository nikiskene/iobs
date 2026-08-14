// src/pages/awards/AwardPage.tsx
import AwardPageHero from '../../components/awards/AwardPageHero';
import { useLocale } from '../../providers/LocaleProvider';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { getAwardLocaleContent } from '../../content/awardLocaleContent';

export default function AwardPage() {
  const { locale } = useLocale();
  const { get } = useAwardSiteContent();
  const content = getAwardLocaleContent(locale);
  const p = content.pages;
  const recognition = get('recognition_intro');
  return (
    <main>
      <AwardPageHero eyebrow={p.awardEyebrow} title={p.awardTitle}>{p.awardIntro}</AwardPageHero>
      <section className="ibs-section award-copy-grid"><h2>{p.whyTitle}</h2><div><p>{p.why1}</p><p>{p.why2}</p></div></section>
      <section className="ibs-section"><div className="award-section-title"><p className="award-label">{recognition?.label}</p><h2>{p.oneStandard}</h2></div><div className="recognition-list">{content.recognition.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    </main>
  );
}
