import { test, expect } from '@playwright/test';
const events = (text: string) =>
  `data: ${JSON.stringify({ type: 'delta', text })}\n\ndata: {"type":"done"}\n\n`;
for (const width of [320, 390, 768, 1440])
  test(`layout and live chat at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const logo = page.getByRole('link', { name: 'Golixco home' }).first().locator('img');
    await expect(logo).toHaveJSProperty('naturalWidth', 1254);
    if (width < 768) {
      await page.getByRole('button', { name: 'Open menu' }).click();
      await expect(page.getByRole('link', { name: 'Lolixco LIVE BETA' })).toBeVisible();
      await expect(page.locator('#mobile-menu a[href="mailto:rights@golixco.com"]')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    } else {
      await page.getByRole('button', { name: 'Products', exact: true }).click();
      await expect(page.locator('#nav-dropdown a')).toHaveAttribute(
        'href',
        'https://lol.golixco.com/',
      );
      await page.keyboard.press('Escape');
    }
    const input = page.getByRole('textbox', { name: 'Ask about Golixco or Lolixco' });
    await input.fill('What are the six AI scores?');
    await page.getByRole('button', { name: 'Send question' }).click();
    const log = page.getByRole('log');
    await expect(log.getByText('Visual Craftsmanship', { exact: true })).toBeVisible();
    await expect(log.locator('ol > li')).toHaveCount(6);
    await input.fill('What does the fourth dimension mean?');
    await input.press('Enter');
    await expect(log.getByText('4. Visual Craftsmanship', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send question' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page
      .getByRole('heading', { name: 'Stay close to what comes next.' })
      .scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Coming soon', exact: true })).toBeDisabled();
    await expect(
      page.getByRole('textbox', { name: 'Newsletter email signup — coming soon' }),
    ).toBeDisabled();
    const socials = page.locator('#stay-in-touch');
    await expect(socials.getByText('All official destinations', { exact: true })).toHaveCount(0);
    await expect(socials.getByRole('link')).toHaveCount(12);
    const github = socials.getByRole('link', { name: 'GitHub', exact: true });
    await github.focus();
    await expect(github).toBeInViewport();
    expect(
      await page.locator('a[href*="substack"],a[href*="join.slack"],a[href*="blogs."]').count(),
    ).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
test('safe Markdown and unsafe model links', async ({ page }) => {
  await page.route('**/api/chat', (r) =>
    r.fulfill({
      contentType: 'text/event-stream',
      body: events(
        '**Hello**\n\n1. One\n2. Two\n\n`code` and *emphasis*. [Support](mailto:support@golixco.com). [unsafe](https://evil.test). <script>window.pwned=true</script> ![image](https://evil.test/tracker.png)',
      ),
    }),
  );
  await page.goto('/');
  await page
    .getByRole('textbox', { name: 'Ask about Golixco or Lolixco' })
    .fill('What is Golixco?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.getByRole('log').locator('strong')).toHaveText('Hello');
  await expect(page.getByRole('log').getByRole('link', { name: 'Support' })).toHaveAttribute(
    'href',
    'mailto:support@golixco.com',
  );
  await expect(page.getByRole('log').getByRole('link', { name: 'unsafe' })).toHaveCount(0);
  await expect(page.getByRole('log').locator('script,img')).toHaveCount(0);
  expect(await page.evaluate(() => 'pwned' in window)).toBe(false);
});
test('retry replaces the failed answer in place and New chat resets', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/chat', async (r) => {
    requests++;
    if (requests === 1)
      await r.fulfill({
        contentType: 'text/event-stream',
        body: 'data: {"type":"delta","text":"Partial answer"}\n\ndata: {"type":"error","error":"Provider quota reached. Try later."}\n\n',
      });
    else {
      expect(r.request().postDataJSON()).toEqual({ message: 'What is Golixco?', history: [] });
      await r.fulfill({ contentType: 'text/event-stream', body: events('Recovered') });
    }
  });
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Ask about Golixco or Lolixco' });
  await input.fill('What is Golixco?');
  await input.press('Enter');
  await expect(page.getByRole('alert')).toContainText('Provider quota');
  await expect(page.getByRole('log')).toContainText('Response interrupted');
  await page.getByRole('button', { name: 'Retry response' }).click();
  await expect(page.getByRole('log')).toContainText('Recovered');
  await expect(page.getByRole('log').getByText('What is Golixco?', { exact: true })).toHaveCount(1);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'New chat' }).click();
  await expect(page.getByRole('log')).toHaveCount(0);
  await expect(input).toBeFocused();
});
test('Stop keeps input usable', async ({ page }) => {
  await page.route('**/api/chat', async (r) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await r
      .fulfill({ contentType: 'text/event-stream', body: events('Delayed response') })
      .catch(() => {});
  });
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Ask about Golixco or Lolixco' });
  await input.fill('Explain Golixco');
  await input.press('Enter');
  await page.getByRole('button', { name: 'Stop response', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Response stopped.');
  await input.fill('Still typing');
  await expect(input).toHaveValue('Still typing');
});
test('reduced motion and real HTTP 404', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#stay-in-touch a[tabindex="-1"]')).toHaveCount(12);
  await page.locator('#stay-in-touch').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const response = await page.goto('/missing-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  for (const path of [
    '/.env.local',
    '/api/knowledge.json',
    '/server/chat.ts',
    '/@fs/home/rohan/Golixco/Golixco_HomeUI/.env.local',
  ])
    expect((await request.get(path)).status()).toBeGreaterThanOrEqual(400);
});
