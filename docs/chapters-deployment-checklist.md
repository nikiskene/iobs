# IOBS Chapters release

Work branch: `feature/chapters-2026`, repository `nikiskene/iobs`.
Supabase project: **IOBS**, reference `bunfdlazirfheomhvjdz`.

## Ready to run: Supabase SQL

`docs/chapters-supabase-release.sql` is the complete, reviewed SQL file to copy into the IOBS SQL Editor and execute **once**. It combines both chapter migrations in a single transaction. It has been executed successfully against an isolated PostgreSQL-compatible test database using the current production column definitions and relevant existing policies, followed by 26 permission and registration checks. No production SQL was executed by Codex.

The live schema was inspected read-only on October 21, 2026 and had no chapter tables yet. This bundle is safe to execute against that inspected schema. If the database changes before execution, review the change first. Do not run the two individual migrations again after running this bundle.

The migration adds chapter tables, five draft chapters, event category/pricing fields, registration records, RLS, restricted RPCs, image upload guards, and a request limiter. Existing event RSVPs are copied into the attendee list as historical free registrations; they are not represented as verified payments. No existing members, events, or RSVPs are deleted. An old anonymous event-image upload policy is constrained, and profile access protection now includes the legacy event-master flag.

After execution, run the read-only `docs/chapters-supabase-verify.sql`. Expect five initial draft chapters, enabled RLS, and `false / false / true` for anonymous/browser/service registration RPC privileges.

## Exact release sequence

1. Run `docs/chapters-supabase-release.sql` in the **IOBS** SQL Editor, then the verification SQL above. This must happen before promoting the frontend: the old public registration endpoint is disabled by the migration. Schedule the remaining steps together to minimize the registration interruption.
2. Configure Stripe in test mode first. In the IOBS Supabase Edge Function secrets, add `STRIPE_SECRET_KEY` from the intended Stripe account. Never use a frontend `VITE_` variable for this key.
3. In the same Stripe account and mode, create a webhook destination for `https://bunfdlazirfheomhvjdz.supabase.co/functions/v1/event-webhook`, selecting `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `charge.refunded`. Put that destination's signing secret in Supabase as `STRIPE_EVENT_WEBHOOK_SECRET`.
4. `EVENT_SITE_URL=https://www.iobs.cc` has already been configured. The apex domain redirects to `www.iobs.cc`; the function accepts both origins. Standard Supabase URL and service-role secrets are supplied by Supabase. Keep these on the server.
5. The `event-checkout` and `event-webhook` Edge Functions have already been deployed with JWT gateway verification disabled. This permits guest registrations and Stripe webhooks. The checkout verifies any supplied user with Supabase Auth before linking a member, and the webhook verifies Stripe's signature over the raw body. If redeployment is needed, run the commands below from the repository.
6. Build and deploy the feature branch as a **Netlify branch/deploy preview** using the existing site's settings. Preserve `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (or publishable-key equivalent), and `VITE_MAPBOX_ACCESS_TOKEN`. The Mapbox public token is necessary for the existing city selector. It was not available in this local environment, so live city-provider results remain unverified.
7. In the preview, assign actual Chapter Heads under Admin → Members → Chapters. Eligible heads are unmerged members with an active linked account. Set chapter headline, hero image URL, email and membership. Heads can edit their own public details and associate directory-visible members; administrators can associate any member. Activate a test chapter when ready. Publishing a chapter makes its selected head's public directory fields visible on `/chapters` and `/team`.
8. Exercise one free registration and one paid registration with a Stripe test card. Confirm attendee lists, verified payment status after webhook delivery, cancellation/retry, duplicate retry, full refund status, CSV download, and access denial with a second chapter's head. Payment return URLs never mark a registration paid. Partial refunds remain `paid`; the dashboard marks a registration `refunded` only after a full refund. Refunds are initiated in Stripe.
9. Switch both Stripe secrets to live mode and create the corresponding live webhook destination. Never pair a test key with a live signing secret or vice versa. Merge/promote the validated branch to the existing production deployment branch (`main`) and publish through the existing Netlify/Bolt workflow. The currently published site is hosted on Netlify; this environment has no authenticated Netlify deployment account, so Codex has not promoted the frontend.
10. Check the live `/chapters`, `/team`, event details and `/chapter-office` pages, then verify a real authorized payment and its webhook if paid events are opening. Keep initial chapters as drafts until their actual people, copy and images are ready.

```sh
supabase functions deploy event-checkout --project-ref bunfdlazirfheomhvjdz --no-verify-jwt
supabase functions deploy event-webhook --project-ref bunfdlazirfheomhvjdz --no-verify-jwt
```

Manual SQL execution does not reconcile CLI migration history. Before any later `supabase db push`, reconcile the two chapter versions with Supabase migration history; do not push this repository's historical migrations blindly.

## What was validated

- TypeScript check and production Vite build.
- Full repository lint: no errors; existing warnings remain.
- 26 isolated PostgreSQL security/registration checks using a schema-only production snapshot: five drafts, own-chapter event and membership access, denied ownership changes and global privilege escalation, private attendees, supported service-only registration, server pricing, duplicate retries, free registration/member linking, rate limiting, and isolated image uploads.
- 10 isolated Edge Function tests with mocked Stripe/Supabase responses: server-side pricing, free bypass, origin/method rejection, signed webhook fulfillment, invalid signatures, amount mismatch, unpaid completion, refund ordering and unrelated Stripe events. These do not prove real Stripe delivery.
- Browser tests with mocked backend data at 320, 390, 768 and 1440 px: chapter stripes, event registration, restricted chapter editing, attendee lists, CSV download, and Chapter Head placement between Founders and Advisors.
- Both deployed Edge Functions are active. Before credentials are configured, the webhook returns HTTP 503; invalid signatures must return 400 after configuration. Production data and paid checkout have not been altered or tested.

## Local checks

```sh
npm ci
node scripts/package-chapters-migration.mjs --check
npm run typecheck
npm run lint
npm run test:chapters
# Deno 2 required for the isolated payment-handler suite:
deno test --config supabase/functions/deno.json --allow-env supabase/functions/events_test.ts
npm run build
npx playwright install chromium
npx playwright test -c playwright.chapters.config.mjs
```

Set the public Supabase build variables first. `PLAYWRIGHT_CHROME=1` can use installed Chrome instead of downloaded Chromium. Browser tests use mocked backend responses and never submit production registrations.

## Operational notes

- Admin and super-admin accounts retain global access. Existing active event masters retain management access to non-chapter events; a chapter appointment never grants that flag.
- Members are linked to registrations only when their authenticated, confirmed account email matches the registration email. Guest email alone never claims another member's identity.
- Pending paid registrations retain their server price snapshot across retries. New registrations use the current event price. Free events bypass Stripe completely. Guest registrations do not verify mailbox ownership.
- The request limiter stores hashed gateway IP keys and allows 15 requests per minute per key; old keys are cleaned on requests. Edge/platform rate limiting can be tightened separately if needed.
- A chapter image uses a URL; event images support uploads to the existing `event-media` bucket with chapter-specific paths. The bucket must already exist (as in the inspected deployment).
- A complete live release is still pending manual SQL, Stripe configuration, real-provider/authenticated verification and frontend publication. The local build and mocked tests are not a claim that production is complete.

References: [Stripe webhook signature verification](https://docs.stripe.com/webhooks/signature), [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests), [Supabase user verification](https://supabase.com/docs/reference/javascript/auth-getuser).
