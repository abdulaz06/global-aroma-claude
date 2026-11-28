/**
 * Build-time catalogue sync. Reads every product from the public WooCommerce
 * Store API (paginated), then each variation of each variable product, and
 * writes src/generated/catalog.json, but only if the result passes
 * validation. On any failure it exits 0 and leaves the audited snapshot in
 * charge, so a store outage never breaks a deploy or shows broken data.
 *
 *   npm run sync:catalog            (also runs automatically before `npm run build`)
 *   CATALOG_ORIGIN=http://localhost:4599 npm run sync:catalog   (tests)
 *   CATALOG_SYNC=off npm run build                               (skip)
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { normalizeProduct, validateCatalog } from '../src/lib/catalog/normalize';
import { snapshotMeta, snapshotProducts } from '../src/data/catalog/snapshot';
import type { Catalog, Product } from '../src/lib/catalog/types';

const ORIGIN = (process.env.CATALOG_ORIGIN || 'https://globalaroma.me').replace(/\/$/, '');
const API = `${ORIGIN}/wp-json/wc/store/v1/products`;
const OUT = new URL('../src/generated/catalog.json', import.meta.url);
const TIMEOUT = 12_000;

async function get(url: string): Promise<{ json: any; headers: Headers }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json', 'user-agent': 'global-aroma-concept-sync/1.0' } });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return { json: await r.json(), headers: r.headers };
  } finally { clearTimeout(t); }
}

async function pool<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } }));
  return out;
}

async function main() {
  if (process.env.CATALOG_SYNC === 'off') { console.log('[catalog] sync off: using snapshot'); return; }
  const raw: any[] = [];
  for (let page = 1; page <= 20; page++) {
    const { json, headers } = await get(`${API}?per_page=100&page=${page}&orderby=id&order=asc`);
    if (!Array.isArray(json)) throw new Error('unexpected response');
    raw.push(...json);
    const total = Number(headers.get('x-wp-totalpages') || 0);
    if (json.length < 100 || (total && page >= total)) break;
  }
  const variationIds = raw.filter((p) => p.type === 'variable').flatMap((p) => (p.variations ?? []).map((v: any) => v.id));
  const details = new Map<number, any>();
  await pool(variationIds, 6, async (id: number) => { details.set(id, (await get(`${API}/${id}`)).json); });
  const products = raw.map((p) => normalizeProduct(p, details)).filter(Boolean) as Product[];
  const catalog: Catalog = { meta: { source: 'build-sync', readAt: new Date().toISOString(), origin: API }, products };
  const errors = validateCatalog(catalog, { meta: snapshotMeta, products: snapshotProducts });
  if (errors.length) throw new Error('validation failed: ' + errors.slice(0, 5).join('; '));
  mkdirSync(new URL('.', OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(catalog, null, 1));
  const ids = new Set(products.map((p) => p.id));
  const added = products.filter((p) => !snapshotProducts.some((s) => s.id === p.id)).map((p) => p.name);
  const removed = snapshotProducts.filter((s) => !ids.has(s.id)).map((s) => s.name);
  console.log(`[catalog] synced ${products.length} products, ${details.size} variations. New since snapshot: ${added.join(', ') || 'none'}. Missing since snapshot: ${removed.join(', ') || 'none'}.`);
}

main().catch((e) => {
  // Never ship a half-read catalogue: remove any stale generated file and fall back.
  rmSync(OUT, { force: true });
  console.warn(`[catalog] sync skipped (${e.message}); the audited snapshot of ${snapshotMeta.readAt} will be used and labelled as such.`);
});
