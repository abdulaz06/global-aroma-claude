/**
 * Last-known-good catalogue: a manual audit of the public WooCommerce Store API
 * (https://globalaroma.me/wp-json/wc/store/v1/products, all 4 pages of 20,
 * ordered by id) on 27 Nov 2026. 62 products: 48 Oils + 14 Diffusers, matching
 * the API's category counts. See docs/11-catalogue.md.
 *
 * This snapshot is the demonstration's catalogue: the Shop states the date it
 * was read and sends every purchase to the official store, which confirms
 * prices, stock and options. Variation IDs other than VERIFIED_VARIATIONS follow
 * the store's consecutive numbering and are not used for direct cart links.
 *
 * Format per product:
 *  [id, name, slug, sku, category, type, price, purchasable, image, variations]
 *  variations: "variationId:volume" (volume "-" when the store lists no value)
 */
import type { CatalogMeta, Product, Variation } from '../../lib/catalog/types';

const IMG = 'https://globalaroma.me/wp-content/uploads/2026/10/';
const OIL = IMG + 'Untitled-design-2.png';

type Row = [number, string, string, string, 'oils' | 'diffusers', 'simple' | 'variable', number, boolean, string, string];

const v4 = (a: number, b: number, c: number, d: number) => `${a}:100ml ${b}:250ml ${c}:300ml ${d}:500ml`;
const seq = (s: number) => v4(s, s + 1, s + 2, s + 3);

const ROWS: Row[] = [
  [5234, 'FRENCH OPEN', 'french-open', '', 'oils', 'variable', 237, true, OIL, v4(5263, 5290, 5291, 5292)],
  [5235, 'SWEET CATCH', 'sweet-catch', 'GA-T901512', 'oils', 'variable', 276, true, OIL, seq(5293)],
  [5236, 'FAMOUS OUD', 'famous-oud', 'GA-ITM0451240', 'oils', 'variable', 329, true, OIL, seq(5297)],
  [5237, 'FOR YOU', 'for-you', 'GA-ITM0451233', 'oils', 'variable', 281, true, OIL, seq(5301)],
  [5238, 'PARADISE LAND', 'paradise-land', 'GA-350527-B', 'oils', 'variable', 204.42, true, OIL, seq(5305)],
  [5239, 'WHITE BEACH', 'white-beach', 'GA-353748-D', 'oils', 'simple', 285, true, OIL, ''],
  [5240, 'WHITE TEA', 'white-tea', 'GA-343871-D', 'oils', 'variable', 207, true, OIL, seq(5309)],
  [5241, 'REASON TO HAVE', 'reason-to-have', 'GA-343844-D', 'oils', 'variable', 273, true, OIL, seq(5313)],
  [5242, 'LEATHER BOUQUET', 'leather-bouquet', 'GA-260672-E', 'oils', 'variable', 248.4, true, OIL, seq(5317)],
  [5243, 'ROYAL RESIDENCE', 'royal-residence', 'GA-353949-D', 'oils', 'variable', 301, true, OIL, seq(5321)],
  [5244, 'GINGER EARTH', 'ginger-earth', 'GA-283052', 'oils', 'variable', 205, true, OIL, seq(5341)],
  [5245, 'ROYAL FLOWER', 'royal-flower', 'GA-607403', 'oils', 'variable', 305, true, OIL, '5436:- 5435:500ml'],
  [5246, 'SULTAN OF DECENCY', 'sultan-of-decency', 'GA-351507-A', 'oils', 'variable', 345, true, OIL, seq(5325)],
  [5247, 'GINGER BLOSSOM', 'ginger-blossom', 'GA-233221', 'oils', 'variable', 205, true, OIL, seq(5329)],
  [5248, 'GINGERBREAD DELIGHT', 'gingerbread-delight', '', 'oils', 'variable', 205, true, OIL, seq(5333)],
  [5249, 'LUXURY', 'luxury', 'GA-580175-D', 'oils', 'variable', 252, true, OIL, '5411:- 5412:- 5413:- 5414:500ml'],
  [5250, 'ROYAL CLASS', 'royal-class', 'GA-400066', 'oils', 'variable', 240, true, OIL, seq(5337)],
  [5251, 'APPLE -CINNAMON', 'apple-cinnamon', 'GA-554146', 'oils', 'variable', 205, true, OIL, seq(5259)],
  [5252, 'ENGLISH LAVENDER', 'english-lavender', 'GA-842507', 'oils', 'variable', 220, true, OIL, seq(5369)],
  [5253, 'ALOE VERA-CUCUMBER', 'aloe-vera-cucumber', 'GA-554866-B', 'oils', 'variable', 205, true, OIL, seq(5357)],
  [5254, 'WHITE BEACH', 'white-beach-2', 'GA-343702-D', 'oils', 'variable', 204, true, OIL, seq(5361)],
  [5255, 'GREEN TEA LEMONGRASS', 'green-tea-lemongrass', 'GA-260681-A', 'oils', 'variable', 205, true, OIL, seq(5353)],
  [5256, 'HEAVEN ON EARTH', 'heaven-on-earth', 'GA-507120-D', 'oils', 'variable', 265, true, OIL, seq(5345)],
  [5257, 'BLUE WATERMEN', 'blue-watermen', 'GA-505114-N', 'oils', 'variable', 282, true, OIL, seq(5349)],
  [5258, 'GREEN FIG LEAVES', 'green-fig-leaves', '', 'oils', 'variable', 205, true, OIL, seq(5365)],
  [5373, 'GA-M-H3000', 'ga-m-h3000', '', 'diffusers', 'simple', 1550, true, IMG + 'Untitled-design-2-1.jpg', ''],
  [5374, 'GA-M-H5000', 'ga-m-h5000', '', 'diffusers', 'simple', 2200, true, IMG + 'Untitled-design-3.jpg', ''],
  [5375, 'DROP IN WHITE', 'drop-in-white', 'GA-336270-C', 'oils', 'variable', 273, true, OIL, seq(5376)],
  [5385, 'INTENSE INTEREST', 'intense-interest', 'GA-344158-D', 'oils', 'variable', 253.8, true, OIL, seq(5386)],
  [5390, 'ARABIC COFFEE', 'arabic-coffee', 'GA-701831-A', 'oils', 'variable', 280, true, OIL, seq(5391)],
  [5395, 'FOCUS', 'focus', 'GA-339426-A', 'oils', 'variable', 345, true, OIL, seq(5396)],
  [5400, 'MAINSAIL', 'mainsail', 'GA-701839-B', 'oils', 'variable', 240, true, OIL, seq(5401)],
  [5405, 'YELLOW AMBER', 'yellow-amber', 'GA-502594-A', 'oils', 'variable', 210, true, OIL, '5406:- 5407:- 5408:- 5409:500ml'],
  [5410, 'SCENSE HE', 'scense-he', 'GA-233191', 'oils', 'variable', 230, true, OIL, '5421:- 5422:- 5423:- 5424:500ml'],
  [5425, 'GA-OV-5', 'ga-ov-5', '', 'diffusers', 'simple', 400, true, IMG + 'Screenshot_17-5-2024_163453_.jpeg', ''],
  [5426, 'GA-OV-5 Pro', 'ga-ov-5-pro', '', 'diffusers', 'simple', 0, false, IMG + 'Screenshot_17-5-2024_163453_.jpeg', ''],
  [5427, 'GA-OV-10', 'ga-ov-10', '', 'diffusers', 'simple', 850, true, IMG + 'Screenshot_17-5-2024_164234_.jpeg', ''],
  [5428, 'GA-OV-2', 'ga-ov-2', '', 'diffusers', 'simple', 265, true, IMG + 'Screenshot_17-5-2024_16475_.jpeg', ''],
  [5429, 'GA-G-Air', 'ga-g-air', '', 'diffusers', 'simple', 1200, true, IMG + 'Screenshot_17-5-2024_164826_.jpeg', ''],
  [5430, 'GA-AD-Scent', 'ga-ad-scent', '', 'diffusers', 'simple', 6250, true, IMG + '116.png', ''],
  [5431, 'GA-OV-1', 'ga-ov-1', '', 'diffusers', 'simple', 190, true, IMG + 'Screenshot_17-5-2024_171150_.jpeg', ''],
  [5432, 'OV 3', 'ov-3', '', 'diffusers', 'simple', 350, true, IMG + '14-1.png', ''],
  [5433, 'OV-8', 'ov-8', '', 'diffusers', 'simple', 650, true, IMG + '12-1.png', ''],
  [5434, 'F Air', 'f-air', '', 'diffusers', 'simple', 999, true, IMG + '21.jpg', ''],
  [5437, 'SWEET WISH', 'sweet-wish', 'GA-400066-1', 'oils', 'variable', 255, true, OIL, seq(5438)],
  [5442, 'HIBISCUS PUNCH', 'hibiscus-punch', 'GA-400066-1-1', 'oils', 'variable', 235, true, OIL, seq(5443)],
  [5447, 'GREEN GLOBAL', 'green-global', 'GA-400066-1-2', 'oils', 'variable', 245, true, OIL, v4(5448, 5449, 5450, 5473)],
  [5474, 'ROYAL AMBIENCE', 'royal-ambience', 'GA-400066-1-3', 'oils', 'variable', 215, true, OIL, seq(5475)],
  [5479, 'ADDRESS', 'address', 'GA-400066-1-4', 'oils', 'variable', 290, true, OIL, seq(5480)],
  [5484, 'GREEN TEA BAMBOO', 'green-tea-bamboo', 'GA-400066-1-5', 'oils', 'variable', 225, true, OIL, seq(5485)],
  [5489, 'SIMPLE AMBER', 'simple-amber', 'GA-400066-1-6', 'oils', 'variable', 255, true, OIL, seq(5490)],
  [5494, 'GRAPEFRUITS MANDARIN', 'grapefruits-mandarin', 'GA-400066-1-7', 'oils', 'variable', 210, true, OIL, seq(5495)],
  [5499, 'Rad 0', 'rad-0', '', 'diffusers', 'simple', 0, false, IMG + '13-1.png', ''],
  [5500, 'REED DIFFUSERS & CANDLES', 'reed-diffusers-candles', '', 'diffusers', 'simple', 0, false, IMG + '16.jpg', ''],
  [5501, 'BLACK EARTH', 'black-earth', 'GA-400066-1-8', 'oils', 'variable', 255, true, OIL, v4(5502, 5513, 5514, 5515)],
  [5516, 'FRANGIPANI', 'frangipani', 'GA-400066-1-9', 'oils', 'variable', 255, true, OIL, seq(5517)],
  [5521, 'DROP IN GOLD', 'drop-in-gold', 'GA-400066-1-10', 'oils', 'variable', 210, true, OIL, seq(5522)],
  [5526, 'GOLD FEVER', 'gold-fever', 'GA-400066-1-11', 'oils', 'variable', 210, true, OIL, seq(5527)],
  [5531, 'SMOKY FROST', 'smoky-frost', 'GA-400066-1-12', 'oils', 'simple', 275, true, OIL, ''],
  [5532, 'FOUR SEASONS', 'four-seasons', 'GA-400066-1-13', 'oils', 'variable', 210, true, OIL, seq(5533)],
  [5537, 'AQUA ROSE', 'aqua-rose', 'GA-400066-1-14', 'oils', 'variable', 210, true, OIL, seq(5538)],
  [5542, 'GLOBAL SHADES', 'global-shades', 'GA-400066-1-15', 'oils', 'variable', 210, true, OIL, v4(5550, 5551, 5552, 5553)],
];

/** Variations read individually during the audit; only these get direct cart links. */
const VERIFIED_VARIATIONS: Record<number, { price: number; purchasable: boolean }> = {
  5263: { price: 0, purchasable: false }, 5292: { price: 237, purchasable: true },
  5391: { price: 0, purchasable: false }, 5394: { price: 280, purchasable: true },
};

const BASE = 'https://globalaroma.me/product/';

export const snapshotMeta: CatalogMeta = {
  source: 'snapshot',
  readAt: '2026-11-27T23:55:00-06:00',
  origin: 'https://globalaroma.me/wp-json/wc/store/v1/products',
  note: 'Manual audit of the public Store API; variation prices other than those listed in VERIFIED_VARIATIONS follow the observed pattern (only 500 ml is priced) and are not used for direct cart links; the store confirms them at checkout. Not synchronised: a dated snapshot. sync.',
};

export const snapshotProducts: Product[] = ROWS.map(([id, name, slug, sku, category, type, price, purchasable, image, vars]) => {
  const variations: Variation[] = vars
    ? vars.split(' ').map((t) => {
        const [vid, vol] = t.split(':');
        const known = VERIFIED_VARIATIONS[+vid];
        // Pattern observed on every variation read: only the 500 ml option carries the price.
        const is500 = vol === '500ml';
        return {
          id: +vid,
          volume: vol === '-' ? null : vol.replace('ml', ' ml'),
          price: known ? known.price : is500 ? price : 0,
          purchasable: known ? known.purchasable : is500,
          verified: !!known,
        };
      })
    : [];
  return {
    id, name, slug, sku: sku || null, category, type,
    price: purchasable && price > 0 ? price : null,
    currency: 'AED',
    purchasable: purchasable && price > 0,
    inStock: true,
    image,
    permalink: `${BASE}${slug}/`,
    variations,
  };
});
