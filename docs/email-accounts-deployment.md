# IOBS member email accounts — Migadu Mini

Repository: `nikiskene/iobs`. Feature branch: `feature/migadu-email`.
Canonical website: `https://www.iobs.cc` (the apex redirects there).
Supabase project: **IOBS**, `bunfdlazirfheomhvjdz`.

## Current delivery state

Implemented locally: member eligibility in the existing Member Editor, member Settings → Email, address availability and creation, password changes, secure existing-mailbox linking, provider readiness/status checks, recovery after ambiguous provider results, and mobile layouts. Automated provider requests are mocked. No real mailbox has been created, linked, deleted or modified, including `niki@iobs.cc`.

The user confirmed upgrading from Micro to **Mini** for API access. `MIGADU_SECRET_KEY` is configured in Supabase by the user. `MIGADU_API_USER` was configured using the corrected account identifier supplied by the user. Neither credential is in the frontend, the repository or Netlify. Key contents have not been retrieved or displayed.

The feature must remain unmerged and undeployed until local validation and required configuration are ready. Its SQL has not been executed. Credential presence and the confirmed plan do not prove authenticated provider access or email delivery. The in-app administrator connection check is read-only and must pass before provisioning is enabled.

## Manual Supabase SQL

Run `docs/email-supabase-release.sql` **once** in the IOBS SQL Editor. This is the standalone release artifact. It contains the source migration and records version `20261021140000` in Supabase migration history inside the same transaction, preventing the GitHub integration from trying to repeat a manually applied migration.

The SQL creates eligibility records, a single-mailbox-per-member table, restricted RPCs, RLS, durable rate limiting and a member-merge safety trigger. All eligibility defaults to off. It does not call Migadu or change any mailbox or password. Then run the read-only `docs/email-supabase-verify.sql`; all verification values are returned in a single JSON result. A fresh installation has zero mailbox records.

Do not also run the individual `supabase/migrations/20261021140000_member_email_accounts.sql` after applying the release bundle. The latter source file is for the normal migration runner and does not modify its own migration history.

## Supabase secrets

| Name | Value / purpose | Status |
| --- | --- | --- |
| `MIGADU_SECRET_KEY` | API key created in Migadu → My Account → API Keys. Not a mailbox password. | Added by user |
| `MIGADU_API_USER` | Email address of the Migadu administrative account that owns the key | Configured |
| `IOBS_EMAIL_ENABLED` | Keep absent or `false` while checking setup. Set `true` only after provider access and domain readiness are confirmed. | Disabled by default |

Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. No new Netlify secret is needed. In particular, never create `VITE_MIGADU_*` variables. Keep request-body logging and session replay capture disabled for password inputs.

## Enablement sequence

1. Complete local checks below. Review the release SQL. Have the administrator run the SQL and return the one-row verification result.
2. Confirm both Migadu credentials are configured in the IOBS project. Keep `IOBS_EMAIL_ENABLED=false` or absent initially.
3. Deploy the Edge Function from this checkout:

   ```sh
   supabase functions deploy iobs-email --project-ref bunfdlazirfheomhvjdz --no-verify-jwt
   ```

   The JWT gateway is disabled for compatibility, but the handler requires a bearer token and calls Supabase Auth `getUser` for every operation. Active profile and canonical member checks happen server-side. No anonymous provider operations are exposed.
4. Once configuration and validation are ready, create the feature PR to trigger the existing Netlify deploy preview. Do not create a PR earlier if doing so would automatically deploy an unconfigured feature. Keep the PR unmerged. The production site continues on its current release.
5. In the preview, sign in as an IOBS administrator, open Admin → Members → Member Editor → IOBS Email, and press **Check provider connection**. The action verifies API access, complete recipient inventory, and domain send/receive/access flags. It does not create an account. If authentication is older than five minutes, confirm the website password or sign in again using the existing login flow.
6. If this check fails, do not enable provisioning. Confirm the API key belongs to the configured Migadu administrator, has access to the `iobs.cc` domain and is a management API key. Verify the Mini upgrade is active, domain/DNS setup is complete, and Migadu is available. Do not log the provider error body, which can echo sensitive input.
7. When the read-only check passes, set `IOBS_EMAIL_ENABLED=true` in Supabase and redeploy the function if needed for a fresh runtime.
8. To link the existing account, choose **Niki's actual canonical member record**, expand **Link an existing Migadu mailbox**, enter `niki@iobs.cc` and explicitly confirm ownership. This performs provider GET requests and creates the IOBS association only. It does not POST a mailbox or PUT a password. Do not infer ownership from names or website account email addresses.
9. After **explicit authorization for a named real test mailbox**, enable eligibility for that test member. In the preview, test new account creation, webmail sign-in, sending to and receiving from a controlled external address, password change, existing-account linking, eligibility revocation, a second member's denial, and linked-login behavior. All automated tests are mocked and do not replace these real-provider checks. No sending test email is authorized by this implementation briefing alone.
10. Only after the authorized live checks pass, merge to `main` through the existing Netlify workflow. Verify `/dashboard/settings/email` on `www.iobs.cc` and verify existing member editing/profile flows. Do not announce the definition of done until actual send/receive succeeds.

## Member and administrator experience

- Settings is reachable from signed-in navigation, the dashboard sidebar, and the Institute account menu. `/dashboard/settings` shows Email only to eligible members or members with an existing email record. Direct access by an ineligible member never shows a creation form.
- Admin eligibility saves immediately in the existing Member Editor. The mailbox address, state and creation/association date are shown there. New members must be saved first. Turning eligibility off never invokes the provider or deletes/suspends a mailbox.
- Members choose an initial password, enter it twice, and can change it later. Passwords are not generated, shown back by the backend, logged or stored in Supabase. New mailbox passwords are separate from website passwords.
- Creation, password changes, provider setup checks and admin links require a verified login within five minutes. A token refresh is insufficient: freshness is checked against authenticated `amr` timestamps, after the exact bearer token has been verified with Supabase Auth. Existing sign-in methods remain available; password confirmation goes directly to Supabase Auth.
- Password changes can target only the caller's own canonical member, even for administrators. Administrators link mailboxes and manage eligibility; they do not get an unrelated mailbox password reset action.
- Webmail opens `https://webmail.migadu.com/`. Device instructions use IMAP `imap.migadu.com:993` and SMTP `smtp.migadu.com:465`, SSL/TLS, with the full email address as the username.

## Concurrency and recovery

The database reserves one row per canonical member and one row per address. Linked login accounts share both that row and rate limits. Worker leases and fencing tokens prevent concurrent requests from starting separate provider writes. Eligibility and account activity are rechecked just before the provider creation phase.

A provider request is marked as started in the database **before** its POST. Its private operation UUID is included in the provider's mailbox **admin-panel name**, which the API documentation exposes for creation and retrieval. Do not edit this marker while an operation is pending. The sender display name can be configured separately in the user's email client.

- Failure before any POST: the record becomes retryable and the creation form returns.
- A timeout or failure after POST starts: the same address stays reserved in `needs_review`; the app never blindly POSTs again or changes a password to claim it.
- Provider creation succeeds but database completion fails: use **Verify account**. Only a matching operation marker can complete the association automatically.
- An unrelated existing mailbox can never be adopted through reconciliation. It requires the explicit administrator linking workflow.
- If no mailbox is found after an ambiguous POST, retain the reservation and investigate in Migadu. Do not clear it or retry creation until the administrator/provider can establish the original request's outcome. The implementation deliberately avoids deleting provider mailboxes or automatically releasing uncertain ownership.
- Existing mailbox status checks are read-only provider calls. Missing or disabled mailboxes stay associated; the app never replaces them automatically.

The API has no documented dedicated availability or idempotent creation endpoint. Availability is derived from documented mailbox, alias, identity and rewrite inventories, followed by a unique database reservation. Forwarding-only accounts are protected because their receiving names are mailbox/alias names; forwarding destinations are external addresses, not independently claimable local accounts.

Unknown inventory formats fail closed. Exact rewrite names are reserved. Wildcard/complex rewrite rules need administrator review because their precedence/matching semantics are not fully specified in the API documentation; the implementation does not guess regex semantics. More than 200 existing mailboxes also blocks the availability scan until a larger-directory strategy is reviewed. These checks are surfaced by the preflight provider connection check.

Combining either of two members that has an email record is blocked atomically. This prevents a duplicate-member merge from silently transferring mailbox access or violating the one-mailbox rule. Combining ordinary members without email records continues to work. Mailbox ownership changes require a separate reviewed process.

## Validation commands

```sh
npm ci
node scripts/package-email-migration.mjs --check
npm run typecheck
npm run lint
npm run test:email
# Deno 2; isolated provider mocks, no network permission granted:
deno test --config supabase/functions/deno.json supabase/functions/iobs-email/email_test.ts
npm run test:chapters
# Existing payment-handler regression tests:
deno test --config supabase/functions/deno.json --allow-env supabase/functions/events_test.ts
npm run build
npx playwright install chromium
npm run test:email:browser
```

`PLAYWRIGHT_CHROME=1 npm run test:email:browser` uses installed Chrome instead of downloaded Chromium. All browser requests to Supabase/Migadu are mocked. The test fixtures contain no production people or passwords. Tests use distinct auth user IDs and canonical member IDs and include linked accounts.

## Official provider references

- [Migadu management API](https://www.migadu.com/api/): HTTP Basic authentication, mailbox POST, mailbox GET and PUT, alias/identity/forwarding/rewrite inventory. API credentials are account-specific; no unsupported endpoints are invented.
- [Migadu plans](https://www.migadu.com/pricing/): the user confirmed Mini. Published pricing does not itself prove account-specific API permission or production quota readiness.
- [Migadu client configuration](https://www.migadu.com/guides/): IMAP/SMTP endpoints, TLS and full-address username.
- [Supabase session guidance](https://supabase.com/docs/guides/auth/sessions): authentication/session handling; refreshed tokens do not replace a fresh sign-in for sensitive operations here.

## Validation evidence for this implementation

- TypeScript and the production Vite build pass.
- Full repository lint has zero errors and 14 existing warnings.
- 39 database checks pass against an isolated PostgreSQL-compatible fixture, including execution of the exact release SQL and its single-result verification query.
- 17 isolated backend/provider tests pass without network permission.
- 11 mocked-browser tests pass, including mobile widths of 320/390 px, tablet 768 px and desktop 1440 px.
- Existing Chapters database checks (26) and payment-handler tests (10) pass as regressions.
- Production prerequisites were checked read-only: canonical member records and migration history exist; the email tables and new helper functions are not installed yet.

These results validate implementation behavior with fixtures. They do not establish provider account access, create a real mailbox, or prove send/receive delivery.
