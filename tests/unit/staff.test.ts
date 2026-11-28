import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { guardStaffRequest, PRIVATE_HEADERS } from '../../src/lib/server/staff-guard';
import { mapWooOrder } from '../../src/staff/woocommerce';
import { DemoOrderSource, seedOrders } from '../../src/staff/demo-source';
import { applyQuery, itemCount, paymentState } from '../../src/staff/types';

const req = (h: Record<string, string> = {}) => new Request('https://example.com/api/staff/orders', { headers: h });
const FULL = { STAFF_LIVE_ENABLED: 'true', WC_API_URL: 'https://globalaroma.me', WC_CONSUMER_KEY: 'ck_test', WC_CONSUMER_SECRET: 'cs_test' };
const products = [
  { name: 'Arabic Coffee', sku: 'GA-701831-A', price: 280, option: '500 ml' },
  { name: 'GA-OV-1', sku: null, price: 190, option: null },
  { name: 'GA-M-H5000', sku: null, price: 2200, option: null },
];

test('staff guard fails closed at every step', async () => {
  assert.deepEqual(await guardStaffRequest(req(), {}), { ok: false, status: 404, reason: 'not-enabled' });
  assert.deepEqual(await guardStaffRequest(req(), { STAFF_LIVE_ENABLED: 'yes' }), { ok: false, status: 404, reason: 'not-enabled' });
  assert.deepEqual(await guardStaffRequest(req(), { STAFF_LIVE_ENABLED: 'true' }), { ok: false, status: 503, reason: 'not-configured' });
  assert.deepEqual(await guardStaffRequest(req(), { ...FULL, WC_API_URL: 'http://globalaroma.me' }), { ok: false, status: 503, reason: 'not-configured' });
  // Fully configured, with forged headers, is still refused: no identity provider exists yet.
  const forged = req({ Authorization: 'Bearer anything', Cookie: 'staff=1', 'X-Staff': 'admin' });
  assert.deepEqual(await guardStaffRequest(forged, FULL), { ok: false, status: 401, reason: 'unauthenticated' });
});

test('WooCommerce order maps to the staff model with variations, SKUs and totals', () => {
  const raw = JSON.parse(readFileSync(new URL('../fixtures/woo-order.json', import.meta.url), 'utf8'));
  const o = mapWooOrder(raw)!;
  assert.equal(o.number, '727');
  assert.equal(o.customer.name, 'Fixture Person');
  assert.equal(o.createdAt, '2026-11-20T10:15:00Z');
  assert.equal(o.lines[0].variation, 'Volume: 500ml');
  assert.equal(o.lines[0].sku, 'GA-701831-A');
  assert.equal(itemCount(o), 3);
  assert.equal(o.total, 775);
  assert.equal(o.transactionId, 'pi_FIXTURE123');
  assert.equal(paymentState(o), 'paid');
  // Card-related payment meta never makes it into the staff model.
  assert.ok(!JSON.stringify(o).includes('4242'));
});

test('demo data is unmistakably synthetic', () => {
  const orders = seedOrders(products, new Date('2026-11-28T08:00:00Z'));
  assert.ok(orders.length >= 20);
  for (const o of orders) {
    assert.match(o.customer.email, /@example\.com$/);
    assert.match(o.customer.phone ?? '', /^\+971 50 000 0\d{3}$/);
    assert.match(o.number, /^D-\d+$/);
    if (o.transactionId) assert.match(o.transactionId, /^SAMPLE-TXN-/);
    assert.match(o.customer.address ?? '', /Sample Street/);
    assert.ok(o.lines.every((l) => products.some((p) => p.name === l.name && p.price === l.unitPrice)));
    assert.equal(o.total, Math.round((o.subtotal + o.shipping + o.tax) * 100) / 100);
  }
  // Numbered in the order they were placed.
  const asc = [...orders].reverse();
  for (let i = 1; i < asc.length; i++) assert.ok(+new Date(asc[i].createdAt) >= +new Date(asc[i - 1].createdAt));
});

test('simulate adds an unseen, paid, processing order; reset restores the seed', async () => {
  const mem = new Map<string, string>();
  const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) } as unknown as Storage;
  const src = new DemoOrderSource(products, storage);
  const before = (await src.list()).length;
  const o = src.simulate();
  assert.equal((await src.list()).length, before + 1);
  assert.equal(o.unseen, true);
  assert.equal(o.status, 'processing');
  assert.equal(paymentState(o), 'paid');
  assert.equal((await src.list({ q: o.customer.name.split(' ')[0] })).some((x) => x.id === o.id), true);
  src.markSeen(o.id);
  assert.equal((await src.get(o.id))!.unseen, false);
  const again = new DemoOrderSource(products, storage); // persisted on this device
  assert.equal((await again.list()).length, before + 1);
  again.reset();
  assert.equal((await again.list()).length, before);
});

test('order query: search, status, dates and sorting', () => {
  const orders = seedOrders(products, new Date('2026-11-28T08:00:00Z'));
  assert.ok(applyQuery(orders, { status: 'completed' }).every((o) => o.status === 'completed'));
  assert.ok(applyQuery(orders, { status: 'attention' }).every((o) => ['processing', 'pending', 'on-hold'].includes(o.status)));
  const top = applyQuery(orders, { sort: 'total-desc' });
  assert.ok(top[0].total >= top[top.length - 1].total);
  const recent = applyQuery(orders, { from: '2026-11-25T00:00:00Z' });
  assert.ok(recent.every((o) => o.createdAt >= '2026-11-25'));
  assert.equal(applyQuery(orders, { q: 'zz-no-such-thing' }).length, 0);
  assert.ok(applyQuery(orders, { q: 'GA-701831-A' }).length > 0);
});
