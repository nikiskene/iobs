import { useCookieConsent } from '../../providers/CookieConsentProvider';
import { useLocale } from '../../providers/LocaleProvider';
import { COOKIE_COPY } from '../../content/cookieCopy';
export default function CookieSettingsLink() {
  const {openSettings} = useCookieConsent(); const {locale} = useLocale();
  return <button type="button" className="iobs-cookie-settings-link" onClick={openSettings}>{COOKIE_COPY[locale === 'ar' ? 'ar' : 'en'].settings}</button>;
}
