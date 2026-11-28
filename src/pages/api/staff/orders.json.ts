import type { APIRoute } from 'astro';
import { guardStaffRequest, PRIVATE_HEADERS } from '../../../lib/server/staff-guard';
import { fetchRecentOrders } from '../../../lib/server/woo-orders';

export const prerender = false;

/**
 * Future live staff orders endpoint (read-only). Disabled in this concept:
 * see src/lib/server/staff-guard.ts. The public demo at /staff-demo never
 * calls it; it uses synthetic data in the browser.
 */
export const GET: APIRoute = async ({ request }) => {
  const g = await guardStaffRequest(request, process.env);
  if (!g.ok) return new Response(JSON.stringify({ error: g.reason }), { status: g.status, headers: PRIVATE_HEADERS });
  try {
    const orders = await fetchRecentOrders(g.config);
    return new Response(JSON.stringify({ orders }), { status: 200, headers: PRIVATE_HEADERS });
  } catch {
    return new Response(JSON.stringify({ error: 'upstream-unavailable' }), { status: 502, headers: PRIVATE_HEADERS });
  }
};

// Read-only: every other method is refused.
export const ALL: APIRoute = () => new Response(JSON.stringify({ error: 'method-not-allowed' }), { status: 405, headers: { ...PRIVATE_HEADERS, Allow: 'GET' } });
