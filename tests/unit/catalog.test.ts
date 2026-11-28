import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProduct, validateCatalog, buyAction } from '../../src/lib/catalog/normalize';
import { readLiveCatalog } from '../../src/lib/server/catalog-live';
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

test('live reader returns prices, and null (not stale data) when the store fails', async () => {
  const ok = (async () => new Response(JSON.stringify([rawVariable]), { status: 200 })) as unknown as typeof fetch;
  const live = await readLiveCatalog('https://globalaroma.me', 1000, ok);
  assert.equal(live!.items[0].price, 280);
  const down = (async () => new Response('nope', { status: 502 })) as unknown as typeof fetch;
  assert.equal(await readLiveCatalog('https://globalaroma.me', 1000, down), null);
  const boom = (async () => { throw new Error('network'); }) as unknown as typeof fetch;
  assert.equal(await readLiveCatalog('https://globalaroma.me', 1000, boom), null);
  const garbage = (async () => new Response('{"not":"an array"}', { status: 200 })) as unknown as typeof fetch;
  assert.equal(await readLiveCatalog('https://globalaroma.me', 1000, garbage), null);
});
