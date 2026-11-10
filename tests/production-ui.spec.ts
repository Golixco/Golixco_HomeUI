import { test, expect } from '@playwright/test';
const paths = [
  '/',
  '/blog',
  '/blog/the-golixco-blog',
  '/blog/the-lol-product-lolixco',
];
for (const mobile of [false, true])
  test(`built pages keep styled first paint and hydrate (${mobile ? 'throttled mobile' : 'desktop'})`, async ({
    page,
  }) => {
    if (mobile) {
      await page.setViewportSize({ width: 390, height: 844 });
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 120,
        downloadThroughput: 160000,
        uploadThroughput: 80000,
      });
    }
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      new PerformanceObserver((l) => {
        if (l.getEntries().some((e) => e.name === 'first-contentful-paint')) {
          (window as any).paint = {
            background: getComputedStyle(document.body).backgroundColor,
            width: document.querySelector('nav img')?.getBoundingClientRect()
              .width,
          };
        }
      }).observe({ type: 'paint', buffered: true });
    });
    for (const path of paths) {
      await page.goto(path, { waitUntil: 'networkidle' });
      await expect(page.locator('h1')).toHaveCount(1);
      await expect
        .poll(() => page.evaluate(() => (window as any).paint))
        .toEqual({ background: 'rgb(0, 0, 0)', width: mobile ? 44 : 52 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        await page.locator('script[src*="/_vercel/insights/"]').count(),
      ).toBe(0);
      await page.reload({ waitUntil: 'networkidle' });
      expect(await page.evaluate(() => (window as any).paint.background)).toBe(
        'rgb(0, 0, 0)',
      );
    }
    expect(errors).toEqual([]);
  });
test('production SDK injects once per full navigation, preserves CSP and redacts pageviews', async ({
  page,
}) => {
  const violations: string[] = [];
  await page.addInitScript(() => {
    (window as any).violations = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      (window as any).violations.push(e.blockedURI),
    );
  });
  await page.route('https://golixco.com/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/_vercel/insights/script.js')
      return route.fulfill({
        contentType: 'application/javascript',
        body: '/* Test stub: no telemetry sent. SDK queue retains the real beforeSend hook. */',
      });
    if (url.pathname.startsWith('/_vercel/'))
      throw new Error('Unexpected telemetry request');
    const response = await route.fetch({
      url: 'http://127.0.0.1:4173' + url.pathname + url.search,
    });
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'referrer-policy': 'strict-origin',
        'content-security-policy':
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'",
      },
    });
  });
  for (const path of paths) {
    await page.goto('https://golixco.com' + path + '?message=private#secret', {
      waitUntil: 'networkidle',
    });
    await expect(
      page.locator('script[src="/_vercel/insights/script.js"]'),
    ).toHaveCount(1);
    const events = await page.evaluate(() => {
      const hook = window.vaq?.find(([name]) => name === 'beforeSend')?.[1] as (
        event: unknown,
      ) => unknown;
      return {
        page: hook({ type: 'pageview', url: location.href }),
        custom: hook({ type: 'event', url: location.href }),
        violations: (window as any).violations,
      };
    });
    expect(events.page).toEqual({
      type: 'pageview',
      url: 'https://golixco.com' + path,
    });
    expect(events.custom).toBeNull();
    violations.push(...events.violations);
  }
  expect(violations).toEqual([]);
});
test('both mobile article links preserve canonical prompt and open even when clipboard is denied', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await context.route('https://grok.com/**', (r) =>
    r.fulfill({
      contentType: 'text/html',
      body: '<title>Destination test</title>',
    }),
  );
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
    }),
  );
  let paid = 0;
  page.on('request', (r) => {
    if (r.url().includes('/api/chat')) paid++;
  });
  for (const path of paths.slice(2)) {
    await page.goto(path, { waitUntil: 'networkidle' });
    const link = page
      .locator('.summary-services a')
      .filter({ hasText: 'Grok' });
    const href = await link.getAttribute('href');
    expect(new URL(href!).searchParams.get('q')).toContain(
      'https://golixco.com' + path,
    );
    const popup = context.waitForEvent('page');
    await link.click();
    const opened = await popup;
    await expect(page.getByRole('status')).toContainText(
      'Clipboard unavailable',
    );
    await expect(
      page.getByRole('textbox', { name: 'Summary prompt to copy manually' }),
    ).toHaveValue(new URL(href!).searchParams.get('q')!);
    await opened.close();
  }
  expect(paid).toBe(0);
});
