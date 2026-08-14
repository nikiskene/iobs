// src/components/institute/InstituteHeader.tsx

import { Link } from 'react-router-dom';
import { AWARD_ASSETS } from '../../content/awardAssets';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { LANGUAGE_OPTIONS, useLocale, type Locale } from '../../providers/LocaleProvider';

export default function InstituteHeader() {
  const { get } = useAwardSiteContent();
  const { locale, setLocale, t } = useLocale();
  const claim = get('site_claim');

  return (
    <>
      <header className="institute-header">
        <Link className="institute-logo" to="/" aria-label="Institute of Beautiful Success">
          <img src={AWARD_ASSETS.circleDark} alt="Beautiful Success Award" />
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/award">{t('nav.award')}</Link>
          <Link to="/categories">{t('nav.categories')}</Link>
          <Link to="/judging">{t('nav.judging')}</Link>
          <Link to="/voices">{t('nav.voices')}</Link>
          <Link to="/partners">{t('nav.partners')}</Link>
        </nav>
        <div className="institute-header-actions">
          <select className="language-switcher" value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label="Language">
            {LANGUAGE_OPTIONS.map((option) => <option value={option.code} key={option.code}>{option.short}</option>)}
          </select>
          <Link className="enter-link" to="/nominate">{t('nav.nominate')}</Link>
        </div>
      </header>
      {claim?.headline && <p className="institute-claim">{claim.headline}</p>}
    </>
  );
}
