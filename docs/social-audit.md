# Public destination audit — 2026-11-10

Only destinations already in the homepage or existing company knowledge were checked. No private account discovery or identity correlation was performed. HTTP 200 alone does not prove control or activity; platform login walls can hide profile details. The source of company attribution is the owner-authorized repository. `shared/official.ts` records the retained exact destinations.

| Platform | Existing company destination | Result / action |
| --- | --- | --- |
| X | https://x.com/Golixco | 200, page title identifies Golixco; retained. |
| Instagram | https://www.instagram.com/golixco/ | 200, login/client-rendered page limits independent verification; retained as existing company link. |
| LinkedIn | https://www.linkedin.com/company/golixco/ | 200, title identifies Golixco; retained. |
| Reddit | https://www.reddit.com/r/Golixco/ | 200, generic Reddit page limits verification of community state; retained existing community URL. |
| Telegram | https://t.me/GolixcoAI | 200, page identifies the intended handle; retained. |
| Discord | https://discord.gg/RcsYSqh7bK | Official public invite API resolves to the Golixco server, with no expiry reported; retained. |
| GitHub | https://github.com/GolixcoAI | GitHub organization API confirms this organization; retained existing developer destination. The source repository remains Golixco/Golixco_HomeUI; do not infer personal identities from it. |
| Facebook | https://www.facebook.com/Golixco | Mission 02 owner-specified destination correction; do not infer ownership from the former profile ID. Login-walled profile verification remains limited. |
| Threads | https://www.threads.com/@golixco | 200, client/login rendering limits independent verification; retained existing handle. |
| DEV | https://dev.to/golixco | 200, page title identifies Golixco; retained. |
| Bluesky | https://bsky.app/profile/golixco.com | Public profile API resolves `golixco.com` with display name Golixco; retained. |
| YouTube | Previously listed `@golixcohq` | 404; omitted from public destinations and active social answers pending a working official URL. |
| Slack | Existing shared workspace invite | 403; invite availability could not be verified. Removed from public surfaces pending owner confirmation. |
| Substack | Previously listed `@golixco` | Resolved to an individual profile rather than company branding. Removed from public associations; no personal details retained in the knowledge. |
| Blog | Existing external personal blog | Removed from desktop/mobile navigation; replaced with About. No substitute company blog was invented. |

These are point-in-time availability checks, not claims that every retained account is active. The owner should review login-walled profiles before launch. No profiles, invites or email infrastructure were changed.
