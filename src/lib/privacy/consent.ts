export const CONSENT_KEY = 'iobs-cookie-consent';
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
export type ConsentPreference = { version: number; analytics: boolean; savedAt: number };
export function parseConsent(raw: string | null, now = Date.now()): ConsentPreference | null {
  try {
    const value = JSON.parse(raw || 'null');
    if (!value || value.version !== CONSENT_VERSION || typeof value.analytics !== 'boolean' || !Number.isFinite(value.savedAt)
      || value.savedAt > now || now - value.savedAt >= CONSENT_MAX_AGE) return null;
    return { version: CONSENT_VERSION, analytics: value.analytics, savedAt: value.savedAt };
  } catch { return null; }
}
export function readConsent(): ConsentPreference | null {
  try { return parseConsent(window.localStorage.getItem(CONSENT_KEY)); } catch { return null; }
}
export function saveConsent(analytics: boolean): ConsentPreference {
  const preference = { version: CONSENT_VERSION, analytics, savedAt: Date.now() };
  // Blocked storage never implies consent on the next visit.
  try { window.localStorage.setItem(CONSENT_KEY, JSON.stringify(preference)); } catch { /* session-only choice */ }
  return preference;
}
export function clearAnalyticsCookies() {
  const names = document.cookie.split(';').map(cookie => cookie.split('=')[0].trim())
    .filter(name => /^(?:_ga(?:_|$)|_gid$|_gat(?:_|$)|_gac_|_gcl_)/.test(name));
  const host = window.location.hostname;
  const domains = new Set(['', host, `.${host}`]);
  const parts = host.split('.');
  for (let index = 1; index < parts.length - 1; index++) {
    domains.add(parts.slice(index).join('.')); domains.add(`.${parts.slice(index).join('.')}`);
  }
  const paths = new Set(['/']);
  const segments = window.location.pathname.split('/').filter(Boolean);
  for (let index = 1; index <= segments.length; index++) {
    const path = '/' + segments.slice(0,index).join('/'); paths.add(path); paths.add(path + '/');
  }
  for (const name of names) for (const domain of domains) for (const path of paths) {
    document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}; SameSite=Lax`;
  }
}
