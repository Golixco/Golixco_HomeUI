# Mission 02 — implementation and owner handoff

## Scope and architecture

Continued the actual `feat/mission-01-brand-chat-vercel` branch from `e01d776`, retaining draft PR #1. No deployment, merge, purchase, DNS or Lolixco/AWS change is part of this mission. Git-triggered Vercel deployment stays disabled.

The homepage retains the existing React/Vite/Motion identity and social conveyor. Navigation is Products / Blog / Contact / Follow. Header and footer use only the authorized SVG emblem; the footer emblem is dimmed. The Lolixco product interaction uses warm amber-gold `#efbd38` per the owner's follow-up reference, superseding the original yellow-green brief. The two removed hero text lines retain empty vertical space; the remaining AI caveat has low opacity. The main heading stays on one line at desktop widths and wraps on mobile.

The multilingual component starts Japanese (2s), Simplified Chinese (2s), English (3s), then Korean, Arabic, English, Hindi, Greek, English and Cyrillic. Non-English entries use 2s. These are phonetic renderings, not official translations or new company names. Font subsets are local; licenses are retained. Arabic has RTL direction. The animation is decorative, hides on focus/typing and uses static English for reduced motion. Native-language editorial review remains advisable before claiming any non-Latin spelling as official.

Facebook is now exactly https://www.facebook.com/Golixco . All rendered social components and assistant links use `shared/official.ts`.

## Blog content and rendering

`src/blog/articles.ts` is the content model: two original articles, approximately 1,406 and 1,748 body words (7/9 minutes at 220 words/minute including headings). Both cover ideology, identity, UI and main details. Only repository/owner-approved facts are used. The personal-blog screenshot is a layout reference, not a factual source or identity association.

- `/blog`
- `/blog/the-golixco-blog`, including `#starting-point`, `#our-mission`, `#introducing-lolixco`
- `/blog/the-lol-product-lolixco`, including `#edits`, `#immersion`, `#creator-studio`

The index, shared article template, sidebar/mobile TOC, active section, breadcrumbs, related article and canonical summary tools live in `src/blog/`. Ordinary links use native browser navigation/back/forward. Section IDs are part of the content model and should stay stable. Initial hash positioning waits for fonts and corrects pre-hydration native scrolling; header offsets keep headings visible.

`npm run build` runs Vite, then `scripts/prerender.ts`. A temporary server-render bundle renders all four public routes into directory `index.html` files using `react-dom/server`. `scripts/page-document.ts` generates unique head metadata and JSON-LD. `.prerender/` is removed after generation. The client hydrates that HTML and loads the blog or homepage code separately. Articles remain readable without JavaScript. There is no CMS, database or framework migration.

Vite development uses the same rendering functions for HTTP 200 on valid routes, actual 404s on unknown/malformed routes, and the generated feeds. Malformed URL decoding is caught before Vite's HTML transform. Public cover assets bypass document rendering. Vercel uses clean URLs and no trailing slash, with filesystem output rather than a blanket SPA rewrite. Actual Vercel behavior still requires the future authorized preview.

To add an article: add the typed record (stable slug and IDs, original content, approved cover, actual edit date), provide a corresponding real social-preview PNG, and build. Route output, metadata, RSS, sitemap, cards and reading time derive from the model. Current editorial work happened on 2026-11-10. No public publication date was confirmed, so `datePublished` and RSS publication dates are omitted; the UI explicitly says publication pending. Set `published` only when publication actually occurs.

Original covers use code-drawn monochrome grids/video signals and authorized company geometry. SVG sources and 1200×630 PNG social previews live in `public/blog/`; no reference-site artwork or composition was copied.

## AI summary links

The four choices are ChatGPT, Google AI Mode, Grok and Claude. LobeHub's brand icons are MIT-licensed; see `public/icons/LICENSE-lobe-icons.txt`. Google Fonts licenses are in `public/fonts/`.

Prepared prompts use **only public canonical article URLs**, with no fragments, credentials, internal hosts or memory instructions. Google uses a URLSearchParams-encoded `udm=50` query. Other services use copy-and-open, rather than an undocumented promise about automatic prefill. A general Copy prompt button also provides manual selection when the clipboard API fails. No summary widget sends a paid API request or calls `/api/chat`.

On 2026-11-10, HTTP probes returned 200 for ChatGPT and Grok candidate query URLs, but this does not establish retained/prefilled input; Claude returned 403. Google redirected an unauthenticated probe to an ordinary search query without retaining `udm=50`. Therefore mode availability, login behavior, fetching and actual summarization are explicitly unverified. The Google query is a best-effort link with copy fallback. Public article retrieval cannot be verified until deployment is authorized. Official OpenAI documentation did not establish a supported ChatGPT query-prefill contract for this use; the UI uses the reliable copy-and-open fallback.

## Gemini and Backboard

Gemini remains primary, `gemini-3.5-flash-lite`, with minimal thinking and a bounded output. Non-STOP completion is treated as an interrupted response instead of a successful fragment. Curated answers still avoid all provider calls. A Backboard fallback is attempted **once**, only on a structured Gemini 429 / RESOURCE_EXHAUSTED failure before text. Partial output never mixes models. Timeout, invalid credentials and 5xx do not trigger fallback. Quota failure opens a 60-second per-instance cooldown; after it expires Gemini is tried first again. While cooling down, configured Backboard can serve the request without another doomed Gemini call. Every model attempt, including fallback, consumes the same 200/day instance budget. Request/IP/concurrency limits apply before providers.

Backboard uses native server-side fetch, so no SDK/plugin dependency was added. Its documented `/threads/messages` SSE is translated to the existing public start/delta/done/error contract. The adapter supplies the same authoritative system instruction, at most four recent untrusted turns, `memory: off`, `web_search: off`, empty tools and disabled media generation. A one-use auto-created thread/assistant is never reused and is deleted on completion/error; known active runs receive cancellation. Cleanup uses independent short deadlines and tries both deletions even if one fails. A failed cleanup does not produce a successful done event.

**Provider storage approval is required before real Backboard traffic.** Backboard's documented threads persist until deletion. Memory off is not a zero-storage guarantee. If a stream disconnects before IDs arrive, the process terminates, deletion fails, or the host freezes post-response work, orphaned state can remain. Provider logs/backups/upstream retention are not established by these API calls. No real Backboard conversation was sent in this mission. `BACKBOARD_STORAGE_APPROVED=false` is the default; adding a key alone does not enable fallback. Owner approval and review of provider privacy terms are required before setting it true. This directly implements the mission's explicit storage-approval requirement.

### Model and cost decision

The Backboard Models API requires a key: unauthenticated catalog/model probes returned HTTP 401. No Gemma identifier, model availability or current price could be verified, so `BACKBOARD_LLM_PROVIDER` and `BACKBOARD_MODEL` intentionally have **no default**. This prevents Backboard's documented `openai/gpt-4o` default from being chosen accidentally.

After privately adding a key, run `node scripts/backboard-catalog.mjs`. This read-only command lists eligible economical text models on the first catalog page and their estimated cost for 4,000 input / 300 output tokens. Review pagination, Gemma candidates and another small model as available; verify context, streaming, knowledge adherence and actual account pricing before selecting one. It does not enable visitor traffic or print secrets.

The runtime rechecks the selected model against the authenticated catalog, requiring an LLM, matching provider, at least 8,192 context tokens, known nonnegative prices, input ≤ $0.50/M and output ≤ $1/M. Models outside those bounds fail closed. A representative **4,000-input / 300-output** request therefore has an illustrative token-price ceiling of **$0.0023**, not a verified quote for a selected model or a maximum bill per call. Actual cost = `(input tokens × input rate + output tokens × output rate) / 1,000,000`, plus any provider charges. The transport has no documented upstream output-token cap field in the consulted message schema, so local cancellation/character limits do not guarantee upstream billed tokens. Use provider credits/spend limits; neither provider offers unlimited use. Larger context/output costs more. Model quality and Backboard streaming are mock-tested only until a key/model and storage approval are supplied.

Official sources consulted: https://docs.backboard.io/quickstart , https://docs.backboard.io/concepts/models , https://docs.backboard.io/concepts/messages , https://docs.backboard.io/concepts/threads , https://docs.backboard.io/concepts/billing , https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite , https://ai.google.dev/gemini-api/docs/thinking .

### Optional provider smoke procedure

1. Paste credentials privately into ignored `.env.local`; never use VITE_ keys. Restart local Vite.
2. For Gemini, ask one detailed Creator Studio comparison and one contextual follow-up; check meaningful incremental text and supported limits. Ask one unrelated/injection question. Do not force quota exhaustion with repeated requests.
3. For Backboard, first obtain storage approval and use the catalog to select an affordable model. With synthetic public questions only, test one stream and independently verify its temporary thread/assistant deletion. Check cancellation and provider account retention settings. Do not intentionally exhaust either provider to test fallback; unit/HTTP tests inject a synthetic quota failure.
4. Keep total calls small, review provider usage, then disable any test configuration. Never commit keys or provider transcripts.

## SEO and owner actions

- [x] Unique titles, descriptions, canonicals, OG/Twitter metadata and meaningful initial HTML on four routes.
- [x] Organization/WebSite, Blog, BlogPosting and BreadcrumbList JSON-LD with company publisher/author and truthful dates.
- [x] Four canonical sitemap entries without hashes, crawlable robots file, canonical RSS and updated llms.txt.
- [x] Local licensed fonts, reserved image dimensions, stable anchors, related links and responsive reading layouts.
- [ ] Owner approves editorial publication/date and reviews unofficial phonetic brand renderings.
- [ ] Owner supplies Backboard key, authenticates catalog, chooses verified economical model and approves provider-side storage before enabling fallback.
- [ ] Owner configures shared edge limits and provider quotas, selects a commercial Vercel plan and separately authorizes preview/production.
- [ ] On an authorized preview, verify Vercel clean URLs, headers/CSP, actual function SSE, cancellation, and domain aliases.
- [ ] After production-domain authorization, verify a Search Console domain property (owner-controlled DNS verification only at that time), submit `https://golixco.com/sitemap.xml`, inspect all four canonical URLs, check rendered HTML and canonical selection, and run Google's Rich Results Test on articles. Review coverage/crawl reports after Google fetches them.

Metadata and a sitemap do not prove indexing. Google decides whether and when to index; nothing was submitted to Search Console in this mission.

## File map

| Area | Main implementation files |
| --- | --- |
| Homepage refinement | `src/components/Navbar.tsx`, `Footer.tsx`, `HeroSection.tsx`, `BrandName.tsx`, `src/index.css`, `public/fonts/` |
| Official links | `shared/official.ts`, `public/llms.txt`, `docs/social-audit.md` |
| Providers and security | `server/providers.ts`, `server/chat.ts`, `server/knowledge.ts`, `.env.example`, `scripts/backboard-catalog.mjs` |
| Blog and summary tools | `src/blog/articles.ts`, `BlogApp.tsx`, `SummaryWidget.tsx`, `public/blog/`, `public/icons/` |
| Rendering and SEO | `src/entry-server.tsx`, `src/main.tsx`, `src/App.tsx`, `scripts/prerender.ts`, `page-document.ts`, `feeds.ts`, `vite.config.ts`, `vercel.json`, `index.html`, `public/rss.xml`, `public/sitemap.xml` |
| Regression tests | `tests/providers.test.ts`, `blog.test.ts`, `mission02.spec.ts`, extended `chat.test.ts`, existing `ui.spec.ts`, `playwright.config.ts` |
| Handoff | `README.md`, `deployment_checklist.md`, `docs/mission-02.md`, `docs/verification.md`; ignored screenshots in `artifacts/mission02/` |
