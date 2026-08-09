# Golixco Deployment Checklist

This document tracks the final tasks required before or during the official production launch of the Golixco website.

## 1. Newsletter Integration
The frontend Newsletter UI is complete, but it is currently unhooked to a backend. 
- [ ] Deploy a newsletter API endpoint (e.g., `/api/subscribe`).
- [ ] Ensure the backend connects to a database (e.g., PostgreSQL, Supabase) to store:
  - `id`
  - `email`
  - `created_at`
  - `subscription_status`
- [ ] Connect the `handleSubmit` logic in `NewsletterSection.tsx` to this new endpoint via `fetch`.
- [ ] Implement unsubscribe logic handling for future emails.

## 2. Legal Pages
Currently, `/privacy` and `/terms` do not exist.
- [ ] Create a `PrivacyPolicy.tsx` and `TermsOfService.tsx` component.
- [ ] Update `App.tsx` router logic to render these new pages when the paths `/privacy` and `/terms` are requested.
- [ ] Update the footer links to point to `/privacy` and `/terms`.

## 3. Security
- [ ] Ensure `GEMINI_API_KEY` is properly set in the production environment variables (e.g., on Vercel or your hosting provider).
- [ ] Replace the placeholder email in `public/.well-known/security.txt` with a real, monitored security contact email.
- [ ] (Optional) Add a strict Content Security Policy (CSP) in the Vercel/host configuration if required, ensuring it doesn't break React inline styles or existing fonts.

## 4. Analytics
- [ ] If analytics are desired, configure a privacy-friendly tracking system (e.g., Vercel Analytics, Plausible, or Google Analytics) and inject the appropriate script into `index.html`.

## 5. Social Open Graph (OG) Image
- [ ] Create a final Open Graph preview image (1200x630 pixels) that matches the Golixco visual identity.
- [ ] Upload the image to `public/og-placeholder.jpg` or update the `<meta property="og:image">` tags in `index.html` to point to the new image URL.

## 6. Rate Limiting (API)
- [ ] While basic payload size validation has been added to `/api/chat.ts`, consider enabling Vercel KV rate limiting (or similar) on the `/api/chat` route to protect against high-volume automated abuse if traffic scales significantly.
