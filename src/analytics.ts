import { inject, type BeforeSendEvent } from '@vercel/analytics';

// Keep article content out of the initial homepage bundle.
const pages = new Set([
  '/',
  '/blog',
  '/blog/the-golixco-blog',
  '/blog/the-lol-product-lolixco',
]);
const origins = new Set(['https://golixco.com', 'https://www.golixco.com']);
let initialized = false;

export function redactAnalytics(
  event: BeforeSendEvent,
): BeforeSendEvent | null {
  if (event.type !== 'pageview') return null;
  try {
    const url = new URL(event.url);
    if (!origins.has(url.origin) || !pages.has(url.pathname)) return null;
    url.search = '';
    url.hash = '';
    return { ...event, url: url.href };
  } catch {
    return null;
  }
}

export function startAnalytics() {
  // Canonical production only: previews and localhost do not enter the live dashboard.
  if (
    initialized ||
    !import.meta.env.PROD ||
    !origins.has(window.location.origin)
  )
    return;
  initialized = true;
  inject({ mode: 'production', beforeSend: redactAnalytics });
}
