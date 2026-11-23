import { test, expect, type Page } from '@playwright/test';

const PAGES = ['/', '/aroma/', '/hospitality/', '/technology/', '/brief/', '/contact/'];
// Product photos load from globalaroma.me; their failure in an offline sandbox is not a site error.
const ignorable = (t: string) => /globalaroma\.me|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/.test(t);

function watch(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !ignorable(m.text() + (m.location().url || ''))) errors.push(m.text()); });
  page.on('requestfailed', (r) => { if (!ignorable(r.url() + (r.failure()?.errorText ?? ''))) errors.push(`failed: ${r.url()}`); });
  return errors;
}

for (const path of PAGES) {
  test(`renders ${path} without errors, with metadata`, async ({ page }) => {
    const errors = watch(page);
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/.+\.png$/);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /^https?:\/\//);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test('every internal link and asset resolves', async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of PAGES) {
    await page.goto(path);
    const urls = await page.$$eval('a[href^="/"], img[src^="/"], link[href^="/"]', (els) =>
      els.map((e) => (e as HTMLAnchorElement).getAttribute('href') || (e as HTMLImageElement).getAttribute('src') || ''));
    urls.forEach((u) => seen.add(u.split('#')[0].split('?')[0] || '/'));
  }
  for (const u of seen) {
    const r = await request.get(u);
    expect(r.status(), u).toBeLessThan(400);
  }
  expect(seen.size).toBeGreaterThan(20);
});

test('store links point at the existing WooCommerce store', async ({ page }) => {
  await page.goto('/aroma/');
  const buys = await page.$$eval('a.act-buy', (els) => els.map((e) => (e as HTMLAnchorElement).href));
  expect(buys.length).toBeGreaterThan(30);
  for (const h of buys) expect(h).toMatch(/^https:\/\/globalaroma\.me\/product\/[a-z0-9-]+\/$/);
});

test('scent map suggests the nearest fragrances and opens details', async ({ page }) => {
  await page.goto('/aroma/');
  const plane = page.locator('#map [data-plane]');
  await plane.scrollIntoViewIfNeeded();
  const box = (await plane.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.12, box.y + box.height * 0.88);
  await expect(page.locator('#map [data-near] li')).toHaveCount(4);
  await page.locator('#map [data-near] li a').first().click();
  const dlg = page.locator('[data-scent-dialog]');
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('[data-title]')).not.toBeEmpty();
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
});

test('library search and filters narrow the collection', async ({ page }) => {
  await page.goto('/aroma/');
  const count = page.locator('[data-count]');
  await expect(count).toHaveText('67 of 67');
  await expect(page.locator('[data-card]:visible')).toHaveCount(15);
  await page.fill('[data-search]', 'oud');
  await expect(count).not.toHaveText('67 of 67');
  const n = await page.locator('[data-card]:visible').count();
  expect(n).toBeGreaterThan(2);
  await page.fill('[data-search]', '');
  await page.check('[data-online]');
  await expect(count).toHaveText('23 of 67');
  await page.uncheck('[data-online]');
  await page.click('[data-more]');
  await expect(page.locator('[data-card]:visible')).toHaveCount(67);
});

test('brief: shortlist, validate, and build email + WhatsApp hand-offs', async ({ page }) => {
  await page.goto('/aroma/');
  await page.locator('[data-card] [data-brief-add]').first().click();
  await page.locator('.dif [data-brief-add]').first().click();
  await expect(page.locator('[data-brief-count]').first()).toHaveText('2');
  await page.goto('/hospitality/');
  await page.locator('.cat [data-brief-add]').first().click();
  await page.goto('/brief/');
  await expect(page.locator('.b-item')).toHaveCount(3);
  await expect(page.locator('input[value=aroma]')).toBeChecked();
  await expect(page.locator('input[value=hospitality]')).toBeChecked();
  // Blocked until there is a way to reply.
  await page.click('[data-send=email]');
  await expect(page.locator('[data-err]')).toBeVisible();
  await page.fill('input[name=name]', 'Test Person');
  await page.fill('input[name=email]', 'test@example.com');
  await page.selectOption('select[name=space]', 'Hotels');
  await expect(page.locator('[data-err]')).toBeVisible();
  const mail = await page.getAttribute('[data-send=email]', 'href');
  expect(mail).toMatch(/^mailto:info@globaldwc\.com\?subject=/);
  expect(decodeURIComponent(mail!)).toContain('Space: Hotels');
  expect(decodeURIComponent(mail!)).toContain('Guest room linen');
  const wa = await page.getAttribute('[data-send=whatsapp]', 'href');
  expect(wa).toMatch(/^https:\/\/wa\.me\/971555827212\?text=/);
  // Removing an item updates the preview.
  await page.locator('.b-item button').first().click();
  await expect(page.locator('.b-item')).toHaveCount(2);
});

test('keyboard: skip link and dialog focus return', async ({ page, browserName }, info) => {
  test.skip(info.project.name === 'mobile', 'keyboard flow is desktop');
  await page.goto('/aroma/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  const link = page.locator('[data-card] .scard-name a').first();
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-scent-dialog]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(link).toBeFocused();
});

test('mobile menu opens and closes', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'mobile only');
  await page.goto('/');
  await page.click('[data-menu]');
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await expect(page.locator('[data-menu]')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toBeHidden();
});

test('reduced motion: the hero stays a still drawing', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('[data-field] svg')).toBeVisible();
  await expect(page.locator('[data-field] canvas')).toHaveCount(0);
  await ctx.close();
});

test('without JavaScript the content, links and contacts remain', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('How a space');
  await expect(page.locator('.smap-dot')).toHaveCount(67);
  await page.goto('/aroma/');
  await expect(page.locator('[data-card]')).toHaveCount(67);
  await expect(page.locator('[data-card]:visible')).toHaveCount(67);
  await page.goto('/brief/');
  await expect(page.locator('noscript')).toHaveCount(1);
  await ctx.close();
});
