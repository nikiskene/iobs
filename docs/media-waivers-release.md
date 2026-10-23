# Booking and media waivers

Public routes: /schedule, /works/waiver, /works/waiver/terms. /work/waiver redirects to the participant form. Team records: /work/waivers, linked from Work on mobile and desktop.

The versioned release in supabase/functions/_shared/waiver.ts derives from the supplied IOBS Participant Waiver. Printed attribution blanks are expressed as prose; contact spacing is repaired; Institute websites are explicitly listed. The original broad WorldOS/award/editorial/promotional scope is retained and disclosed before signing. This is implementation of supplied wording, not legal certification. Review that scope, retention and international processing disclosures against actual operations before collecting production consent.

Each entry records the server timestamp, name, email, affirmative acceptance, legal version, full legal text snapshot and private PNG path. The public function validates the payload and image dimensions, enforces a service-only rate limit, uploads the signature, and saves the entry; a failed insert attempts to remove the upload. The signature is a drawn image, not identity verification or a qualified electronic signature. Private team viewing uses two-minute signed image URLs.

Release order:
1. Reconcile remote Supabase migration history before applying 20261023120000_media_waivers.sql. It creates a private bucket, entries table, read policies and rate limiter; it requires the existing has_team_momentum_access function.
2. Deploy submit-waiver with its shared module and verify_jwt=false (public participant submissions); standard Supabase service-role environment settings are required on the server.
3. Publish the frontend through the project's existing hosting flow.
4. Verify production booking embed and real signing with a consented test participant; confirm entry, legal snapshot and signature in the authenticated team view, and anonymous/ordinary-user denial. Remove test data through an authorized admin process when finished.

Local verification: npm run typecheck; npm run build; node tests/waivers-security.mjs; targeted ESLint. Mobile browser check exercised missing-signature validation, drawing, simulated successful function response, legal route and iframe rendering. No live submission or embedded-provider booking was completed.
