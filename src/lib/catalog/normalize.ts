/**
 * Store API → normalised catalogue. Pure functions, used by the build-time
 * sync (scripts/sync-catalog.mjs via tsx) and the live endpoint (/api/catalog).
 * Defensive by design: anything malformed is dropped, never guessed.
 */
import type { BuyAction, Catalog, Product, Variation } from './types';

type Raw = Record<string, any>;

const money = (minor: unknown, unit: unknown): number | null => {
  const n = Number(minor), u = Number(unit ?? 2);
  if (!Number.isFinite(n) || !Number.isFinite(u)) return null;
  return Math.round(n) / 10 ** u;
};

const CATEGORY: Record<string, Product['category']> = { oils: 'oils', diffusers: 'diffusers' };

export function normalizeProduct(p: Raw, variationDetails: Map<number, Raw> = new Map()): Product | null {
  if (!p || typeof p.id !== 'number' || typeof p.name !== 'string' || typeof p.permalink !== 'string') return null;
  // The store or a subdomain of it (e.g. shop.globalaroma.me after a migration, doc 14).
  if (!/^https:\/\/([a-z0-9-]+\.)?globalaroma\.me\//.test(p.permalink)) return null;
  const cat = (p.categories ?? []).map((c: Raw) => CATEGORY[c?.slug]).find(Boolean);
  if (!cat) return null; // only the merchant's real catalogue categories
  const unit = p.prices?.currency_minor_unit;
  const price = money(p.prices?.price, unit);
  const type: Product['type'] = p.type === 'variable' ? 'variable' : 'simple';
  const variations: Variation[] = type === 'variable'
    ? (p.variations ?? []).filter((v: Raw) => typeof v?.id === 'number').map((v: Raw) => {
        const d = variationDetails.get(v.id);
        const attr = (v.attributes ?? [])[0]?.value ?? null;
        const vp = d ? money(d.prices?.price, d.prices?.currency_minor_unit) : null;
        return {
          id: v.id,
          volume: attr ? String(attr).replace(/\s*ml$/i, ' ml') : null,
          price: vp ?? 0,
          purchasable: d ? !!d.is_purchasable && (vp ?? 0) > 0 : false,
          verified: !!d,
        };
      })
    : [];
  const purchasable = type === 'variable'
    ? (variationDetails.size ? variations.some((v) => v.purchasable) : !!p.is_purchasable && (price ?? 0) > 0)
    : !!p.is_purchasable && (price ?? 0) > 0;
  return {
    id: p.id,
    name: p.name.trim(),
    slug: String(p.slug ?? ''),
    sku: p.sku ? String(p.sku) : null,
    category: cat,
    type,
    price: purchasable && price && price > 0 ? price : null,
    currency: 'AED',
    purchasable,
    inStock: typeof p.is_in_stock === 'boolean' ? p.is_in_stock : null,
    image: p.images?.[0]?.src && /^https:\/\//.test(p.images[0].src) ? p.images[0].src : null,
    permalink: p.permalink,
    variations,
  };
}

/** Sanity checks before a fresh read may replace the last-known-good data. */
export function validateCatalog(c: Catalog, previous?: Catalog): string[] {
  const errors: string[] = [];
  if (!c.products.length) errors.push('no products');
  if (previous && c.products.length < previous.products.length * 0.6) errors.push(`only ${c.products.length} products (was ${previous.products.length})`);
  for (const p of c.products) {
    if (p.purchasable && !(typeof p.price === 'number' && p.price > 0)) errors.push(`${p.slug}: purchasable without price`);
    if (p.price !== null && (p.price < 1 || p.price > 100000)) errors.push(`${p.slug}: implausible price ${p.price}`);
  }
  const ids = new Set(c.products.map((p) => p.id));
  if (ids.size !== c.products.length) errors.push('duplicate product ids');
  return errors;
}

/** Hand-off links, built only from the store's own URL patterns. */
export function buyAction(p: Product): BuyAction {
  if (!p.purchasable) return { productUrl: p.permalink, cartUrl: null, option: null };
  if (p.type === 'variable') {
    // Direct cart links only for variations read individually from the store.
    // Every other variable product goes to its official product page, where
    // the store handles the volume choice, price and stock.
    const v = p.variations.find((x) => x.verified && x.purchasable && x.volume);
    if (!v) return { productUrl: p.permalink, cartUrl: null, option: null };
    const slug = v.volume!.replace(/\s+/g, '').toLowerCase();
    return {
      productUrl: `${p.permalink}?attribute_pa_volume=${encodeURIComponent(slug)}`,
      // Exactly the add_to_cart URL the Store API returns for the purchasable variation.
      cartUrl: `${p.permalink}?attribute_pa_volume=${encodeURIComponent(slug)}&variation_id=${v.id}&add-to-cart=${p.id}`,
      option: v.volume,
    };
  }
  return { productUrl: p.permalink, cartUrl: `${p.permalink}?add-to-cart=${p.id}`, option: null };
}
