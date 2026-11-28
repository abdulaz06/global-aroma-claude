/**
 * The catalogue used by the demonstration: a verified, dated snapshot of the
 * public Global Aroma store (docs/11-catalogue.md). It is not synchronised
 * live; the page says when it was read, and the store remains authoritative.
 */
import { snapshotMeta, snapshotProducts } from '../../data/catalog/snapshot';
import { overlay } from '../../data/catalog/overlay';
import { buyAction } from './normalize';
import type { Catalog } from './types';

export const catalog: Catalog = { meta: snapshotMeta, products: snapshotProducts };

/** Collection slug → its own store listing (same name and notes, purchasable). */
export const storeByCollection: Record<string, { id: number; url: string; cartUrl: string | null; price: number; option: string | null }> = {};
for (const p of catalog.products) {
  const o = overlay[p.id];
  if (!o?.collection || o.match !== 'same' || !p.purchasable || p.price == null) continue;
  if (storeByCollection[o.collection]) continue;
  const b = buyAction(p);
  storeByCollection[o.collection] = { id: p.id, url: b.productUrl, cartUrl: b.cartUrl, price: p.price, option: b.option };
}
