import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { clearAnalyticsCookies, CONSENT_KEY, CONSENT_MAX_AGE, readConsent, saveConsent, type ConsentPreference } from '../lib/privacy/consent';
import { disableAnalytics, enableAnalytics, initializeConsentDefaults, trackPage } from '../lib/privacy/analytics';
import CookieConsent from '../components/privacy/CookieConsent';

type Context = { preference: ConsentPreference | null; openSettings: () => void; choose: (analytics:boolean) => void };
const ConsentContext = createContext<Context>({ preference:null, openSettings:()=>{}, choose:()=>{} });
export function CookieConsentProvider({ children }: { children:ReactNode }) {
  const [preference,setPreference] = useState(readConsent);
  const [settings,setSettings] = useState(false);
  const choose = useCallback((analytics:boolean) => {
    const next = saveConsent(analytics);
    setPreference(next); setSettings(false);
    if (!analytics) {
      const reload = disableAnalytics(); clearAnalyticsCookies();
      if (reload) window.location.reload();
    }
  }, []);
  useLayoutEffect(() => {
    initializeConsentDefaults();
    if (preference?.analytics) enableAnalytics();
    else { disableAnalytics(); clearAnalyticsCookies(); }
  }, [preference]);
  useEffect(() => {
    const sync = () => {
      const next = readConsent();
      setPreference(current => current?.savedAt === next?.savedAt && current?.analytics === next?.analytics ? current : next);
      if (!next?.analytics) {
        const reload = disableAnalytics(); clearAnalyticsCookies();
        if (reload) window.location.reload();
      }
    };
    const storage = (event:StorageEvent) => { if (event.key === CONSENT_KEY || event.key === null) sync(); };
    const visible = () => { if (document.visibilityState === 'visible') sync(); };
    window.addEventListener('storage',storage); window.addEventListener('focus',sync); window.addEventListener('pageshow',sync); document.addEventListener('visibilitychange',visible);
    const timer = preference ? window.setTimeout(sync, Math.min(2_147_483_647, Math.max(0, preference.savedAt + CONSENT_MAX_AGE - Date.now()))) : undefined;
    return () => { window.removeEventListener('storage',storage); window.removeEventListener('focus',sync); window.removeEventListener('pageshow',sync); document.removeEventListener('visibilitychange',visible); window.clearTimeout(timer); };
  }, [preference]);
  return <ConsentContext.Provider value={{preference,openSettings:()=>setSettings(true),choose}}>
    <ConsentNavigation />{children}
    <CookieConsent preference={preference} settings={settings} onCustomize={()=>setSettings(true)} onClose={()=>setSettings(false)} onChoose={choose} />
  </ConsentContext.Provider>;
}
function ConsentNavigation() {
  const {pathname} = useLocation();
  const {preference} = useCookieConsent();
  useEffect(() => { if (preference?.analytics) trackPage(pathname); }, [pathname,preference?.analytics]);
  return null;
}
export const useCookieConsent = () => useContext(ConsentContext);
