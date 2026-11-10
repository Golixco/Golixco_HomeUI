# Golixco

Mission 02 adds the prerendered [Golixco Blog](https://golixco.com/blog), expanded brand animation and quota-only Gemini → Backboard failover. See [the current architecture, model/storage decisions, summary-link limitations and SEO checklist](docs/mission-02.md). This remains local preparation; nothing has been deployed.

Golixco’s company homepage: a minimal, black-and-white, pixel-inspired React experience with a company assistant and links to **Lolixco’s live public beta** at [lol.golixco.com](https://lol.golixco.com/).

Mission 01 prepares local development and a future Vercel deployment. **Nothing has been deployed.** The existing design can be improved; the previous visual-freeze restriction is superseded.

## Run locally

Use **Node.js 24.x** (`.nvmrc`), npm, and the checked-in lockfile.

```sh
nvm use
npm ci
cp .env.example .env.local  # only if you do not already have a local file
npm run dev
```

Vite binds to `0.0.0.0:3000` with a strict port. Open **http://localhost:3000/**. If port 3000 is occupied, stop the conflicting process or change the port and the local origin allowlist together. This checkout is separate from Lolixco.

The Vite middleware mounts the **same Node handler** used by Vercel at `/api/chat`. This is not a frontend mock. Common company questions are answered immediately from approved facts without a provider call. Detailed conversation requires the owner’s server-side Gemini key:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
```

Paste the real key into ignored `.env.local`, then restart Vite. Do not use a `VITE_` key, commit credentials, or put them in a screenshot. Vite loads local server configuration without exposing it to browser code. `npm run preview` serves the built frontend **only**; it does not run the API.

The default [Gemini 3.5 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite) model was checked against Google’s published model documentation on 2026-11-10. Account access and actual provider quality/latency still need a real-key smoke test; model availability can change. `GEMINI_MODEL` is a server-side override. Real Gemini checks are recorded in the Mission 02 verification report; Backboard requires separate credentials, catalog selection and storage approval.

## Assistant architecture

- `api/chat.ts` is the Vercel entry point; `server/chat.ts` owns the shared HTTP handler.
- `api/knowledge.json` contains versioned public company/product facts, limitations, concepts and unknowns. A **static import** bundles it into the function: no `process.cwd()` or runtime file read.
- `server/knowledge.ts` supplies curated FAQ answers and company-only provider instructions. Curated answers are facts, not simulated Gemini output. Longer comparisons and detailed questions use the provider.
- `shared/official.ts` is the single source for approved social URLs, product routes and contacts. The UI and assistant use those exact links. See [social audit](docs/social-audit.md) for verification limits.
- The backend sends SSE `start`, `delta`, `done`, and `error` events. Provider text is forwarded as it arrives; curated answers arrive in one immediate delta. The client supports Stop, New chat, partial errors, a 40-second connection deadline and scrolling confined to the conversation. Provider cancellation stops local delivery; Google may still charge for work already started.
- No chat transcript is persisted in a local application database. Gemini requests go to Google. The optional Backboard adapter creates temporary provider-side conversation state, with best-effort deletion, and is disabled until the owner approves that storage behavior. The browser sends at most eight recent usable turns, reduced to fit the context budget. Relevant user input is sent to Gemini for detailed conversation. Errors and cancelled assistant messages are excluded from subsequent provider history.
- React Markdown skips raw HTML, suppresses images, and allows only exact approved HTTPS/mailto destinations. Markdown loads on demand to reduce initial JavaScript.

The knowledge covers Lolixco’s live public beta; Home, Explore, Search, Shorts, Shuffle, Edit of the Moment, Immersion and Creator Studio; its **57-edit initial catalog (27 YouTube + 30 hosted)**; and all six experimental analysis dimensions. The launch count is not represented as a real-time statistic. Leadership identities remain private. 2020 is the origin of a name, not a formal company founding date.

Contact routing: general inquiries → `hello@golixco.com`; Lolixco problems → `support@golixco.com`; copyright/removal → `rights@golixco.com`. These are clickable `mailto:` links. Only inbound routing is confirmed; no outbound sending has been configured here.

## Safeguards and operating limits

The endpoint validates JSON, role/text types, a 20,000-byte body, 1,200-character questions, at most 12 history messages, and 12,000 combined context characters. It rejects cross-site origins, restricts unrelated/injection requests, times out slow requests, sanitizes error messages, and bounds provider output. The system prompt treats all conversation history as untrusted and cannot retrieve private files or identities.

Per running function instance: 12 requests per minute and 120 per hour per hashed client IP, 2,000 tracked clients, at most four concurrent provider calls and 200 provider attempts per UTC day. Requests to the curated FAQ are also rate-limited. Vercel’s trusted forwarded client address is used in hosted operation; local development uses the socket address. These are **ephemeral per-instance safeguards**, not a durable global quota: cold starts and multiple instances can reset/multiply them. Origin checks do not authenticate callers. Before a public launch, configure a shared Vercel Firewall rule for `POST /api/chat` and provider-side spend/quota limits. No paid store or infrastructure is provisioned by this code.

Scope/prompt rules and curated refusals reduce prompt-injection risk; no probabilistic model policy is an absolute guarantee. Review a small real-key adversarial sample before launch. The [deployment checklist](deployment_checklist.md) records the outstanding checks.

## Branding and UI

The supplied `Golixco_favi.svg` and RGB 1254×1254 PNG are opaque, including their black background; original transparency was not invented or altered. `public/brand/golixco-icon.svg` preserves the source vector. `golixco-mark.svg` uses the same geometry with a tighter viewBox for navigation/footer; it is not a substitute logo. Original supplied PNGs are retained in `public/brand/`, including the 1672×941 wordmark used for social metadata. Original attachment files are untouched.

The supplied favicon ZIP was extracted using a filename allowlist and size/path checks. ICO, 16/32px PNGs, 180px Apple touch icon and 192/512px Android icons are installed; the manifest identifies Golixco. The obsolete logo is removed.

Navigation now links to Lolixco, About, contacts and socials. Menus support keyboard activation, Escape and outside-click dismissal without locking scrolling. Timeline content distinguishes name history from company milestones. The scroll-driven social conveyor design is retained; it rests when scrolling stops, honors reduced motion, and has an accessible complete link list. Newsletter spacing and chat layout support 320px screens. Focus indicators and a skip link are provided. Small licensed local Noto font subsets render the rotating Devanagari, Japanese and Arabic names on systems without those fonts.

**Newsletter storage is intentionally pending.** The unavailable signup UI collects nothing and never claims success. Database selection, consent, privacy language and subscription storage belong to the next mission. No newsletter address or sending service was created.

## Verify

```sh
npm run typecheck
npm test
npm run build
# Install a test browser once if needed:
npx playwright install chromium
npm run test:ui
npm audit
```

Node tests cover blog content/metadata/link construction, quota-only provider failover, and the 24 acceptance scenarios (including the contextual fourth-dimension case), malicious history and links, request limits, streaming, cancellation, timeouts, provider failures, and the standalone function bundle. Browser tests cover mobile/desktop blog routes, section navigation, animation timing, summary tools and real local FAQ responses and explicitly synthetic provider/error payloads. Synthetic tests do **not** establish live provider quality. A small real Gemini sample and its incomplete/error cases are documented in docs/verification.md. Backboard remains unverified without its key, selected model and storage approval.

## Future Vercel deployment — owner authorization still required

Use the Vite preset, root of this repository, Node 24.x, `npm ci`, `npm run build`, and output directory `dist`. `api/chat.ts` runs as a Node function with a 45-second maximum. `vercel.json` supplies security headers/CSP, static caching, and API no-store behavior. Source maps are not published. The function’s statically imported knowledge is validated by an isolated bundle test. Valid blog routes are emitted as directory index HTML and use clean URLs. Unknown paths have a real HTTP 404 and branded fallback; no blanket rewrite captures API calls or missing assets.

Set server-side `GEMINI_API_KEY` and `GEMINI_MODEL` in the intended Vercel environment. Configure shared edge rate limiting and provider quotas before exposing the API. Smoke-test actual function streaming, missing assets, canonical domain, origin handling and error responses on an authorized preview before production.

**Git-triggered Vercel deployment is disabled** with `git.deploymentEnabled: false`, so opening this mission’s PR must not deploy the site. Re-enable only after owner authorization. The frontend bundle contains no Gemini SDK, server knowledge or API key. The build prerenders all four public routes with unique metadata, structured data, RSS and sitemap; article publication dates remain pending owner approval.

Vercel’s [Hobby rules](https://vercel.com/docs/plans/hobby) restrict that plan to non-commercial personal use. This official company website should use an eligible commercial plan, normally **Pro**; the owner must choose/authorize the plan. No subscription or purchase has been made. The future canonical URL is `https://golixco.com/`; domain attachment and redirects remain deployment-time tasks. Do not change Cloudflare DNS, mail routing, `lol.golixco.com`, CloudFront, ACM or AWS resources as part of this local mission.
