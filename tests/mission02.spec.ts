import { test, expect } from '@playwright/test';
const paths = ['/blog', '/blog/the-golixco-blog', '/blog/the-lol-product-lolixco'];
for (const width of [320, 390, 768, 1440, 2560, 3840])
  test(`editorial and emblem layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    const logo = page.locator('nav[aria-label="Main navigation"] a[aria-label="Golixco home"]');
    await expect(logo).toHaveText('');
    expect((await logo.boundingBox())!.width).toBeGreaterThanOrEqual(44);
    await expect(page.getByText('Curiosity meets possibility', { exact: true })).toHaveCount(0);
    await expect(
      page.getByText("Our company. Our ideas. The products we're bringing to life.", {
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(page.getByText('AI can make mistakes', { exact: true })).toBeVisible();
    if (width >= 768)
      expect(
        await page
          .locator('#hero-heading')
          .evaluate(
            (el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight),
          ),
      ).toBeLessThan(1.5);
    for (const path of paths) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'https://golixco.com' + path,
      );
      if (path !== '/blog') {
        if (width < 1024) {
          await page.locator('.mobile-toc summary').click();
          await page.locator('.mobile-toc nav a').nth(2).click();
        } else await page.locator('.desktop-toc nav a').nth(2).click();
        await expect(page).toHaveURL(/#/);
        await expect(page.locator('.article-body h2').nth(2)).toBeInViewport();
        expect(
          await page
            .locator('.article-body h2')
            .nth(2)
            .evaluate((el) => el.getBoundingClientRect().top),
        ).toBeGreaterThan(64);
        await expect(page.locator('.summary-services a')).toHaveCount(4);
      }
    }
    expect(errors).toEqual([]);
  });
test('brand sequence, timing and focus; static English for reduced motion', async ({ page }) => {
  const time = new Date('2026-11-10T12:00:00Z');
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
  await page.goto('/');
  const label = page.getByTestId('brand-name');
  const input = page.locator('#company-question');
  await input.focus();
  await expect(label).toHaveCount(0);
  await input.blur();
  await expect(label).toHaveAttribute('data-language', 'ja');
  await page.clock.runFor(1900);
  await expect(label).toHaveAttribute('data-language', 'ja');
  await page.clock.runFor(100);
  await expect(label).toHaveAttribute('data-language', 'zh-Hans');
  await page.clock.runFor(2000);
  await expect(label).toHaveAttribute('data-language', 'en');
  await page.clock.runFor(2900);
  await expect(label).toHaveAttribute('data-language', 'en');
  await page.clock.runFor(100);
  await expect(label).toHaveAttribute('data-language', 'ko');
  await input.focus();
  await expect(label).toHaveCount(0);
  await input.fill('Hi');
  await input.blur();
  await expect(label).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(label).toHaveText('Golixco');
});
test('warm product hover and keyboard focus, updated Facebook destination', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Products', exact: true }).click();
  const product = page.locator('#nav-dropdown .lolixco-product');
  await product.hover();
  await expect(product).toHaveCSS('color', 'rgb(239, 189, 56)');
  await product.focus();
  await expect(product).toHaveCSS('color', 'rgb(239, 189, 56)');
  await expect(page.locator('a[href="https://www.facebook.com/Golixco"]').first()).toBeAttached();
  await expect(page.locator('a[href*="61591436109259"]')).toHaveCount(0);
});
test('deep article hashes, back/forward and unknown paths', async ({ page, request }) => {
  await page.goto('/blog/the-lol-product-lolixco#creator-studio');
  await expect(page.locator('#creator-studio')).toBeInViewport();
  await page.locator('.desktop-toc a[href="#immersion"]').click();
  await page.goBack();
  await expect(page).toHaveURL(/#creator-studio$/);
  await expect(page.locator('#creator-studio')).toBeInViewport();
  await page.goForward();
  await expect(page).toHaveURL(/#immersion$/);
  for (const path of [
    '/blog/missing',
    '/blog/the-golixco-blog-extra',
    '/blog/%E0%A4',
    '/blog/nonexistent.html',
  ]) {
    const r = await request.get(path);
    expect(r.status()).toBe(404);
  }
});
test('clipboard success and manual fallback do not call the chat API', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  let chatCalls = 0;
  page.on('request', (r) => {
    if (r.url().includes('/api/chat')) chatCalls++;
  });
  await page.goto(paths[1]);
  await page.getByRole('button', { name: 'Copy summary prompt' }).click();
  await expect(page.getByRole('status')).toContainText('copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'https://golixco.com/blog/the-golixco-blog',
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
      configurable: true,
    }),
  );
  await page.getByRole('button', { name: 'Copy summary prompt' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Summary prompt to copy manually' }),
  ).toBeVisible();
  expect(chatCalls).toBe(0);
});
test('initial article response is readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://localhost:3000' + paths[1]);
  await expect(
    page.getByRole('heading', { name: 'The Starting Point', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.article-body')).toContainText('2020');
  await context.close();
});
