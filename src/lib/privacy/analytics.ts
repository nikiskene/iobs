export const GTM_ID = 'GTM-5X5RWQH4';
export const GA4_ID = 'G-LWGDH16NGH';
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    'ga-disable-G-LWGDH16NGH'?: boolean;
  }
}
let initialized = false;
let loaded = false;
let allowed = false;
let previousPage: string | null = null;
function command() {
  // Google's command queue expects the original IArguments command shape.
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}
export function initializeConsentDefaults() {
  if (initialized) return;
  initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || command;
  // index.html normally establishes these defaults before the application runs.
  // The guard supports isolated renders without duplicating the default command.
  if (!window.dataLayer.some(entry => (entry as {0?: unknown;1?: unknown})?.[0] === 'consent' && (entry as {1?: unknown})?.[1] === 'default')) {
    window.gtag('consent', 'default', { analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied' });
  }
}
export function enableAnalytics() {
  initializeConsentDefaults();
  if (allowed) return;
  allowed = true;
  window['ga-disable-G-LWGDH16NGH'] = false;
  window.gtag('consent', 'update', { analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied' });
  if (loaded) return;
  const initialLocation = safePageLocation(window.location.pathname) || window.location.origin + '/';
  window.dataLayer.push({page_location:initialLocation, page_referrer:externalReferrer(), page_title:'Institute of Beautiful Success'});
  window.gtag('set', { page_location:initialLocation, page_referrer:externalReferrer(), page_title:'Institute of Beautiful Success' });
  loaded = true;
  // Google's official web-container loader, gated by explicit analytics consent.
  // No separate gtag.js loader and no consent-bypassing noscript iframe.
  (function(w: Window, d: Document, s: string, l: 'dataLayer', i: string) {
    w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event:'gtm.js' });
    const first = d.getElementsByTagName(s)[0]; const script = d.createElement('script');
    script.async = true; script.id = 'iobs-google-tag-manager';
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + i;
    first.parentNode!.insertBefore(script, first);
  })(window, document, 'script', 'dataLayer', GTM_ID);
}
export function disableAnalytics(): boolean {
  allowed = false;
  window['ga-disable-G-LWGDH16NGH'] = true;
  previousPage = null;
  // Do not queue a denied-state update to a running Google tag: basic mode must
  // not send withdrawal/cookieless pings. A reload removes every GTM listener;
  // the new document establishes all four defaults as denied and loads no GTM.
  return loaded;
}
export function trackPage(pathname: string) {
  if (!allowed) return;
  // Queries, fragments and page titles may contain names, email addresses,
  // payment references or auth tokens. Analytics receives public routes only.
  const location = safePageLocation(pathname);
  if (!location) { previousPage = null; return; }
  if (location === previousPage) return;
  const referrer = previousPage || externalReferrer();
  window.gtag('set', {page_location:location, page_referrer:referrer, page_title:'Institute of Beautiful Success'});
  window.dataLayer.push({ event:'iobs_page_view', page_location:location,
    page_referrer:referrer, page_title:'Institute of Beautiful Success' });
  previousPage = location;
}

function safePageLocation(pathname:string):string|null {
  return /^\/(?:$|about\/?$|award(?:\/nominate)?\/?$|categories\/?$|judging\/?$|partners\/?$|voices\/?$|assembly\/?$|contact\/?$|join\/?$|legal\/?$|chapters\/?$|thesis(?:\/[a-z0-9-]+)?\/?$|events(?:\/[a-z0-9-]+)?\/?$|expeditions(?:\/[a-z0-9-]+)?\/?$|acknowledgement\/?$)/.test(pathname) ? window.location.origin + pathname : null;
}
function externalReferrer():string {
  try { return new URL(document.referrer).origin + '/'; } catch { return ''; }
}
