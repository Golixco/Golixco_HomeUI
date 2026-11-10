# Production update verification — 10 November 2026 (UTC)

## Review and release status

Branch: `fix/production-chat-analytics-seo`, based on current `main` (`4c689ee`).
Existing project: `golixco`, scope `golixcos-projects`, project ID `prj_oXnRLYFRrE5bSDXuhM336eAoHMhO`.
Verified functional Preview: https://golixco-ecol9fimu-golixcos-projects.vercel.app (Vercel authentication required).
Production remains on `dpl_6P6vm6z4a56X87pDQUXjQzxLnGDP`. No merge, production deployment, promotion, DNS, email, Lolixco infrastructure or paid infrastructure changes were made.

## Chatbot cause, repair and provider evidence

The public curated and model questions both failed with HTTP 500 `FUNCTION_INVOCATION_FAILED`, before the handler ran. Fresh production logs reported:

`ERR_MODULE_NOT_FOUND: Cannot find module '/var/task/server/chat.ts' imported from /var/task/api/chat.js`.

Safe production request references: `bom1::c4zjq-1794339845301-3a7569a77932` and `bom1::rmzgn-1794339846260-6421ddde6b68`. This is a packaging/import failure, rather than evidence of missing keys or exhausted quota.

`tsconfig.json` now enables TypeScript's `rewriteRelativeImportExtensions`. Actual Vercel-emitted JavaScript imports `../server/chat.js`; the corresponding compiled module and authoritative JSON are included. `scripts/check-vercel-function.mjs` imports the actual function with plain Node, checks for dangling relative TypeScript imports, changes away from the repo cwd and verifies curated SSE. An esbuild-only test would not reproduce Vercel's TypeScript packaging.

Initial repaired Previews additionally received incomplete Gemini streams with no text or finish reason. A bounded local request and a Vercel build-time SDK probe both completed against the real model, so daily quota exhaustion was not established. The SDK converter in installed `@google/genai` 2.16.0 drops unrecognized SSE error fields. `server/gemini.ts` now reads the documented Gemini REST SSE protocol directly, retaining structured HTTP/SSE error codes before decoding text. This avoids losing a confirmed quota signal. It keeps the same model, knowledge instructions, 2048 output-token limit, minimal thinking, timeout/cancellation, history roles and shared attempt budget. There are no automatic retries. EOF without STOP remains an error; thought parts are excluded from visitor output.

Final functional Preview evidence:

- Curated question: HTTP 200, knowledge response and SSE completion.
- Actual Gemini comparison: HTTP 200, **5 text deltas / 514 characters / done**, no SSE error.
- Authenticated Gemini model-access check in Vercel: HTTP 200; configured model matches `gemini-3.5-flash-lite`.
- Gemini quota was **not confirmed** in observed requests. Tests cover HTTP 429 and structured SSE `RESOURCE_EXHAUSTED`, non-quota failures, partial output and cancellation.
- Backboard authenticated catalog: requested `openrouter` / `google/gemma-3-27b-it` exists, 131072 context, streaming advertised; input **$0.08/M**, output **$0.35/M**. Gemma 3 12B: $0.05/$0.15 per million, 131072 context. Gemma 2 27B: $0.65/$0.65, 8192 context; its input price exceeds the existing $0.50/M limit. No replacement selected.
- **Backboard generation has not been verified with the real provider.** The deployed Preview reports `BACKBOARD_STORAGE_APPROVED` is false. This privacy gate was preserved; no temporary Backboard conversation was created. All six expected variable names are assigned to Production and Preview, but local exports contain redacted placeholders and cannot verify the real configuration. The read-only preflight ran inside Vercel with its actual build environment.
- `server/chat.ts` emits fixed diagnostic categories, random request IDs and bounded numeric status/finish codes. No visitor prompts, history, IPs, raw provider bodies, credentials or stack traces are logged. Original validation, origin controls, application limits, fallback priority and Backboard cleanup behavior remain in place.

The production chatbot still runs the old failing deployment until release is approved. Curated answers and real Gemini generation work in the verified Preview. Backboard remains gated by the explicit storage-approval decision.

To repeat the authenticated, **read-only** provider/model/catalog checks in a protected Preview build:

`vercel deploy --yes --environment preview --build-env GOLIXCO_CHECK_PROVIDERS=1`

The preflight does not generate text, change environment values, approve storage or select models. Generation probes used during diagnosis have been removed from this script.

## OG image and sharing

The exact supplied image is `public/og-image.png` (1672 × 941, approximately 1.4 MB), without resizing, cropping, distortion or redesign. Homepage and blog-index Open Graph and Twitter metadata use `https://golixco.com/og-image.png`, matching dimensions and descriptive alt text. Both articles retain their unique 1200 × 630 social images.

Preview image check: authenticated HTTP 200, `image/png`; downloaded bytes match the supplied asset. Preview is intentionally protected and sends `X-Robots-Tag: noindex`. Public access to the new production URL and third-party social previews must be rechecked after approved release. No social crawler cache refresh is claimed.

After release, inspect the public URL using [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/), [X Card Validator](https://cards-dev.twitter.com/validator) where available, and [Open Graph debugger](https://www.opengraph.xyz/). LinkedIn's inspector can re-fetch a URL. X may require login and retain cached card data; use its current tools and allow the cache to expire if necessary. Do not expose a Preview protection-bypass URL to crawlers.

## Vercel Web Analytics

Official `@vercel/analytics` uses one `inject()` call from `src/main.tsx`, outside React StrictMode. The SDK handles full-page navigation and its default history tracking; the site's page links currently use normal anchors. Manual pageview calls were deliberately not added, avoiding duplicate navigation events.

`src/analytics.ts` runs only in production builds on canonical production origins. Previews and localhost do not enter the live dashboard. The beforeSend hook allows only the four public paths, strips query strings and fragments, and rejects custom events. There is no chatbot or conversation tracking. A strict-origin referrer policy prevents outgoing same-origin referring URLs from carrying query strings. CSP already permits the same-origin script and ingestion endpoints; no external script or connection allowlist was opened.

Vercel's project API reports Analytics enabled. The Preview `/_vercel/insights/script.js` returns HTTP 200. Browser regression tests exercise the real SDK initializer with ingestion intercepted: one script per page navigation, sanitized hook output, custom-event rejection, and no CSP violations.

**Production pageview receipt is pending release, and is not claimed.** The old live application lacks this package and its insights script currently returns 404. After release, visit each public page without an ad blocker, look for a successful `/_vercel/insights/view` request, then check the existing project's Analytics dashboard, date range and page paths. Never use chat text as an event property. Observed public responses were served by Vercel with no Cloudflare proxy error headers; no DNS or proxy settings were changed.

## Genuine live SEO audit

| Public path | HTTP | Canonical | Title/description | Initial HTML | Indexability |
| --- | --- | --- | --- | --- | --- |
| `/` | 200 | Exact production URL | Unique | Substantial, prerendered | Technically indexable |
| `/blog` | 200 | Exact production URL | Unique | Substantial, prerendered | Technically indexable |
| `/blog/the-golixco-blog` | 200 | Exact production URL | Unique | Full article | Technically indexable |
| `/blog/the-lol-product-lolixco` | 200 | Exact production URL | Unique | Full article | Technically indexable |

All four live pages have index/follow metadata, one H1, appropriate Open Graph/Twitter metadata, JSON-LD and render-blocking CSS. Article pages include breadcrumbs and BlogPosting publisher/author references. Both the desktop and throttled mobile live-browser checks found no hydration errors, horizontal overflow, missing image alt attributes, failed images, broken resources or unstyled first paint. Logo width at first contentful paint was 52 px desktop / 44 px mobile. Built-output tests additionally verify hard refresh on all four routes.

Live `robots.txt`, `sitemap.xml`, `llms.txt` and `rss.xml` all return HTTP 200 with the appropriate types. Robots allows crawling and references the correct sitemap. Sitemap has exactly four canonical pages without fragments. `llms.txt` retains approved public company information; no duplicate `llm.txt` was created. Arbitrary nonexistent root/blog routes return real HTTP 404 with noindex. `/blog/`, `/blog/index.html` and `/index.html` normalize by 308; www redirects to the canonical apex with the existing 307 configuration.

Both articles were present in the project's sole/first READY production deployment, `dpl_6P6vm6z4a56X87pDQUXjQzxLnGDP`, ready at `2026-11-10T18:48:12.395Z`. Article publication metadata therefore records the genuine **UTC calendar date 2026-11-10**, replaces the obsolete pending-publication note, and includes RSS publication dates. Existing editorial modification dates remain 2026-11-10.

All four revised Preview pages and SEO resources return HTTP 200 through authenticated access; unknown routes return 404. Preview noindex and authentication are intentional and remain enabled.

### Search Console owner steps

No owner-authorized Search Console connection is available in this session. Submission, crawl and indexing status are **unknown**, independently of technical indexability. No indexing or ranking promise is made.

1. Open [Google Search Console](https://search.google.com/search-console). Select the existing `golixco.com` property, or add a Domain property for `golixco.com` with the owner Google account.
2. If verification is required, copy Google's exact TXT value into the existing DNS provider; preserve other DNS/email records. This update has not changed DNS. An existing verified URL-prefix property for `https://golixco.com/` can also be used.
3. After approved release, open **Sitemaps**, submit `https://golixco.com/sitemap.xml` if not already submitted, and confirm successful reading.
4. Inspect each of the four full canonical URLs above. Use **Test live URL** to check crawlability. If not indexed, request indexing once where offered. Save URL Inspection's actual indexed/crawled result, selected canonical and any exclusions.
5. Recheck reports later. Sitemap submission is not proof of crawling, and crawling is not proof of indexing. Google decides indexing and may choose different search-result snippets.

## Summary-link behavior on both articles

The shared prompt uses only the exact public canonical article URL, never a Preview hostname, fragment or query. Its text asks for key ideas, important details, factual/opinion distinctions and source citation. Query strings use URLSearchParams.

| Service | Observed direct-link result | Implemented behavior |
| --- | --- | --- |
| ChatGPT `/?q=` | Browser access check (403); no composer prefill verified | Copy on the click and open official HTTPS homepage; paste fallback |
| Google AI Mode `search?udm=50&q=` | Automated browser redirected to Google's anti-abuse page; automatic prefill not confirmed | Existing prepared-query link retained; clipboard/manual fallback now also available |
| Grok `grok.com/?q=` | Exact prompt visible in **Send this message?** review dialog; no automatic submission | Encoded official HTTPS prefill link plus clipboard fallback |
| X `i/grok?text=` | 403; prefill not verified | Not used; verified Grok web link preferred |
| Claude `/new?q=` | Browser access check (403); no HTTPS prefill verified | Copy and open `https://claude.ai/new`; paste fallback |

Grok's review dialog was observed on desktop and emulated iPhone 13 / Pixel 7 browser profiles. Real installed iOS/Android app handoff was unavailable and is not claimed. Official HTTPS links allow the OS/service to handle supported app associations. No private app schemes or guaranteed app-opening claims were introduced. Native anchors preserve the user's gesture, open immediately even if clipboard access fails, and retain noopener/noreferrer. A live status message and selectable prompt support manual copying. No widget action invokes either paid Golixco provider.

Research: [ChatGPT web search](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt), [Google AI Mode](https://support.google.com/websearch/answer/16011537?co=GENIE.platform%3DDesktop&hl=en), [Grok official guide](https://docs.x.ai/grok/overview), [Claude Desktop links](https://support.claude.com/en/articles/14729294-open-claude-desktop-with-a-link). Claude's documented desktop custom scheme is not evidence of browser HTTPS prefill and was not used.

## Validation and release

- `npm run typecheck` passes.
- 63 focused Node tests pass: chat restrictions, attempt budgets, quota-only failover, partial-response rejection, safe diagnostics, REST SSE decoding, metadata and analytics redaction.
- Four production-build Playwright tests pass: desktop/throttled-mobile first paint and refresh; SDK uniqueness/CSP/privacy; both article mobile clipboard-denial/external-link behavior. Existing clipboard-success regression also passes. Browser tests intercept telemetry and do not send fake production pageviews.
- `npm run build` and `vercel build --target=preview` pass. `npm run test:vercel` verifies the real compiled Node function.
- Production and protected Preview HTTP/browser/resource checks described above were performed; curated and real model responses were checked without intentionally exhausting quotas.
- Vercel CLI 65.14.0 authenticated as `golixco`; existing project linked locally. Package engines select Node 24.x, confirmed by function artifact, despite the dashboard's Node 26.x default. No project/runtime setting was silently changed.
- Vercel CLI's authenticated curl created a Protection Bypass for Automation secret for testing. It was not printed or committed; Preview remains authenticated. The owner can revoke that automation bypass under the existing project's Deployment Protection settings after review.

After approval, merge the new PR. Git deployments remain disabled in `vercel.json`, so merging alone does not release. From a clean checkout of approved `main`, use the linked existing project, run `npm ci`, `npm run typecheck`, `npm run build`, and deploy with `vercel deploy --prod`. A cautious release can use `vercel deploy --prod --skip-domain`, verify that deployment with Production configuration, then `vercel promote <verified-production-deployment-url>` when approved. Verify all four pages, curated/model streaming, public OG image, analytics ingestion and sitemap after release. Preserve the previous deployment for rollback. A Preview uses Preview environment values; do not assume promotion automatically rebuilds it with Production values.

Official implementation references: [Vercel setup](https://vercel.com/get-started.md), [Analytics quickstart](https://vercel.com/docs/analytics/quickstart), [runtime logs CLI](https://vercel.com/docs/cli/logs), [Gemini streaming REST API](https://aistudio.google.com/api-reference/generate-content/stream-generate-content).
