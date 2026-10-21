# BEAU economy configuration — 21 October 2026

Both paid routes (Mini and Intelligence) use `gpt-5-nano`, with `reasoning.effort: minimal`. This avoids routing complex phrasing to a flagship model. The roles remain separately configurable by Admins. Exact approved FAQs and supported operational facts still use the free Knowledge Engine, with permission-aware factual caching.

The runtime configuration lives in the existing `beau_settings` singleton and can be edited in Admin → BEAU → Settings. This release changes configuration through the server-authorized settings table API; it requires no SQL migration and does not change membership approvals, budgets, response limits, instructions or existing conversation data. Applied schema migrations retain their original historical defaults; fresh installations should apply this economy profile through Admin settings.

| Setting | Mini | Intelligence |
| --- | --- | --- |
| Model | gpt-5-nano | gpt-5-nano |
| Input USD / million tokens | 0.05 | 0.05 |
| Cached input USD / million tokens | 0.005 | 0.005 |
| Output USD / million tokens | 0.40 | 0.40 |

Source: https://developers.openai.com/api/docs/models/gpt-5-nano

## Validation

Live provider tests used synthetic approved references for a short factual answer, unavailable fees/event dates, and a short welcome. Both GPT-5 Nano (minimal reasoning) and GPT-5.6 Luna (reasoning off) completed all three tasks. A wording-based automated check initially flagged Nano’s missing-information response; reading the synthetic output confirmed that it correctly declined to invent a fee or date. Nano used 785 input / 125 output tokens across the three cases, no reasoning tokens, estimated USD 0.00008925. Luna used 785 input / 78 output tokens, no reasoning tokens, estimated USD 0.0002506. This small sanity check is not a broad quality benchmark or guaranteed future cost.

Server tests cover minimum effort for both tiers, including Nano’s dated snapshot, grounded Knowledge Engine behavior, private API access and usage accounting. Requests continue using `store:false` and only `OPENAI_API_KEY_BEAU` on the server. There is no automatic paid retry or expensive fallback. Historical usage retains the prices charged at request time.

## Known model retirement

OpenAI schedules GPT-5 Nano’s removal for **11 December 2026**. Replace both configured models and their associated prices before that date. The documented replacement is `gpt-5.6-luna`, which this provider handles with reasoning disabled in both tiers. Rates checked on 21 October 2026: input USD 0.20, cached input USD 0.02, output USD 1.20 per million tokens. Verify current prices and API availability when switching; the application does not silently migrate models or increase costs.

Sources: https://developers.openai.com/api/docs/deprecations and https://developers.openai.com/api/docs/models/gpt-5.6-luna
