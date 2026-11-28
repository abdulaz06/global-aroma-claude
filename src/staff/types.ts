/**
 * The staff order model. Deliberately close to a WooCommerce order so the
 * synthetic demo source and a future authorised WooCommerce source produce
 * the same shape (see ./woocommerce.ts and docs/12-staff-integration.md).
 */
export type OrderStatus = 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed';
export type PaymentState = 'paid' | 'awaiting' | 'unpaid' | 'failed' | 'refunded';

export interface OrderLine {
  name: string;
  /** e.g. "Volume: 500 ml" */
  variation: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderEvent {
  at: string;
  kind: 'created' | 'payment' | 'status' | 'email' | 'note';
  text: string;
}

export interface Order {
  id: number;
  /** As staff see it, e.g. "1049" (WooCommerce order number) */
  number: string;
  createdAt: string;
  paidAt: string | null;
  status: OrderStatus;
  customer: { name: string; email: string; phone: string | null; city: string | null; country: string | null; address: string | null };
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: string | null;
  transactionId: string | null;
  customerNote: string | null;
  events: OrderEvent[];
  /** UI state only: a new order not yet opened by staff */
  unseen?: boolean;
}

export interface OrderQuery {
  q?: string;
  status?: OrderStatus | 'all' | 'attention';
  from?: string;
  to?: string;
  sort?: 'newest' | 'oldest' | 'total-desc' | 'total-asc';
}

/** Anything that can supply orders to the staff interface. */
export interface OrderSource {
  readonly kind: 'demo' | 'woocommerce';
  list(query?: OrderQuery): Promise<Order[]>;
  get(id: number): Promise<Order | null>;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending payment', processing: 'Processing', 'on-hold': 'On hold', completed: 'Completed',
  cancelled: 'Cancelled', refunded: 'Refunded', failed: 'Failed',
};

export function paymentState(o: Pick<Order, 'status' | 'paidAt'>): PaymentState {
  if (o.status === 'refunded') return 'refunded';
  if (o.status === 'failed') return 'failed';
  if (o.paidAt || o.status === 'processing' || o.status === 'completed') return 'paid';
  if (o.status === 'cancelled') return 'unpaid';
  return 'awaiting';
}

export const PAYMENT_LABEL: Record<PaymentState, string> = { paid: 'Paid', awaiting: 'Awaiting payment', unpaid: 'Not paid', failed: 'Payment failed', refunded: 'Refunded' };

export function itemCount(o: Pick<Order, 'lines'>) { return o.lines.reduce((n, l) => n + l.quantity, 0); }

/** Filtering and sorting shared by every source. */
export function applyQuery(orders: Order[], q: OrderQuery = {}): Order[] {
  const words = (q.q ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  const from = q.from ? new Date(q.from).getTime() : -Infinity;
  const to = q.to ? new Date(q.to).getTime() : Infinity;
  let out = orders.filter((o) => {
    if (q.status === 'attention') { if (!(o.status === 'processing' || o.status === 'on-hold' || o.status === 'pending')) return false; }
    else if (q.status && q.status !== 'all' && o.status !== q.status) return false;
    const t = new Date(o.createdAt).getTime();
    if (t < from || t > to) return false;
    if (!words.length) return true;
    const hay = [o.number, `#${o.number}`, o.customer.name, o.customer.email, o.customer.phone ?? '', o.transactionId ?? '', ...o.lines.flatMap((l) => [l.name, l.sku ?? ''])].join(' ').toLowerCase();
    return words.every((w) => hay.includes(w));
  });
  const by = q.sort ?? 'newest';
  out = out.sort((a, b) =>
    by === 'oldest' ? +new Date(a.createdAt) - +new Date(b.createdAt)
    : by === 'total-desc' ? b.total - a.total
    : by === 'total-asc' ? a.total - b.total
    : +new Date(b.createdAt) - +new Date(a.createdAt));
  return out;
}
