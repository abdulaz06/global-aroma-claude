import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProduct, validateCatalog, buyAction } from '../../src/lib/catalog/normalize';
import { snapshotProducts, snapshotMeta } from '../../src/data/catalog/snapshot';

const rawVariable = {
  id: 5390, name: 'ARABIC COFFEE', slug: 'arabic-coffee', sku: 'GA-701831-A', type: 'variable',
  permalink: 'https://globalaroma.me/product/arabic-coffee/', is_purchasable: true, is_in_stock: true,
  prices: { price: '28000', currency_minor_unit: 2 }, categories: [{ slug: 'oils' }],
  images: [{ src: 'https://globalaroma.me/wp-content/uploads/2026/10/Untitled-design-2.png' }],
  variations: [{ id: 5391, attributes: [{ value: '100ml' }] }, { id: 5394, attributes: [{ value: '500ml' }] }],
};
const details = new Map<number, any>([
  [5391, { is_purchasable: false, prices: { price: '0', currency_minor_unit: 2 } }],
  [5394, { is_purchasable: true, prices: { price: '28000', currency_minor_unit: 2 } }],
]);

test('snapshot covers the audited catalogue: 62 products, 48 oils, 14 diffusers, unique ids', () => {
  assert.equal(snapshotProducts.length, 62);
  assert.equal(snapshotProducts.filter((p) => p.category === 'oils').length, 48);
  assert.equal(snapshotProducts.filter((p) => p.category === 'diffusers').length, 14);
  assert.deepEqual(validateCatalog({ meta: snapshotMeta, products: snapshotProducts }), []);
  assert.equal(snapshotProducts.filter((p) => !p.purchasable).map((p) => p.slug).sort().join(), 'ga-ov-5-pro,rad-0,reed-diffusers-candles');
});

test('normalises a variable product and only treats priced variations as purchasable', () => {
  const p = normalizeProduct(rawVariable, details)!;
  assert.equal(p.price, 280);
  assert.equal(p.variations.find((v) => v.id === 5391)!.purchasable, false);
  assert.equal(p.variations.find((v) => v.id === 5394)!.volume, '500 ml');
  const b = buyAction(p);
  assert.equal(b.cartUrl, 'https://globalaroma.me/product/arabic-coffee/?attribute_pa_volume=500ml&variation_id=5394&add-to-cart=5390');
  assert.equal(b.option, '500 ml');
});

test('rejects products outside the store or its catalogue categories', () => {
  assert.equal(normalizeProduct({ ...rawVariable, permalink: 'https://evil.example/x' }), null);
  assert.equal(normalizeProduct({ ...rawVariable, categories: [{ slug: 'hdmi' }] }), null);
  assert.equal(normalizeProduct({ name: 'no id' }), null);
});

test('zero-price products are never purchasable and get no cart link', () => {
  const p = normalizeProduct({ ...rawVariable, type: 'simple', variations: [], prices: { price: '0', currency_minor_unit: 2 }, is_purchasable: false })!;
  assert.equal(p.purchasable, false);
  assert.equal(p.price, null);
  assert.equal(buyAction(p).cartUrl, null);
});

test('validation refuses a suspiciously small or broken read', () => {
  const prev = { meta: snapshotMeta, products: snapshotProducts };
  assert.ok(validateCatalog({ meta: snapshotMeta, products: snapshotProducts.slice(0, 10) }, prev).length > 0);
  assert.ok(validateCatalog({ meta: snapshotMeta, products: [{ ...snapshotProducts[0], price: null, purchasable: true }] }).length > 0);
  assert.ok(validateCatalog({ meta: snapshotMeta, products: [snapshotProducts[0], snapshotProducts[0]] }).length > 0);
});

test('serialised data cannot close the script element', async () => {
  const { safeJson } = await import('../../src/lib/safe-json.ts');
  const out = safeJson({ name: '</script><img src=x onerror=alert(1)> & \u2028' });
  assert.ok(!out.includes('<') && !out.includes('>') && !out.includes('&'));
  assert.deepEqual(JSON.parse(out), { name: '</script><img src=x onerror=alert(1)> & \u2028' });
});

test('direct cart links only for verified variations; other variable oils go to the product page', async () => {
  const { buyAction } = await import('../../src/lib/catalog/normalize.ts');
  const byId = new Map(snapshotProducts.map((p) => [p.id, p]));
  assert.equal(buyAction(byId.get(5390)!).cartUrl, 'https://globalaroma.me/product/arabic-coffee/?attribute_pa_volume=500ml&variation_id=5394&add-to-cart=5390');
  const sweet = buyAction(byId.get(5235)!);
  assert.equal(sweet.cartUrl, null);
  assert.equal(sweet.productUrl, 'https://globalaroma.me/product/sweet-catch/');
  assert.equal(buyAction(byId.get(5373)!).cartUrl, 'https://globalaroma.me/product/ga-m-h3000/?add-to-cart=5373');
  assert.equal(buyAction(byId.get(5426)!).cartUrl, null);
});
