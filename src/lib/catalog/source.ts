/** Loads the catalogue (build-time sync result, else the audited snapshot). No site imports, so anything may use it. */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { snapshotMeta, snapshotProducts } from '../../data/catalog/snapshot';
import { overlay } from '../../data/catalog/overlay';
import { buyAction, validateCatalog } from './normalize';
import type { Catalog } from './types';

const GENERATED = fileURLToPath(new URL('../../generated/catalog.json', import.meta.url));

function load(): Catalog {
  const snapshot: Catalog = { meta: snapshotMeta, products: snapshotProducts };
  if (process.env.CATALOG_SOURCE !== 'snapshot' && existsSync(GENERATED)) {
    try {
      const c = JSON.parse(readFileSync(GENERATED, 'utf8')) as Catalog;
      if (!validateCatalog(c, snapshot).length) return c;
    } catch { /* fall back to the snapshot */ }
  }
  return snapshot;
}

export const catalog = load();

/** Collection slug → its own store listing (same name and notes, purchasable). */
export const storeByCollection: Record<string, { id: number; url: string; cartUrl: string | null; price: number; option: string | null }> = {};
for (const p of catalog.products) {
  const o = overlay[p.id];
  if (!o?.collection || o.match !== 'same' || !p.purchasable || p.price == null) continue;
  if (storeByCollection[o.collection]) continue;
  const b = buyAction(p);
  storeByCollection[o.collection] = { id: p.id, url: b.productUrl, cartUrl: b.cartUrl, price: p.price, option: b.option };
}
