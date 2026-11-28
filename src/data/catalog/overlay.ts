/**
 * Editorial overlay on the synced catalogue: things the Store API doesn't
 * provide in a usable form. Keyed by WooCommerce product id, so a synced
 * product keeps its overlay even if its price or name changes.
 *
 * - `collection`: the published-collection fragrance whose notes this listing
 *   carries (from the store's own product description, audited 27 Nov 2026).
 *   `match: 'same'` when names agree; `'different'` when the store listing's
 *   notes are those of a differently named collection fragrance (flagged for
 *   the owner, see docs/11-catalogue.md).
 * - `summary`: a short paraphrase of the store's product description.
 * - Products not listed here still appear in the shop with name, price,
 *   image and link; they simply have no notes or signature.
 */
export interface Overlay {
  collection?: string;
  match?: 'same' | 'different';
  notesSource?: 'store-description' | 'collection';
  summary?: string;
  hvac?: boolean;
  flags?: string[];
}

const same = (collection: string, notesSource: Overlay['notesSource'] = 'store-description'): Overlay => ({ collection, match: 'same', notesSource });
const different = (collection: string, flag: string): Overlay => ({ collection, match: 'different', notesSource: 'store-description', flags: [flag] });

export const overlay: Record<number, Overlay> = {
  // Oils whose store description lists notes
  5238: same('paradise-land'), 5239: { ...same('white-beach'), flags: ['Two store listings are named WHITE BEACH (ids 5239 and 5254).'] },
  5240: different('deep-green', 'Store notes match the collection’s Deep Green, not its White Tea.'),
  5241: different('legendary-black-diamonds', 'Store notes match the collection’s Legendary Black Diamonds.'),
  5242: same('leather-bouquet'), 5243: same('royal-residence'), 5244: same('ginger-earth'), 5245: same('royal-flower'),
  5246: same('sultan-of-decency'), 5247: same('ginger-blossom'), 5248: same('gingerbread-delight'),
  5249: different('black-tea-accord', 'Store notes match the collection’s Black Tea Accord.'),
  5250: same('royal-class'), 5251: same('apple-cinnamon'), 5252: same('english-lavender'), 5253: same('aloe-vera-cucumber'),
  5254: different('darkness', 'Second WHITE BEACH listing; its notes match the collection’s Darkness.'),
  5255: same('green-tea-lemongrass'), 5256: same('heaven-on-earth'), 5258: same('green-fig-leaves'),
  5375: same('drop-in-white'),
  5385: different('magistic-lotus', 'Store notes match the collection’s Magistic Lotus.'),
  5390: same('arabic-coffee'),
  5395: different('maf-signature', 'Store notes match the collection’s MAF Signature.'),
  5400: same('mainsail'), 5405: same('yellow-amber'),
  // Empty store description, but the name is in the published collection
  5410: same('scense-he', 'collection'), 5516: same('frangipani', 'collection'),

  // Diffusers: paraphrased from each store description
  5373: { summary: 'Black. Connects with HVAC.', hvac: true },
  5374: { summary: 'Black, with a double refill bottle. Connects with HVAC.', hvac: true },
  5425: { summary: 'Two-fluid cold-air diffusion for a fine, even mist.' },
  5426: { summary: 'Two-fluid cold-air diffusion. No online price.' },
  5427: { summary: 'Anti-corrosive body, designed for higher efficiency at lower energy use.' },
  5428: { summary: 'Portable, with a built-in battery and USB-C.' },
  5429: { summary: 'Floor-standing, for large areas, with a 1,500 ml bottle.' },
  5430: { summary: 'Multi-bottle fragrance system for continuous running.' },
  5431: { summary: 'Compact, with cold-air diffusion, an anti-tilt alarm and a rechargeable battery.' },
  5432: { summary: 'Anti-corrosive shell with manual time and concentration settings; no heat or water.' },
  5433: { summary: 'Cold-air diffusion with HVAC connection, phone control and oil-level detection.', hvac: true },
  5434: { summary: 'Floor-standing two-fluid nebuliser with remote control and oil-level detection.' },
  5499: { summary: 'The smallest battery unit: USB-C, wall-mounted with a lock. No online price.' },
  5500: { summary: 'Reed diffusers and candles, including bespoke brand fragrances. No online price.', flags: ['Listed under Diffusers with no price.'] },
};
