/**
 * Server-only, read-only WooCommerce order reader. Only reachable after
 * guardStaffRequest() succeeds. Uses GET endpoints exclusively; there is no
 * code path that edits, refunds or cancels anything.
 */
import { mapWooOrder } from '../../staff/woocommerce';
import type { Order } from '../../staff/types';
import type { WooConfig } from './staff-guard';

export async function fetchRecentOrders(cfg: WooConfig, opts: { page?: number; perPage?: number; after?: string } = {}, fetchImpl: typeof fetch = fetch): Promise<Order[]> {
  const u = new URL(`${cfg.apiUrl}/wp-json/wc/v3/orders`);
  u.searchParams.set('per_page', String(Math.min(opts.perPage ?? 50, 100)));
  u.searchParams.set('page', String(opts.page ?? 1));
  u.searchParams.set('orderby', 'date');
  u.searchParams.set('order', 'desc');
  if (opts.after) u.searchParams.set('after', opts.after);
  const auth = 'Basic ' + Buffer.from(`${cfg.key}:${cfg.secret}`).toString('base64');
  const res = await fetchImpl(u, { method: 'GET', headers: { Authorization: auth, Accept: 'application/json' } });
  // Never echo upstream bodies (they may contain customer data) into logs or errors.
  if (!res.ok) throw new Error(`woocommerce-${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error('woocommerce-unexpected');
  return json.map((o) => mapWooOrder(o)).filter((o): o is Order => !!o);
}
