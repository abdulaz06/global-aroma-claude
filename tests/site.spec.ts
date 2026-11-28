import { test, expect, type Page } from '@playwright/test';

const STORE = /^https:\/\/globalaroma\.me\/product\/[a-z0-9-]+\/(\?.*)?$/;
const PAGES = ['/', '/aroma/', '/hospitality/', '/technology/', '/shop/', '/brief/', '/contact/', '/review/'];
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
  expect(buys.length).toBeGreaterThanOrEqual(20);
  for (const h of buys) expect(h).toMatch(STORE);
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
  await expect(count).toHaveText('22 of 67');
  await page.uncheck('[data-online]');
  await page.click('[data-more]');
  await expect(page.locator('[data-card]:visible')).toHaveCount(67);
});

test('brief: shortlist, validate, and build email + WhatsApp hand-offs', async ({ page }) => {
  await page.goto('/aroma/');
  await page.locator('[data-card] [data-brief-add]').first().click();
  await page.locator('.dif-grid .pc [data-brief-add]').first().click();
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

test('keyboard: skip link and dialog focus return', async ({ page }, info) => {
  test.skip(info.project.use.isMobile === true, 'keyboard flow is desktop');
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
  test.skip(info.project.use.isMobile !== true, 'mobile only');
  await page.goto('/');
  await page.click('[data-menu]');
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await expect(page.locator('[data-menu]')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toBeHidden();
});

test('reduced motion: the signature is drawn, not animated', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  const path = page.locator('.hero-sig path').first();
  await expect(path).toBeVisible();
  expect(await path.evaluate((e) => getComputedStyle(e).strokeDasharray)).toBe('none');
  await ctx.close();
});

test('without JavaScript the content, links and contacts remain', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('How a space');
  await expect(page.locator('.hero-cta a[href="/shop"]')).toBeVisible();
  await page.goto('/aroma/');
  await expect(page.locator('.smap-dot')).toHaveCount(67);
  await expect(page.locator('[data-card]')).toHaveCount(67);
  await expect(page.locator('[data-card]:visible')).toHaveCount(67);
  await page.goto('/brief/');
  await expect(page.locator('noscript')).toHaveCount(1);
  await ctx.close();
});

test('shop: full catalogue, categories, search, sort and paging', async ({ page }) => {
  await page.goto('/shop/');
  await expect(page.locator('[data-product]')).toHaveCount(62);
  await page.click('[data-cat-btn=diffusers]');
  await expect(page.locator('[data-count]')).toContainText('14');
  await expect(page.locator('[data-product]:not([data-cat=diffusers]):visible')).toHaveCount(0);
  await expect(page).toHaveURL(/cat=diffusers/);
  await page.click('[data-cat-btn=oils]');
  await page.selectOption('[data-sort]', 'price-asc');
  await page.click('[data-more]').catch(() => {});
  const prices = await page.$$eval('[data-product]:not([hidden])', (els) => els.map((e) => (e as HTMLElement).dataset.price).filter(Boolean).map(Number));
  expect(prices.length).toBeGreaterThan(5);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
  await page.fill('[data-q]', 'zzzz-no-such-scent');
  await expect(page.locator('[data-empty]')).toBeVisible();
  await page.locator('[data-empty] [data-clear]').click();
  await page.click('[data-cat-btn=all]');
  const firstPage = await page.locator('[data-product]:visible').count();
  expect(firstPage).toBeLessThan(62);
  await page.click('[data-more]');
  expect(await page.locator('[data-product]:visible').count()).toBeGreaterThan(firstPage);
});

test('shop: every product leads to the official store; quotes only where unpriced', async ({ page }) => {
  await page.goto('/shop/');
  const buyable = page.locator('[data-product][data-buyable=true]');
  const n = await buyable.count();
  expect(n).toBe(59);
  for (let k = 0; k < n; k++) {
    const a = buyable.nth(k).locator('a[data-cart], a[data-buy]');
    await expect(a).toHaveCount(1);
    expect(await a.getAttribute('href')).toMatch(STORE);
  }
  // Direct cart links: simple products and the individually verified variations only.
  const carts = await page.$$eval('a[data-cart]', (els) => els.map((e) => (e as HTMLAnchorElement).href));
  expect(carts).toContain('https://globalaroma.me/product/arabic-coffee/?attribute_pa_volume=500ml&variation_id=5394&add-to-cart=5390');
  expect(carts).toContain('https://globalaroma.me/product/ga-m-h3000/?add-to-cart=5373');
  for (const h of carts) expect(h).toMatch(/add-to-cart=\d+/);
  await expect(page.locator('[data-id="5235"] a[data-buy]')).toHaveAttribute('href', 'https://globalaroma.me/product/sweet-catch/');
  // Unpriced listings are quote-only.
  await expect(page.locator('[data-product][data-buyable=false]')).toHaveCount(3);
  await expect(page.locator('[data-product][data-buyable=false] a[data-cart], [data-product][data-buyable=false] a[data-buy]')).toHaveCount(0);
  // The catalogue date is stated, and nothing claims live synchronisation.
  await expect(page.locator('[data-fresh]')).toContainText('as listed on the Global Aroma store on 28 November 2026');
  await expect(page.getByText(/checked just now|live prices|synchroni/i)).toHaveCount(0);
  await expect(page.getByText('orders reach', { exact: false })).toHaveCount(0);
});

test('shop: product dialog deep-links and shows the notes source', async ({ page }) => {
  await page.goto('/shop/#p-5390');
  const dlg = page.locator('[data-product-dialog]');
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('[data-pd-title]')).toContainText(/arabic coffee/i);
  await expect(dlg.locator('[data-pd-cart]')).toHaveAttribute('href', STORE);
  await expect(dlg.locator('[data-pd-vols]')).toContainText('500 ml');
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  // In-page hash change opens a product too.
  await page.evaluate(() => { location.hash = '#p-5243'; });
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('[data-pd-cart]')).toBeHidden();
  await expect(dlg.locator('[data-pd-view]')).toHaveAttribute('href', 'https://globalaroma.me/product/royal-residence/');
  await expect(dlg.locator('[data-pd-view]')).toContainText('Buy on globalaroma.me');
});

test('scent finder recommends by feel, keeps the space for the brief', async ({ page }) => {
  await page.goto('/');
  const f = page.locator('#home-finder');
  await f.locator('[data-space="Hotel lobby"]').click();
  await f.locator('[data-mood=fresh]').click();
  await expect(f.locator('[data-f-list] li')).toHaveCount(3);
  await expect(f.locator('[data-f-title]')).toContainText('hotel lobby');
  await f.locator('[data-f-more]').click();
  await expect(f.locator('[data-f-list] li')).toHaveCount(6);
  const brief = await f.locator('[data-f-brief]').getAttribute('href');
  expect(brief).toContain('space=Hotel%20lobby');
  // Changing only the space must not change the matches.
  const before = await f.locator('.f-item-name').allTextContents();
  await f.locator('[data-space=Office]').click();
  expect(await f.locator('.f-item-name').allTextContents()).toEqual(before);
});

test('touch: tapping the scent map lists nearest scents instead of hitting a dot', async ({ page }, info) => {
  test.skip(info.project.use.isMobile !== true, 'coarse pointer only');
  await page.goto('/aroma/');
  const dot = page.locator('#map .smap-dot').first();
  await dot.scrollIntoViewIfNeeded();
  expect(await dot.evaluate((e) => getComputedStyle(e).pointerEvents)).toBe('none');
  const box = (await dot.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('#map [data-near] li')).toHaveCount(4);
  await expect(page.locator('[data-scent-dialog]')).toBeHidden();
});

test('staff demo: labelled synthetic data, simulate, notify, inspect, reset', async ({ page }) => {
  await page.goto('/staff-demo/');
  await expect(page.getByText('Demonstration — sample data only. Not connected to live customer orders.').first()).toBeVisible();
  await expect(page.getByTestId('guide')).toBeVisible();
  await expect(page.getByTestId('step-open')).toBeDisabled();
  const view = page.locator('[data-testid=orders-table]:visible, [data-testid=orders-cards]:visible');
  await expect(view).toHaveCount(1);
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/@(?!example\.com)[a-z0-9-]+\.[a-z]{2,}/i);
  const newBefore = Number(await page.getByTestId('stat-new').innerText().then((t) => t.match(/\d+/)![0]));
  await page.getByTestId('simulate').click();
  await expect(page.getByTestId('toast')).toBeVisible();
  await expect(page.getByTestId('stat-new')).toContainText(String(newBefore + 1));
  await expect(page.getByTestId('bell-count')).not.toHaveText('0');
  await page.getByTestId('toast').getByRole('button', { name: /open/i }).click();
  const detail = page.getByTestId('order-detail');
  await expect(detail).toBeVisible();
  await expect(detail).toContainText('@example.com');
  await expect(detail).toContainText(/AED/);
  await page.keyboard.press('Escape');
  await page.getByTestId('search').fill('zzzz');
  await expect(page.getByTestId('empty')).toBeVisible();
  await page.getByTestId('search').fill('');
  await page.getByRole('button', { name: /example email/i }).first().click();
  await expect(page.getByTestId('email-preview')).toContainText('No email has been sent');
  await page.keyboard.press('Escape');
  page.once('dialog', (d) => d.accept());
  await page.getByTestId('reset').click();
  await expect(page.getByTestId('stat-new')).toContainText(String(newBefore));
});

test('staff demo renders privately, without errors', async ({ page }) => {
  const errors = watch(page);
  const res = await page.goto('/staff-demo/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test('no live order endpoint exists in the public demonstration', async ({ request }) => {
  for (const path of ['/api/staff/orders.json', '/api/catalog.json']) {
    const r = await request.get(path, { headers: { authorization: 'Bearer forged', 'x-staff-user': 'admin' } });
    expect(r.status(), path).toBe(404);
    expect(await r.text()).not.toMatch(/billing|"orders"|consumer_key/);
  }
});

test('staff walkthrough steps tick off in order', async ({ page }) => {
  await page.goto('/staff-demo/');
  await page.getByTestId('step-simulate').click();
  await expect(page.getByTestId('toast')).toBeVisible();
  await page.getByTestId('step-open').click();
  await expect(page.getByTestId('order-detail')).toContainText('Volume:');
  await page.keyboard.press('Escape');
  await page.getByTestId('step-email').click();
  await expect(page.getByTestId('email-preview')).toContainText('No email has been sent');
  await page.keyboard.press('Escape');
  page.once('dialog', (d) => d.accept());
  await page.getByTestId('step-reset').click();
  await expect(page.locator('.sw-steps .ok')).toHaveCount(4);
});

test('owner review guide links to every demonstration, and the bar is on every page', async ({ page, request }) => {
  await page.goto('/review/');
  for (const href of ['/', '/aroma#finder-sec', '/shop', '/staff-demo', '/studio/make']) {
    await expect(page.locator(`.rv-acts a[href="${href}"]`)).toHaveCount(1);
    expect((await request.get(href.split('#')[0])).status(), href).toBe(200);
  }
  await page.goto('/shop/');
  await expect(page.locator('.review-bar a[href="/review/"]')).toBeVisible();
  await page.goto('/');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://global-aroma-website.vercel.app/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://global-aroma-website.vercel.app/og/home.png');
});

test('studio tools: favicon, content maker download, reel fits small screens', async ({ page, request }) => {
  expect((await request.get('/favicon.ico')).status()).toBe(200);
  const errors = watch(page);
  await page.goto('/studio/make/');
  await expect(page.locator('link[rel=icon]')).toHaveAttribute('href', '/favicon.svg');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByText('Nothing is uploaded, saved or posted')).toBeVisible();
  await page.waitForSelector('canvas[data-ready]');
  await page.getByText('Story / reel cover').click();
  await expect.poll(() => page.locator('canvas').evaluate((c: HTMLCanvasElement) => `${c.width}x${c.height}`)).toBe('1080x1920');
  const dl = page.waitForEvent('download');
  await page.click('[data-download]');
  expect((await dl).suggestedFilename()).toMatch(/^global-aroma-.+-1080x1920\.png$/);
  await page.goto('/studio/reel/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});
