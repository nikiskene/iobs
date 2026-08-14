// src/components/awards/AwardHomepageSections.tsx
import { Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { useLocale } from '../../providers/LocaleProvider';
import { getAwardLocaleContent } from '../../content/awardLocaleContent';
import AwardMethodSections from './AwardMethodSections';

export default function AwardHomepageSections() {
  const { get } = useAwardSiteContent();
  const { locale, t } = useLocale();
  const localized = getAwardLocaleContent(locale);
  const principle = get('principle');
  const judging = get('judging_intro');
  const recognition = get('recognition_intro');
  const voices = get('voices_intro');
  const founding = get('founding_edition');

  return (
    <>
      <section className="award-principle">
        <p className="award-label">{principle?.label}</p>
        <h2>{principle?.headline}</h2>
        {principle?.body && <p>{principle.body}</p>}
      </section>
      <AwardMethodSections />
      <section className="award-home-section">
        <div className="award-section-title"><p className="award-label">{judging?.label}</p><h2>{judging?.headline}</h2></div>
        <div className="award-test-grid">{localized.test.map(([title, copy], index) => <article key={title} className={index === 5 ? 'award-test-moonshot' : undefined}>{index === 5 && <Rocket className="moonshot-icon" aria-hidden="true" />}<span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <Link className="award-text-link" to="/judging">{t('home.judgingLink')}</Link>
      </section>
      <section className="award-home-section">
        <div className="award-section-title"><p className="award-label">{recognition?.label}</p><h2>{recognition?.headline}</h2></div>
        <div className="recognition-list">{localized.recognition.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="founding-voices">
        <p className="award-label">{voices?.label}</p>
        <h2>{voices?.headline}</h2>
        {voices?.body && <p>{voices.body}</p>}
        <Link className="award-button" to="/voices">{t('home.voicesButton')}</Link>
      </section>
      <section className="award-home-section founding-edition">
        <div className="award-section-title"><p className="award-label">{founding?.label}</p><h2>{founding?.headline}</h2></div>
        {founding?.subheadline && <p>{founding.subheadline}</p>}
        <div><Link className="award-button" to="/nominate">{t('home.nominate')}</Link><Link className="award-text-link" to="/partners">{t('home.partner')}</Link></div>
      </section>
    </>
  );
}
