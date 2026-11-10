# Final refinements for PR #1

The visible index heading is **Blogs**. Its metadata/publication name and RSS title are **Golixco | Blog**. Canonical sitemap URLs remain unchanged; sitemaps contain URLs, not publication titles.

## Initial paint

The development server sent prerendered content before its JavaScript-imported stylesheet arrived. This explains browser-default blue links, buttons and the initially incorrect logo. Production Vite had already extracted a stylesheet, but the development HTML lacked a direct CSS link.

The shared HTML entry now includes a render-blocking stylesheet link, which Vite rewrites to the hashed CSS in production. The JavaScript CSS import is removed to keep one explicit entry. CSS is identical for prerendered and hydrated markup. The last remote CSS import (VT323) is now a licensed, locally bundled binary-glyph font subset. No loading screen, page-hiding rule or artificial runtime delay was introduced. Prerendering, hydration, metadata and structured data are preserved.

## Finishing changes

- Mobile navigation labels are About and Follow, preserving destinations.
- The menu's own scroller contains overscroll and accounts for safe-area top inset. Opening/closing does not lock or reposition the background page.
- Only one subtle RSS link is visible in blog footers, including article footers; none is promoted on the homepage/index signoff. Feed discovery metadata stays intact.
- The exact supplied monochrome Lolixco PNG is retained unchanged, with descriptive alt text, explicit aspect dimensions, responsive scaling and lazy loading inside the existing article cover, replacing the generic play rectangle and bars. No separate logo block is added. The rasterized cover is also used for the article-specific social preview. Corporate branding remains the G emblem.
- The README starts with the official vector G emblem.

## Private provider configuration

Added the missing names BACKBOARD_API_KEY, BACKBOARD_LLM_PROVIDER, BACKBOARD_MODEL and BACKBOARD_STORAGE_APPROVED to ignored .env.local. Existing Gemini credentials were preserved. Local settings use openrouter / google/gemma-3-27b-it and the owner's explicit temporary-storage approval; no absent Backboard key was invented. .env.example has empty secrets and storage approval false.

The adapter and catalog utility now share a provider-filtered, paginated model-list lookup. Slash-containing identifiers remain query/catalog values rather than ambiguous URL path segments. The selected exact identifier must exist in the authenticated catalog and pass existing provider, known-price, context and streaming checks. Unknown prices/context or an explicit unsupported-streaming flag fail closed. No expensive default or automatic 12B replacement is selected.

Gemma availability, account access, exact price and live streaming remain **unverified until the owner adds the key**. The utility reports exact 27B/12B Gemma candidates, input/output prices, context, declared capabilities and existing cost-limit eligibility. It does not generate text or change configuration.

After adding the key: restart Vite; run `node scripts/backboard-catalog.mjs`; inspect the requested candidate and limits. If rejected, review an actually listed economical 12B option before changing the identifier. For one optional live check run `node scripts/backboard-smoke.mjs --confirm`. It sends a single synthetic public company question through the guarded adapter, then independently checks that its deleted temporary thread and assistant return HTTP 404. It never exhausts Gemini and logs neither conversation text nor IDs. Review account usage and provider retention privately. Keep memory/search/tools off. Cancellation/deletion should be checked before public use. Cleanup remains best-effort, not guaranteed zero retention (missing IDs, process termination, network failures or provider backups can retain state). The owner's opt-in does not change that limitation.

No real Backboard call was initiated. No merge, deployment, DNS, mail, AWS or paid-service action was performed.

## Focused checks executed

Three focused browser checks passed: normal and throttled initial-paint/reload checks across all four routes, plus mobile labels/menu scrolling/scroll-position restoration, heading offsets and RSS visibility. The throttled case uses 120ms latency and 160KB/s download throughput, disables cache and blocks the application bootstrap to prove initial styling does not depend on it. The mobile/logo case was checked again after moving the official emblem into the cover. Production artifacts on all four routes also showed black background, fixed navigation and the correct 52px desktop emblem with JavaScript disabled and a hashed stylesheet in the head. Two catalog helper tests and the existing single Backboard transport test passed with synthetic responses. TypeScript passed. Build/prerender was used to inspect stylesheet emission; the full Node/browser suites, audit and comprehensive production checks were not rerun.
