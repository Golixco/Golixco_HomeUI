# Golixco deployment preparation

This mission is local-only. **Do not deploy, merge, purchase a plan or change DNS yet.** Git-triggered Vercel deployment is disabled in `vercel.json`.

## Implemented locally

- [x] Separate Golixco_HomeUI checkout, working branch, Node 24.x and valid npm lockfile.
- [x] Supplied official branding, complete favicon family, manifest and existing real social-preview image.
- [x] Live Lolixco knowledge, launch-catalog qualification, six analysis dimensions and private leadership policy.
- [x] Shared local/Vercel Node API, static bundled JSON, server-only environment configuration.
- [x] SSE, cancellation, bounded payload/context/output, timeouts and safe errors.
- [x] Per-instance IP request limits, provider concurrency and daily attempt limits.
- [x] Exact official link allowlist, safe Markdown, contact routing and social audit.
- [x] Accessible navigation, mobile spacing and reduced motion; conveyor design preserved.
- [x] Honest unavailable newsletter state; no database or email collection.
- [x] Vite build, function duration, security headers/CSP, caching, 404 fallback and canonical metadata.
- [x] TypeScript, backend acceptance/security/stream tests, browser tests and independent function-bundle test.

## Before an owner-authorized preview

- [ ] Owner supplies `GEMINI_API_KEY` privately in local/Vercel server-side environment; restart local Vite after changes.
- [ ] Make a small real-key sample: product overview, a complex Creator Studio comparison, contextual follow-up, unrelated request and prompt injection. Check streaming and account model access. No real provider calls have been made yet.
- [ ] Choose an eligible commercial Vercel plan, normally Pro. Hobby is restricted to non-commercial personal use: https://vercel.com/docs/plans/hobby . No plan has been purchased.
- [ ] Add a **shared edge rate limit** on `POST /api/chat` in Vercel Firewall. Suggested starting threshold: 12/minute per client IP, with managed bot protections as appropriate. Review the plan’s current rule support/cost before enabling. In-process controls are not a cross-instance/global quota.
- [ ] Set provider-side spend/quota limits; monitor 429s and failures without logging chat contents or secrets.
- [ ] Confirm login-walled social profiles and provide replacement YouTube/Slack links only if intended and live.
- [ ] Authorize preview deployment and deliberately re-enable Git deployments if desired. Keep any initial preview access restricted while validating.

## On that future preview

- [ ] Verify actual Vercel function packaging/runtime and end-to-end progressive Gemini SSE, client cancellation, deadline and quota errors.
- [ ] Verify local/server Origin behavior with the chosen preview hostname, cross-site rejection and no credential/source exposure.
- [ ] Verify HTTP 404 for unknown documents, APIs and missing assets; static fallback and security headers.
- [ ] Verify favicon sizes, touch icons, social preview and all public product routes.
- [ ] Verify mobile, keyboard and reduced motion with production assets/CSP.

## Only after production authorization

- [ ] Attach `golixco.com` to the authorized Vercel project and choose canonical host redirect behavior.
- [ ] Review any necessary DNS plan with the owner; protect Lolixco, AWS, ACM and Cloudflare mail routing records. No changes are authorized by Mission 01.
- [ ] Authorize the final production deployment separately.

## Next mission — intentionally pending

Newsletter database selection, consent/privacy text, subscription persistence, unsubscribe/send behavior and any new social animation requirements. Do not create `newsletter@golixco.com` now. Do not represent currently disabled newsletter signup as a subscription.
