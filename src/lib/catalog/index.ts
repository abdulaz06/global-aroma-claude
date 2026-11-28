/**
 * The catalogue the site builds from: the build-time sync result when present
 * and valid (src/generated/catalog.json), otherwise the audited snapshot.
 * Merged with the editorial overlay and the published scent collection.
 */
import { overlay } from '../../data/catalog/overlay';
import { scentBySlug, type Scent } from '../library';
import { buyAction } from './normalize';
import { catalog } from './source';
import type { BuyAction, Product } from './types';

export { catalog };

export interface ShopProduct extends Product {
  title: string;
  scent: Scent | null;
  notesMatch: 'same' | 'different' | null;
  notesSource: 'store-description' | 'collection' | null;
  summary: string | null;
  hvac: boolean;
  flags: string[];
  buy: BuyAction;
  /** Signature image for listings with notes */
  signature: string | null;
}

export function titleCase(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+-/g, '-')
    .replace(/(^|[\s-])([a-zà-ÿ])/g, (_, p, c) => p + c.toUpperCase())
    .replace(/\b(Ed|Jnt|Af|Tfr|He|Ga|Ov|Ad|Mh)\b/g, (m) => m.toUpperCase());
}

export const shopProducts: ShopProduct[] = catalog.products.map((p) => {
  const o = overlay[p.id] ?? {};
  const scent = o.collection ? scentBySlug[o.collection] ?? null : null;
  const flags = [...(o.flags ?? [])];
  if (p.type === 'variable' && p.variations.some((v) => !v.purchasable)) {
    const off = p.variations.filter((v) => !v.purchasable).length;
    flags.push(`${off} of ${p.variations.length} volume options are listed without a price.`);
  }
  return {
    ...p,
    title: p.category === 'diffusers' ? p.name.replace(/^REED DIFFUSERS & CANDLES$/, 'Reed Diffusers & Candles') : titleCase(p.name),
    scent,
    notesMatch: o.match ?? null,
    notesSource: o.notesSource ?? null,
    summary: o.summary ?? null,
    hvac: !!o.hvac,
    flags,
    buy: buyAction(p),
    signature: scent ? `/sig/${scent.slug}.svg` : null,
  };
});

/** Store listing whose notes are the collection fragrance's own (same name). */
export function storeListingFor(scentSlug: string): ShopProduct | undefined {
  return shopProducts.find((p) => p.scent?.slug === scentSlug && p.notesMatch === 'same' && p.purchasable);
}

/** The compact shape the shop page ships to the browser. */
export function clientProducts() {
  return shopProducts.map((p) => ({
    id: p.id, title: p.title, slug: p.slug, sku: p.sku, category: p.category, price: p.price, purchasable: p.purchasable,
    inStock: p.inStock, image: p.image, permalink: p.permalink, buy: p.buy, summary: p.summary, hvac: p.hvac,
    notes: p.scent ? { family: p.scent.family, top: p.scent.top, heart: p.scent.heart, base: p.scent.base, accords: p.scent.dominant } : null,
    collectionTitle: p.scent?.title ?? null, notesMatch: p.notesMatch, notesSource: p.notesSource,
    signature: p.signature, flags: p.flags,
    volumes: p.variations.map((v) => ({ volume: v.volume, purchasable: v.purchasable })),
  }));
}
export type ClientProduct = ReturnType<typeof clientProducts>[number];
