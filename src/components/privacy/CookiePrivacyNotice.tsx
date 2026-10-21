import { useLocale } from '../../providers/LocaleProvider';
import { COOKIE_COPY } from '../../content/cookieCopy';
import CookieSettingsLink from './CookieSettingsLink';
export default function CookiePrivacyNotice() {
  const {locale} = useLocale(); const copy = COOKIE_COPY[locale === 'ar' ? 'ar' : 'en'];
  return <section id="cookies" className="iobs-cookie-legal" aria-labelledby="iobs-cookie-legal-title">
    <h2 id="iobs-cookie-legal-title">{copy.legalTitle}</h2><p>{copy.legalBody}</p>
    <p><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">{copy.googlePrivacy}</a> · <a href="https://business.safety.google/adsprocessorterms/" target="_blank" rel="noopener noreferrer">{copy.googleTerms}</a></p>
    <CookieSettingsLink />
  </section>;
}
