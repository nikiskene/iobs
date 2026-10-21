# BEAU Phase 1

Authenticated members get private conversations at `/beau`. Administrators manage knowledge, configurable models, limits and aggregate costs at `/admin/beau`; assigned Chapter Heads maintain only their chapter’s internal knowledge at `/beau/knowledge`.

## Intelligence and privacy

1. Knowledge Engine answers approved exact FAQ variants or supported exact live chapter-lead questions. FTS relevance alone cannot produce a factual direct answer. These deterministic factual responses can be cached per member.
2. Mini handles ordinary conversations and writing with only relevant approved references and bounded private context.
3. Intelligence handles complex requests and multi-document work, or explicit member selection. Both models and their cost rates are administrator configurable.

No fine-tuning, training or embeddings are used. Responses API requests use `store:false`. Only `OPENAI_API_KEY_BEAU` is read for OpenAI; it stays server-side. Local conversation history stays in Supabase and has no Admin read exception. Owner-only past context can inform that member’s answers but never becomes institutional knowledge or cache content. Approved restricted knowledge is Admin-only; chapter knowledge follows current assignments and membership. Drafts are excluded even for Admin chat. Knowledge, chapter, identity, membership and access changes invalidate the factual cache. Only deterministic answers are stored in that cache.

API usage records contain model, level, token counts and costs, not prompts or answers. Budget reservations serialize on the settings row and conservatively assume input bytes as tokens plus response capacity. Interrupted requests with unknown usage retain their reservation. Prices are estimates, not provider billing. Defaults are gpt-5.4-mini and gpt-5.4; change the associated input, cached input and output prices whenever changing models.

Text, Markdown, PDF and DOCX documents support up to 5 MB and 60,000 extracted characters; PDFs up to 50 pages. Scanned PDFs need OCR before import. Imported institutional documents always start as drafts. Extraction happens in the browser and is explicitly unverified until reviewed. Storage is private and mediated by authenticated functions. Conversation deletion queues private storage cleanup durably; subsequent bootstrap calls retry failed cleanup. Attachments and references are untrusted input and cannot grant access or run operational actions.

## Exact release sequence

1. Prepare the private SQL outside this PUBLIC repository: `node scripts/package-beau-release.mjs /absolute/private/beau_seed.sql /absolute/private/beau-supabase-release.sql`. Do not publish its institutional contents. Existing reviewed knowledge is preserved during seed insertion.
2. Validate privately: `node tests/beau-release.mjs /absolute/private/beau_seed.sql /absolute/private/beau-supabase-release.sql`. This is local PostgreSQL only.
3. The project owner runs the private release in the Supabase SQL Editor. **Never run a migration push or execute the release remotely on their behalf.** The transaction records migration `20261021190000`, so migration history stays consistent.
4. Run `docs/beau-supabase-verify.sql` read-only. Expect migration recorded, 13 RLS tables, 12 seed entries, 1 approved, 2 restricted, all forbidden privileges false, private storage/owner policy/seed recorded true. Counts can change after intentional Admin edits.
5. Deploy the `beau` Edge Function to project `bunfdlazirfheomhvjdz`, with `verify_jwt=false` because the handler verifies every bearer token against Supabase Auth. `OPENAI_API_KEY_BEAU` must exist; never use frontend environment variables for that key.
6. Merge the reviewed feature and wait for Netlify production publication. Verify compiled BEAU assets and the route on `https://www.iobs.cc/beau`.
7. Verify the signed-in member flow: exact approved FAQ with zero API requests, an ordinary Mini response, a complex Intelligence response, history resume, private document attachment, and Admin usage totals. Check another member cannot see the conversation and a Chapter Head cannot manage other chapters. Automated fixture tests do not substitute for live authenticated QA.

If SQL or provider verification fails, do not publish the dependent website. BEAU can be paused in its Admin settings. Existing site routes remain independent of BEAU. Phase 2 teaching/suggestion workflows and broad operational tools are outside this approved foundation.
