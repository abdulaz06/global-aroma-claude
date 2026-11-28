/**
 * Demonstration order source: SYNTHETIC DATA ONLY.
 *
 * Products and prices are real catalogue entries (passed in from the synced
 * catalogue) so the demo shows the store's actual merchandise; everything about
 * customers, orders, payments and dates is invented:
 *  - names are first name + initial; emails use example.com (RFC 2606),
 *  - phone numbers use the 000 block (+971 50 000 0xxx),
 *  - order numbers are prefixed "D-", transaction references "SAMPLE-".
 * Nothing here talks to WooCommerce, sends email, or stores anything off the device.
 */
import { applyQuery, type Order, type OrderEvent, type OrderLine, type OrderQuery, type OrderSource, type OrderStatus } from './types';

export interface DemoProduct { name: string; sku: string | null; price: number; option: string | null }

const KEY = 'ga-staff-demo-v1';
const FIRST = ['Aisha', 'Omar', 'Layla', 'Rohan', 'Mariam', 'Daniel', 'Fatima', 'Yusuf', 'Hana', 'Karim', 'Sara', 'Arjun', 'Noor', 'Elena', 'Tariq', 'Priya', 'Zayed', 'Lina', 'Marco', 'Amira'];
const INITIAL = 'ABDFHKMNRSTWZ';
// Each area is paired with the emirate/city it is actually in.
const PLACES: [area: string, city: string][] = [
  ['Business Bay', 'Dubai'], ['Jumeirah', 'Dubai'], ['Al Barsha', 'Dubai'], ['Dubai Marina', 'Dubai'],
  ['Khalifa City', 'Abu Dhabi'], ['Al Majaz', 'Sharjah'], ['Al Nuaimiya', 'Ajman'], ['Al Jimi', 'Al Ain'],
];
const SHIPPING = 25;
const VAT = 0.05;

function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const round2 = (n: number) => Math.round(n * 100) / 100;
const hex = (r: () => number, n = 6) => Array.from({ length: n }, () => '0123456789ABCDEF'[Math.floor(r() * 16)]).join('');

function customer(r: () => number, i: number) {
  const first = FIRST[i % FIRST.length];
  const init = INITIAL[Math.floor(r() * INITIAL.length)];
  const [area, city] = PLACES[Math.floor(r() * PLACES.length)];
  return {
    name: `${first} ${init}.`,
    email: `${first.toLowerCase()}.${init.toLowerCase()}${10 + (i % 80)}@example.com`,
    phone: `+971 50 000 0${String(100 + Math.floor(r() * 899))}`,
    city, country: 'AE',
    address: `${10 + Math.floor(r() * 180)} Sample Street, ${area}, ${city}`,
  };
}

function build(id: number, number: string, created: Date, status: OrderStatus, products: DemoProduct[], r: () => number, custIndex: number): Order {
  const n = 1 + Math.floor(r() * (r() < 0.35 ? 3 : 2));
  const picked = new Set<number>();
  const lines: OrderLine[] = [];
  while (lines.length < n && picked.size < products.length) {
    const k = Math.floor(r() * products.length); if (picked.has(k)) continue; picked.add(k);
    const p = products[k];
    const quantity = p.price > 1000 ? 1 : 1 + Math.floor(r() * (r() < 0.25 ? 4 : 2));
    lines.push({ name: p.name, variation: p.option ? `Volume: ${p.option}` : null, sku: p.sku, quantity, unitPrice: p.price, total: round2(p.price * quantity) });
  }
  const subtotal = round2(lines.reduce((s, l) => s + l.total, 0));
  const shipping = subtotal >= 500 ? 0 : SHIPPING;
  const tax = round2((subtotal + shipping) * VAT);
  const total = round2(subtotal + shipping + tax);
  const card = r() < 0.8;
  const paid = status === 'processing' || status === 'completed' || status === 'refunded';
  const t = (min: number) => new Date(created.getTime() + min * 60000).toISOString();
  const events: OrderEvent[] = [{ at: created.toISOString(), kind: 'created', text: 'Order placed at checkout (sample)' }];
  if (paid) events.push({ at: t(1), kind: 'payment', text: `Payment recorded: ${card ? 'card, sample gateway' : 'cash on delivery'}` });
  if (status !== 'pending' && status !== 'failed') events.push({ at: t(1), kind: 'email', text: 'New order email to orders@example.com (sample recipient)' });
  if (status === 'completed') events.push({ at: t(60 * 26), kind: 'status', text: 'Status changed from Processing to Completed' });
  if (status === 'on-hold') events.push({ at: t(5), kind: 'status', text: 'On hold: awaiting bank transfer confirmation (sample)' });
  if (status === 'cancelled') events.push({ at: t(60 * 3), kind: 'status', text: 'Cancelled at the customer’s request (sample)' });
  if (status === 'refunded') events.push({ at: t(60 * 30), kind: 'status', text: 'Refunded in full (sample)' });
  if (status === 'pending') events.push({ at: t(2), kind: 'note', text: 'Awaiting payment confirmation from the gateway' });
  return {
    id, number, createdAt: created.toISOString(), paidAt: paid ? t(1) : null, status,
    customer: customer(r, custIndex),
    lines, subtotal, shipping, tax, total, currency: 'AED',
    paymentMethod: status === 'on-hold' ? 'Bank transfer (sample)' : card ? 'Card (sample gateway)' : 'Cash on delivery (sample)',
    transactionId: paid && card ? `SAMPLE-TXN-${hex(r)}` : null,
    customerNote: r() < 0.2 ? 'Please call before delivery. (sample note)' : null,
    events,
  };
}

/** Seed orders spread over the last three weeks, relative to `now`, so the demo always looks current. */
export function seedOrders(products: DemoProduct[], now = new Date(), count = 26): Order[] {
  const r = rng(20261127);
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = (i / count) * 21 + r() * 0.8;
    const created = new Date(now.getTime() - daysAgo * 864e5 - r() * 6 * 3600e3);
    // Busy shop hours, Dubai time (UTC+4): 08:00–22:00.
    created.setUTCHours(4 + Math.floor(r() * 14), Math.floor(r() * 60), 0, 0);
    if (created > now) created.setTime(now.getTime() - (i + 1) * 47 * 60000);
    const status: OrderStatus = daysAgo < 1.6 ? (r() < 0.25 ? 'pending' : 'processing')
      : daysAgo < 4 ? (r() < 0.15 ? 'on-hold' : r() < 0.5 ? 'processing' : 'completed')
      : r() < 0.06 ? 'cancelled' : r() < 0.05 ? 'refunded' : 'completed';
    orders.push(build(0, '', created, status, products, r, i));
  }
  // Number orders in the order they were placed, as WooCommerce does.
  orders.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)).forEach((o, k) => { o.id = 9001 + k; o.number = `D-${1001 + k}`; });
  return orders.reverse();
}

/** The demo source: seed + simulated arrivals, persisted on this device only. */
export class DemoOrderSource implements OrderSource {
  readonly kind = 'demo' as const;
  private orders: Order[];
  private sim = 0;
  constructor(private products: DemoProduct[], private storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null) {
    this.orders = this.load() ?? seedOrders(products);
  }
  private load(): Order[] | null {
    try { const raw = this.storage?.getItem(KEY); if (!raw) return null; const d = JSON.parse(raw); this.sim = d.sim ?? 0; return Array.isArray(d.orders) ? d.orders : null; } catch { return null; }
  }
  private save() { try { this.storage?.setItem(KEY, JSON.stringify({ v: 1, sim: this.sim, orders: this.orders })); } catch { /* storage unavailable: memory only */ } }
  async list(q?: OrderQuery) { return applyQuery(this.orders, q); }
  async get(id: number) { return this.orders.find((o) => o.id === id) ?? null; }
  all() { return this.orders; }
  /** Simulates a WooCommerce order arriving: paid, processing, unseen. */
  simulate(now = new Date()): Order {
    this.sim++;
    const r = rng(Date.now() ^ (this.sim * 7919));
    const top = Math.max(...this.orders.map((o) => o.id), 9000);
    const topNum = Math.max(...this.orders.map((o) => Number(o.number.replace(/\D/g, '')) || 1000), 1000);
    const o = build(top + 1, `D-${topNum + 1}`, now, 'processing', this.products, r, this.orders.length + this.sim * 3);
    o.unseen = true;
    o.events[0] = { ...o.events[0], text: 'Order placed at checkout (simulated arrival)' };
    this.orders = [o, ...this.orders];
    this.save();
    return o;
  }
  markSeen(id: number) { const o = this.orders.find((x) => x.id === id); if (o?.unseen) { o.unseen = false; this.save(); } }
  reset() { this.sim = 0; this.orders = seedOrders(this.products); try { this.storage?.removeItem(KEY); } catch { /* ignore */ } return this.orders; }
}
