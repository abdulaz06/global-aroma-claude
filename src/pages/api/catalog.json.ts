import type { APIRoute } from 'astro';
import { readLiveCatalog } from '../../lib/server/catalog-live';

export const prerender = false;

// Public data only. Cached at the edge for 10 minutes and served stale for a
// day while it refreshes, so the store is asked at most a few times an hour.
export const GET: APIRoute = async () => {
  const origin = process.env.CATALOG_ORIGIN || 'https://globalaroma.me';
  const live = await readLiveCatalog(origin);
  const base = { 'Content-Type': 'application/json; charset=utf-8', 'X-Robots-Tag': 'noindex' };
  if (!live) {
    // 200 with ok:false: an unreachable store is an expected state the page handles, not an error.
    return new Response(JSON.stringify({ ok: false, error: 'store-unavailable' }), { status: 200, headers: { ...base, 'Cache-Control': 'no-store' } });
  }
  return new Response(JSON.stringify({ ok: true, ...live }), {
    status: 200,
    headers: { ...base, 'Cache-Control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400' },
  });
};
