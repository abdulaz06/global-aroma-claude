/**
 * Gatekeeper for any future live staff data. FAILS CLOSED.
 *
 * Live order access needs ALL of:
 *   1. STAFF_LIVE_ENABLED=true (server-only env var, never PUBLIC_*),
 *   2. WooCommerce read-only REST credentials (WC_API_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET),
 *   3. a verified staff session from a real identity provider.
 *
 * (3) is intentionally NOT implemented in this concept: no provider is chosen
 * yet (docs/12-staff-integration.md compares options). Until one is wired in
 * and reviewed, verifyStaffSession() returns null and every live request is
 * refused, whatever the flags say. A hidden URL or a flag alone can never
 * expose orders.
 */
export type GuardResult =
  | { ok: true; staff: { id: string; email: string; role: 'shop_viewer' } ; config: WooConfig }
  | { ok: false; status: 404 | 401 | 403 | 503; reason: 'not-enabled' | 'not-configured' | 'unauthenticated' | 'forbidden' };

export interface WooConfig { apiUrl: string; key: string; secret: string }

type Env = Record<string, string | undefined>;

export function readWooConfig(env: Env): WooConfig | null {
  const apiUrl = env.WC_API_URL, key = env.WC_CONSUMER_KEY, secret = env.WC_CONSUMER_SECRET;
  if (!apiUrl || !key || !secret) return null;
  if (!/^https:\/\//.test(apiUrl)) return null; // credentials only ever travel over TLS
  return { apiUrl: apiUrl.replace(/\/$/, ''), key, secret };
}

/**
 * Placeholder for a real identity check (e.g. an OIDC provider or WordPress
 * application-password exchange). Returns null until implemented: fail closed.
 */
export async function verifyStaffSession(_request: Request, _env: Env): Promise<{ id: string; email: string; role: 'shop_viewer' } | null> {
  return null;
}

export async function guardStaffRequest(request: Request, env: Env): Promise<GuardResult> {
  if (env.STAFF_LIVE_ENABLED !== 'true') return { ok: false, status: 404, reason: 'not-enabled' };
  const config = readWooConfig(env);
  if (!config) return { ok: false, status: 503, reason: 'not-configured' };
  const staff = await verifyStaffSession(request, env);
  if (!staff) return { ok: false, status: 401, reason: 'unauthenticated' };
  if (staff.role !== 'shop_viewer') return { ok: false, status: 403, reason: 'forbidden' };
  return { ok: true, staff, config };
}

/** Headers for every staff response: never cached, never indexed. */
export const PRIVATE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
  Vary: 'Authorization, Cookie',
} as const;
