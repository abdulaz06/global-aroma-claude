/**
 * WooCommerce REST API (v3) order → staff Order. Pure mapping, no I/O, so it
 * can be tested against fixtures and reused by the server-only connector.
 * Fields follow https://woocommerce.github.io/woocommerce-rest-api-docs/#order-properties
 *
 * Privacy: only what staff need to identify and fulfil an order is kept.
 * Card data never reaches WooCommerce's order object; any payment-meta field
 * whose key looks card-related is dropped regardless.
 */
import type { Order, OrderEvent, OrderLine, OrderStatus } from './types';

type Raw = Record<string, any>;
const STATUSES: OrderStatus[] = ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'];
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
/** WooCommerce returns *_gmt timestamps without a zone suffix. */
const gmt = (v: unknown) => (typeof v === 'string' && v ? (v.endsWith('Z') ? v : v + 'Z') : null);

export function mapWooOrder(raw: Raw, notes: Raw[] = []): Order | null {
  if (!raw || typeof raw.id !== 'number') return null;
  const status = STATUSES.includes(raw.status) ? (raw.status as OrderStatus) : 'on-hold';
  const b = raw.billing ?? {};
  const name = [str(b.first_name), str(b.last_name)].filter(Boolean).join(' ') || str(b.company) || 'Guest customer';
  const lines: OrderLine[] = (raw.line_items ?? []).map((li: Raw) => {
    const variation = (li.meta_data ?? [])
      .filter((m: Raw) => typeof m?.display_key === 'string' && !String(m.key ?? '').startsWith('_'))
      .map((m: Raw) => `${m.display_key}: ${String(m.display_value ?? '').replace(/<[^>]+>/g, '')}`)
      .join(', ') || null;
    const qty = Math.max(0, Math.round(num(li.quantity)));
    return { name: String(li.name ?? 'Item'), variation, sku: str(li.sku), quantity: qty, unitPrice: num(li.price), total: num(li.total) };
  });
  const created = gmt(raw.date_created_gmt) ?? new Date(0).toISOString();
  const paid = gmt(raw.date_paid_gmt);
  const events: OrderEvent[] = [{ at: created, kind: 'created', text: `Order placed via ${str(raw.created_via) ?? 'checkout'}` }];
  if (paid) events.push({ at: paid, kind: 'payment', text: `Payment recorded${raw.payment_method_title ? ` (${raw.payment_method_title})` : ''}` });
  for (const n of notes) {
    if (typeof n?.note !== 'string') continue;
    events.push({ at: gmt(n.date_created_gmt) ?? created, kind: /email/i.test(n.note) ? 'email' : /status/i.test(n.note) ? 'status' : 'note', text: n.note.replace(/<[^>]+>/g, '').slice(0, 240) });
  }
  events.sort((a, b) => +new Date(a.at) - +new Date(b.at));
  return {
    id: raw.id,
    number: String(raw.number ?? raw.id),
    createdAt: created,
    paidAt: paid,
    status,
    customer: {
      name,
      email: str(b.email) ?? '',
      phone: str(b.phone),
      city: str(b.city),
      country: str(b.country),
      address: [str(b.address_1), str(b.address_2), str(b.city), str(b.state), str(b.country)].filter(Boolean).join(', ') || null,
    },
    lines,
    subtotal: lines.reduce((s, l) => s + l.total, 0),
    shipping: num(raw.shipping_total),
    tax: num(raw.total_tax),
    total: num(raw.total),
    currency: str(raw.currency) ?? 'AED',
    paymentMethod: str(raw.payment_method_title) ?? str(raw.payment_method),
    transactionId: str(raw.transaction_id),
    customerNote: str(raw.customer_note),
    events,
  };
}
