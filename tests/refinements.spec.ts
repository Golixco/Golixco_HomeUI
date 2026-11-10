import { test, expect } from '@playwright/test';
for (const slow of [false, true])
  test(`focused first paint on all routes (${slow ? 'throttled' : 'normal'})`, async ({ page }) => {
    if (slow) {
      test.setTimeout(90000);
      await page.route('**/src/main.tsx', (r) => r.abort());
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
    await page.addInitScript(() => {
      new PerformanceObserver((list) => {
        if (list.getEntries().some((e) => e.name === 'first-contentful-paint')) {
          const logo = document.querySelector('nav img');
          (window as any).paintStyle = {
            background: getComputedStyle(document.body).backgroundColor,
            nav:
              document.querySelector('nav') &&
              getComputedStyle(document.querySelector('nav')!).position,
            width: logo?.getBoundingClientRect().width,
          };
        }
      }).observe({ type: 'paint', buffered: true });
    });
    for (const path of ['/', '/blog', '/blog/the-golixco-blog', '/blog/the-lol-product-lolixco']) {
      await page.goto(path, { waitUntil: 'commit' });
      await page.waitForFunction(() => Boolean((window as any).paintStyle));
      expect(await page.evaluate(() => (window as any).paintStyle)).toEqual({
        background: 'rgb(0, 0, 0)',
        nav: 'fixed',
        width: 52,
      });
      expect(await page.locator('head link[rel="stylesheet"]').count()).toBeGreaterThan(0);
      await page.reload({ waitUntil: 'commit' });
      await page.waitForFunction(() => Boolean((window as any).paintStyle));
      expect(await page.evaluate(() => (window as any).paintStyle.background)).toBe('rgb(0, 0, 0)');
    }
  });
test('focused mobile menu, scroll position, article anchors and RSS', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  const before = await page.evaluate(() => scrollY);
  await page.setViewportSize({ width: 390, height: 400 });
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(
    page.locator('#mobile-menu').getByRole('link', { name: 'About', exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('#mobile-menu').getByRole('link', { name: 'Follow', exact: true }),
  ).toBeVisible();
  await page.locator('#mobile-menu>div').evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await page.getByRole('button', { name: 'Close menu' }).click();
  expect(await page.evaluate(() => scrollY)).toBe(before);
  expect(await page.locator('a[href="/rss.xml"]').count()).toBe(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/blog');
  await expect(page.locator('h1')).toHaveText('Blogs');
  expect(await page.locator('a[href="/rss.xml"]').count()).toBe(1);
  await page.goto('/blog/the-lol-product-lolixco#creator-studio');
  await expect(page.locator('#creator-studio')).toBeInViewport();
  expect(
    await page.locator('#creator-studio').evaluate((e) => e.getBoundingClientRect().top),
  ).toBeGreaterThan(64);
  await expect(page.locator('.article-cover')).toHaveAttribute(
    'src',
    '/blog/lolixco-cover.png',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
