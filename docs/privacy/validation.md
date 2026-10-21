# Cookie consent validation

Frontend implementation: application-level, consent-gated official GTM loader; no separate GA4 loader or unconditional noscript iframe. English/Arabic banner and native settings dialog; optional analytics initially off; equal accept/reject controls; 180-day versioned preference with expiry and cross-tab synchronization. Advertising storage/data/personalization are always denied. Accessible Google analytics cookies are cleared on rejection/withdrawal; withdrawal sets the GA4 disable flag and reloads to remove active listeners. Public-route-only page-view events omit queries, fragments and personal document titles.

Passed locally:
- TypeScript and production build.
- ESLint on new/changed privacy modules: no errors; one standard React fast-refresh export warning.
- Unit/config checks: invalid/expired/future consent, version validation, host/parent-domain and path cookie cleanup, necessary-cookie preservation, early defaults, no separate GA4 script, GTM consent checks/config references.
- 11 Playwright tests: fresh visitor with zero Google requests; reject plus navigation/reload; unchecked customization/cancel; ordered defaults/update/loader/event; once-only initial view and deduplicated navigation; persistence; withdrawal with cookie cleanup and necessary-cookie preservation; Arabic 320/390/1440 layouts; expiry; cross-tab withdrawal; delayed consent on current page; browser back; privacy supplement/settings access.

The browser suite uses a mocked GTM response for deterministic control of the application event queue. It proves first-page and route events are queued once; it does **not** prove that the real GA4 property received them. The real publicly served GTM container was empty when inspected. Actual GTM/GA4 publication and network/Realtime verification must be recorded separately after the owner imports/publishes the supplied recipe and disables automatic history views in GA4.

The import JSON has been structurally validated; importing it into the owner's GTM account is a separate step. No account credentials, unrelated tags/settings, database schema, secrets, or admin dashboards were changed.
