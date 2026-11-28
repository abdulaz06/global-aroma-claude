/** Normalised catalogue types: one shape for the snapshot, the build-time sync and the live refresh. */
export interface Variation {
  id: number;
  /** e.g. "500 ml"; null when the store lists the variation with no value */
  volume: string | null;
  price: number;
  purchasable: boolean;
  /** true when this variation's price was read individually (not inferred) */
  verified: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  category: 'oils' | 'diffusers';
  type: 'simple' | 'variable';
  /** Purchasable price in AED; null when the store lists no price */
  price: number | null;
  currency: 'AED';
  purchasable: boolean;
  inStock: boolean | null;
  image: string | null;
  permalink: string;
  variations: Variation[];
}

export interface CatalogMeta {
  source: 'snapshot' | 'build-sync' | 'live';
  /** ISO time the data was read from the store */
  readAt: string;
  origin: string;
  note?: string;
}

export interface Catalog {
  meta: CatalogMeta;
  products: Product[];
}

/** The purchase hand-off for a product, built only from URLs the store itself uses. */
export interface BuyAction {
  /** Product page (with the purchasable volume preselected, where relevant) */
  productUrl: string;
  /** WooCommerce add-to-cart link, as the Store API publishes it; null when not purchasable */
  cartUrl: string | null;
  /** e.g. "500 ml" */
  option: string | null;
}
