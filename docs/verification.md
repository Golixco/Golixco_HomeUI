# Verification history

## Current Mission 02 result — 2026-11-10

- Strict TypeScript and the production/prerender build pass.
- 53 Node tests pass, including the prior acceptance cases, quota-only failover, cooldown, budget sharing, no switch after partial output, cleanup transport and interrupted Gemini completion.
- 19 Chromium browser tests pass. The suite covers the homepage and blog at 320/390/768/1440/2560/3840px, multilingual timing/focus/reduced motion, warm product focus, direct hashes/back/forward, clipboard fallback, JavaScript-disabled articles and existing chat behavior. Final run details are in the handoff.
- All four production artifacts serve meaningful HTML without JavaScript, with unique canonical URLs and valid JSON-LD. Sitemap has four canonical URLs, RSS has two entries; both parse as XML. Original article social PNGs resolve.
- Dependency audit reports zero vulnerabilities. Candidate Git source and browser bundle scans show no detected provider credential/endpoint/system-prompt markers; .env.local stays ignored.
- Windows localhost access to /blog returns HTTP 200.
- Live Gemini: the local owner key was available during Mission 02. Six small diagnostic requests were attempted while investigating provider behavior: two substantive comparison responses completed (the final raw stream had eight chunks and finishReason STOP), and one contextual fourth-dimension response correctly described Visual Craftsmanship. One initial request failed; one direct provider injection probe returned only a fragment; its focused retry was interrupted. Incomplete model output is now handled as an error, with no done event, and minimal thinking is explicit. These observations establish some live functionality, not comprehensive provider reliability or successful direct-model adversarial acceptance. Public injection/private-identity requests are intercepted by the curated rules, which pass acceptance tests. Additional real-provider review is needed before launch. No further quota was deliberately consumed to force fallback.
- Backboard remains disabled: no key/model was available; live catalog requests returned 401. All Backboard generation, cancellation, cleanup and failover assertions use mocks. Retention approval and authenticated model/cost selection remain owner actions.
- Summary candidate URL probes did not establish reliable automatic prefill or external article retrieval. Copy-and-open/manual fallback is implemented; Google AI Mode is a best-effort prepared-query link.

## Prior Mission 01 verification — 2026-11-10

## Baseline

Cloned `Golixco/Golixco_HomeUI`, default branch `main`, starting commit `30cec85` (preceded by `968fd1b`, `73b0662`, `5faad10`). The baseline installed using `npm ci`; its build and existing TypeScript command passed. Baseline dependency audit: 20 findings (5 moderate, 14 high, 1 critical).

## Final local checks

- Node `v24.22.1`; npm `11.19.1`. Node 24.x is documented and pinned in `.nvmrc`/engines.
- Lockfile installation verified after dependency cleanup. Unused Express/dotenv/Vercel build-tool dependencies removed, Vite patched within major 6, React declarations and browser-test tooling added.
- `npm run typecheck`: passed, with TypeScript strict mode enabled.
- `npm test`: **36 passed**, including all 24 requested acceptance scenarios, spelling variation, contextual fourth score and try-it links, source integrity, invalid payloads, scope/privacy, exact URLs, quota/internal/timeout handling, incremental streaming, cancellation, and standalone function packaging.
- Standalone bundle: esbuild includes the static `api/knowledge.json` import; the resulting Node handler answers the launch-catalog question from an independent temporary directory with no source-tree working directory.
- `npm run test:ui`: **8 passed** in Chromium. Viewports 320, 390, 768 and 1440px: no document overflow or page exceptions. Live local FAQ requests, six-score Markdown and fourth-score follow-up pass. Menu links/Escape, disabled newsletter, all 11 social destinations, safe Markdown, partial errors/history filtering, Stop/New chat, reduced motion, 404 and sensitive-path rejection pass.
- `npm run build`: passed. Initial app JS approximately 372.22 kB (119.18 kB gzip), versus baseline 492.12 kB (154.33 kB gzip). Markdown is an additional on-demand chunk, approximately 118.60 kB (36.55 kB gzip). This describes bundle sizes, not a real-user latency benchmark.
- `npm audit`: **0 vulnerabilities** reported at verification time.
- `git diff --check`: passed. Candidate source secret-pattern scan and browser-bundle key/provider/prompt marker scan: no matches. `.env.local` is ignored and excluded from commits/deployment uploads.
- Vercel config values validated against the current published `https://openapi.vercel.sh/vercel.json` schema. No deployed runtime was used. The schema has unrelated experimental branches that do not pass whole-schema meta-validation; actual configuration validation passed using Draft7Validator directly.
- Local `/` returns HTTP 200; `/api/chat` produces actual SSE from the shared backend. Unknown document paths return HTTP 404 locally; environment and server-source paths are rejected.
- Windows PowerShell `Invoke-WebRequest http://localhost:3000/` returned **200**, verifying Windows access through WSL localhost forwarding. Vite listens on 0.0.0.0:3000; the final handoff keeps that development server running.
- GitHub read-only checks before PR preparation: no repository Actions workflows and no recorded deployments. `vercel.json` explicitly disables Git-triggered Vercel deployment.

## Explicit verification limits

No real Gemini key was supplied. Provider streaming, cancellation, quota and timeout checks use synthetic generators/responses. Curated answers are approved static facts, not claims about Gemini output quality. Real Gemini account/model access, latency, hallucination resistance and follow-up quality require a small owner-key test.

No Vercel preview or production deployment occurred. Vercel-specific runtime packaging, production CSP/caching/404 delivery, host aliases, shared WAF behavior and edge streaming need the future authorized preview. Per-instance limits are not global across serverless instances. See the deployment checklist before making the API public.

Social platform verification has login/access limits; see `social-audit.md`. Newsletter persistence is intentionally absent. No Cloudflare DNS/mail routing, Lolixco service or AWS infrastructure was changed.
