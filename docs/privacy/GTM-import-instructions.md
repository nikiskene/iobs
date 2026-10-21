# IOBS cookie consent and GTM import

Target container: **GTM-5X5RWQH4**. GA4 destination: **G-LWGDH16NGH**.

## Import safely

1. In Google Tag Manager, select GTM-5X5RWQH4. Export the current container/workspace as a backup.
2. Open **Admin → Import Container**, select `IOBS-GTM-5X5RWQH4-consent.json`, and choose a **new workspace**, named “IOBS cookie consent”.
3. Select **Merge**, then **Rename conflicting tags, triggers and variables**. **Do not choose Overwrite.** This is a partial recipe; overwriting would remove unrelated items.
4. Review the import preview. A first import should add **2 tags, 1 trigger and 3 variables**, all prefixed **IOBS Consent v1**, with **no modifications or deletions** of existing items. If these IOBS items already exist, stop and inspect the previous import rather than creating duplicate copies. Import this recipe once.
5. Review any pre-existing tags targeting G-LWGDH16NGH. If they independently send page_view events (on initialization, All Pages or History Change), pause those duplicate page-view paths only after reviewing them. Keep unrelated tags unchanged. Do not add another GA4 installation or another GTM snippet.

## GA4 setting outside the import

In GA4 → Admin → Data streams → Web stream → Enhanced measurement settings → Page views → Show advanced settings, turn **Page changes based on browser history events OFF**. For the narrow page-view-only scope of this setup, turn off the other automatic enhanced-measurement events as well. GTM JSON cannot change these GA4 property settings. No History Change trigger is included in this recipe.

The Google tag uses `send_page_view=false`, advertising features disabled, and analytics cookies limited to 180 days. Both tags require `analytics_storage` consent. The GA4 event tag fires only for the application's `iobs_page_view` custom event. It uses the three supplied data-layer variables, with tag sequencing to initialize the Google tag first. Its firing option is once per event; the Google tag is once per document load.

## Verify and publish

1. With the consent-capable frontend running, use GTM **Preview**. A new visitor must not load GTM until consent is granted. Test in a clean browser context without a Tag Assistant extension when verifying zero pre-consent requests, since debugging tools can add their own traffic.
2. Navigate to a public page before accepting, then accept analytics. The queue order must be: `consent default` (all four denied), `consent update` (analytics granted; three advertising types denied), `gtm.js`, `iobs_page_view`. Exactly one initial page-view event is queued for the page currently being visited, including delayed consent. Past unconsented navigation is not replayed.
3. Confirm one `page_view` request to GA4 for that page and one per subsequent public route change. Queries and fragments do not create extra views. No form submission, private page, identity, email, URL query string or fragment is deliberately sent by this implementation. Page titles use a fixed institutional title rather than potentially personal document titles.
4. Reload: saved analytics consent should yield one initial page view in the new document, not two. Reopening settings without changing consent must not add a view.
5. Reject in a fresh context: no GTM or Analytics requests. Withdraw after acceptance: accessible Google analytics cookies are removed and the document reloads with tracking disabled. A cross-tab withdrawal does the same in the other open tabs. Requests sent before withdrawal cannot be recalled.
6. In GA4 DebugView/Realtime, verify receipt. **Submit → Publish** the reviewed GTM workspace. Do not publish unrelated pending changes without reviewing them.

## Technical and legal notes

The site follows Google's basic consent-mode recipe: local consent defaults run before the gated official GTM loader. No separate gtag.js script is installed by the app. GTM may load its own Google libraries after consent. No unconditional noscript tracking iframe is included: it would bypass consent when JavaScript cannot obtain a choice. Necessary authentication, language preferences and site functions do not depend on analytics consent.

The interface is English/Arabic with RTL support. Consent version 1 expires after 180 days, treats invalid/expired records as no consent, and defaults optional storage to off. Advertising consent always remains denied. Withdrawal uses Google's measurement opt-out flag, removes accessible matching cookies at host/parent-domain and current-path scopes, and reloads to remove loaded listeners. The page never sends a denied-consent update to an active tag, avoiding a withdrawal ping in basic mode; all four defaults are re-established as denied in the new document.

**Legal review required:** verify the controller identity and actual privacy-contact address (the existing legal CMS notice still contains a placeholder), the applicable Google contracting entity and processing agreement, international-transfer safeguards, and actual GA4 data-retention settings. This implementation provides the technical consent controls, not a legal certification. Existing legal content is preserved apart from replacing the obsolete statement that analytics might be added in future, and a bilingual analytics supplement is added.

No database migration, Supabase secret or admin analytics dashboard is required.

References:
- [Google: basic consent mode](https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic)
- [Google: import and merge containers](https://support.google.com/tagmanager/answer/6106997)
- [Google: SPA page views and disabling automatic history views](https://developers.google.com/analytics/devguides/collection/ga4/measure-spa-gtm)
