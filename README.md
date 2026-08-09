<div align="center">
  <img src="public/logo.svg" alt="Golixco Logo" width="100" height="100" />
  <h1>Golixco Company Website</h1>
  <p><strong>The official dark-themed, AI-powered company homepage for Golixco.</strong></p>
</div>

---

## 🚀 Overview

This repository contains the production-ready frontend for the Golixco company website. Built with React and Tailwind CSS, it features a sleek, minimal, glassmorphism UI, a native integrated AI chatbot (powered by the Gemini API), and a highly optimized SEO and discoverability setup.

The visual interface is considered **100% complete and frozen**. Future development efforts are focused entirely on backend deployment integrations.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Styling:** Tailwind CSS (Vanilla custom utilities)
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React & Official SVGs
- **AI Integration:** Google GenAI SDK (`gemini-3-flash-preview`)
- **API Routing:** Vercel Serverless Functions (`/api/chat.ts`)

---

## ✅ Development Status: Frozen & Ready

The frontend development phase is officially completed. Here is the final status of the project:

### Frontend & Architecture
- [x] **UI / Design** — Sleek, dark theme, pixel-inspired aesthetics, glassmorphism.
- [x] **Chatbot Integration** — Functional AI Assistant built natively into the hero section.
- [x] **Knowledge Base** — Strict JSON-based authoritative company knowledge (`api/knowledge.json`).
- [x] **404 Page** — Custom, native SPA routing fallback.
- [x] **API Protection** — Initial payload validation, size constraints, and input sanitization (`api/chat.ts`).

### SEO & Discoverability
- [x] **SEO Metadata** — `<title>`, `<meta>`, canonical URLs, and favicons fully configured.
- [x] **Open Graph / Twitter Cards** — Ready for social sharing (awaiting final OG image).
- [x] **robots.txt** — Search engine crawling configured.
- [x] **sitemap.xml** — Canonical mapping established.
- [x] **llms.txt** — Specialized crawler instructions strictly designed for LLMs (Perplexity, ChatGPT, Claude) to protect company/personal privacy.
- [x] **security.txt** — Standardized security disclosure setup.

---

## ⏳ Pending Deployment Roadmap

The following checklist tracks the final infrastructure and integrations required during official production deployment:

### Backend & Integrations
- [ ] **Newsletter DB** — Connect `NewsletterSection.tsx` to a real backend database (e.g., PostgreSQL, Supabase) and API endpoint.
- [ ] **Privacy Policy** — Draft and implement `/privacy` legal text before collecting any user data.
- [ ] **Terms of Service** — Draft and implement `/terms` legal text.

### Deployment & Security
- [ ] **Production Env Variables** — Securely inject `GEMINI_API_KEY` into Vercel/Host environment settings.
- [ ] **security.txt Verification** — Update the placeholder email in `public/.well-known/security.txt` to the active monitoring address.
- [ ] **Domain/SSL Verification** — Ensure `golixco.com` DNS records and SSL certificates are strictly enforced.
- [ ] **Final Security Audit** — Configure potential rate-limiting (e.g., Vercel KV) on the `/api/chat` route to prevent automated abuse.
- [ ] **Open Graph Image** — Upload the final 1200x630px social preview image.
- [ ] **Production Testing** — Final live smoke tests across mobile and desktop browsers.

---

## 💻 Run Locally

**Prerequisites:** Node.js (v18+)

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set up your environment variables:
   Create a `.env` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   ```
3. Run the development server (Using Vercel CLI is recommended to test serverless functions):
   ```bash
   npx vercel dev
   ```
   *(Alternatively, run `npm run dev` for just the frontend).*
