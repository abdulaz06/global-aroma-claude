/**
 * Diffusers in the existing WooCommerce store (read 23 Nov 2026).
 * Prices are the store's listed AED prices. Only the specifications the store
 * publishes are repeated; no coverage areas are published, so none are shown.
 */
export interface Diffuser {
  code: string;
  url: string;
  price: number | null;
  /** Images live on the official store and load from there; the card works without them. */
  image?: string;
  note?: string;
  kind: 'hvac' | 'unit' | 'other';
}

const IMG = 'https://globalaroma.me/wp-content/uploads/2026/10/';

export const diffusers: Diffuser[] = [
  { code: 'GA-OV-1', url: 'https://globalaroma.me/product/ga-ov-1/', price: 190, image: IMG + 'Screenshot_17-5-2024_171150_-223x300.jpeg', kind: 'unit' },
  { code: 'GA-OV-2', url: 'https://globalaroma.me/product/ga-ov-2/', price: 265, image: IMG + 'Screenshot_17-5-2024_16475_.jpeg', kind: 'unit' },
  { code: 'OV 3', url: 'https://globalaroma.me/product/ov-3/', price: 350, image: IMG + '14-1-300x300.png', kind: 'unit' },
  { code: 'GA-OV-5', url: 'https://globalaroma.me/product/ga-ov-5/', price: 400, image: IMG + 'Screenshot_17-5-2024_163453_.jpeg', note: 'Forward-spray atomiser head, quick-swap reservoir, LCD display, Bluetooth control.', kind: 'unit' },
  { code: 'GA-OV-5 Pro', url: 'https://globalaroma.me/product/ga-ov-5-pro/', price: null, kind: 'unit' },
  { code: 'OV-8', url: 'https://globalaroma.me/product/ov-8/', price: 650, image: IMG + '12-1-300x300.png', kind: 'unit' },
  { code: 'GA-OV-10', url: 'https://globalaroma.me/product/ga-ov-10/', price: 850, image: IMG + 'Screenshot_17-5-2024_164234_.jpeg', kind: 'unit' },
  { code: 'F Air', url: 'https://globalaroma.me/product/f-air/', price: 999, image: IMG + '21-300x300.jpg', kind: 'unit' },
  { code: 'GA-G-Air', url: 'https://globalaroma.me/product/ga-g-air/', price: 1200, image: IMG + 'Screenshot_17-5-2024_164826_-114x300.jpeg', kind: 'unit' },
  { code: 'GA-M-H3000', url: 'https://globalaroma.me/product/ga-m-h3000/', price: 1550, image: IMG + 'Untitled-design-2-1-300x300.jpg', note: 'Black. Connects with HVAC.', kind: 'hvac' },
  { code: 'GA-M-H5000', url: 'https://globalaroma.me/product/ga-m-h5000/', price: 2200, image: IMG + 'Untitled-design-3-300x300.jpg', note: 'Black. Connects with HVAC, double refill bottle.', kind: 'hvac' },
  { code: 'GA-AD-Scent', url: 'https://globalaroma.me/product/ga-ad-scent/', price: 6250, image: IMG + '116-300x300.png', kind: 'unit' },
  { code: 'Rad 0', url: 'https://globalaroma.me/product/rad-0/', price: null, image: IMG + '13-1-300x300.png', kind: 'unit' },
];

export const formatAED = (n: number) =>
  'AED ' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
