/**
 * The Global Aroma scent collection, as published on
 * https://globalaroma.me/scent-collection/ (read 23 Nov 2026): name, family,
 * top / heart / base notes and mood words, in the site's order.
 *
 * Names are kept exactly as published, including spellings the owner may want
 * to correct (see docs/06-owner-approvals.md). One third-party trademark in a
 * note list has been generalised ("black orchid accord").
 *
 * Format: NAME | FAMILY | top | heart | base | mood   (lists comma-separated)
 */
const RAW = `
LAVEXTER JNT ED | Floral Spicy | lemon, lavender, geranium | lavender, benzoin, tolu balsam | vanilla, tonka bean | sharp, invigorating, clean, uplifting
WOODWALL ED | Oriental | lemon, cinnamon | patchouli, cedarwood, labdanum, benzoin | patchouli, vetiver, tobacco, tonka bean, musk, vanilla | warm, decadent, cozy
SUN SNOW ED | Marine | lemon, bergamot | white flowers, Turkish rose | musk, benzoin, labdanum, vanilla, powdery notes | cool, fresh, crisp
VANIBUKET ED | Oriental | agarwood | rose, saffron | sandalwood, amber, vanilla, sugar cane | warm, rich, lavish, sweet
NARAMBREE ED | Oriental | mandarin, lemon | frangipani, jasmine, ylang-ylang | cedarwood, sweet notes, musk, amber | powdery, musky, clean, uplifting
PATCHULOR ED | Woody | patchouli | patchouli, saffron | amber | warm, spicy
CAKENILLA | Foody | buttery-milky notes, almond | meringue, caramel, creamy notes | Madagascar vanilla, sweet musk | delicious, nostalgic
MAJESTIC FLOWER JNT ED | Floral | pineapple, green notes | muguet, jasmine, ginger flower | rose, floral notes | sweet, spicy, tropical, fresh
AVENCOS FORTE | Oriental | mandarin, black pepper | muguet, iris, clove | cashmere wood, cedarwood, sandalwood, tonka bean, musk | soft, exotic, spicy
VETYOLAS | Oriental | mandarin, black pepper | muguet, iris, clove | cashmere wood, cedarwood, sandalwood, tonka bean, musk | soft, exotic, spicy
GABRIANEL ED | Floral Woody | exotic fruits, citrus | jasmine, rose, tuberose, ylang ylang, violet | sandalwood, woody notes, bourbon vanilla, amber, white musk | velvety, uplifting, soothing
SAKURIO ED | Floral Woody | Japanese cherry blossom, rose, ylang ylang | jasmine, geranium, lily of the valley | cedarwood, amber, powdery musk | powdery, clean, refreshing
ROMARO ED | Green Woody | anise, eucalyptus, aromatic notes | rose, jasmine, marine notes | patchouli, cedarwood, musk | cleansing, deep, marine
SPLENDERUS AF | Oriental Fruity | peach, cinnamon, pepper, pear | tuberose, jasmine | vanilla, white musk, benzoin | creamy, comforting, luxurious
TOMWOOD ED | Oriental | pepper, cardamom | agarwood, sandalwood, vetiver | tonka bean, vanilla, amber | woody, warm, luxurious
MAREXY ED | Citrus Floral | bergamot, apple, lemon | jasmine, orange blossom, lily of the valley | cedarwood, white musk, amber | light-hearted, cheerful
HIBISCUS PASSION | Citrus Floral | bergamot, lemon, grapefruit | orange blossom, hibiscus flower, jasmine, freesia, muguet | amber, musk | sweet, uplifting, refreshing
DAMASUD ED | Oriental | saffron, incense, white pepper | agarwood, cedarwood, guaiac wood | vetiver, amber, cashmere wood | luxurious, enchanting, warm
ROSE MELEXI ED | Citrus Woody | grapefruit, orange | pepper, pink pepper, geranium | cedarwood, vetiver, patchouli | energizing, spicy, intense
TOUCH ME | Floral Woody | saffron | rose | cedarwood | sensuous, elegant, sophisticated
LUTECIA TFR | Floral Musky | violet leaves, green leaves | rose, violet blooms | musk | soothing, creamy, light-hearted
SHAYA SOUD | Woody Arabic | lemon, aldehydes | coconut, rose | patchouli, oud | sensuous, free-spirited, earthy
SMOOTH | Floral Woody | bergamot | jasmine, rose | patchouli, musk | fresh, gentle, soothing
COBALT | Citrus Woody | lemon, hyacinth | jasmine, tart apple | cedarwood, musk | bright, refreshing, romantic
TERRITORY | Woody Spicy | lemon, pepper | hedione, cedarwood | patchouli, musk | uplifting, spicy, luxurious
ELISA ED | Oriental | lemon, mandarin, neroli | jasmine, ylang-ylang, tuberose, rose, cyclamen | cedarwood, patchouli, amber, musk | complex, sumptuous, comforting
BYROSE ED | Floral Woody | raspberry, Turkish rose | rose absolute, jasmine, nagarmotha | agarwood, patchouli, woody notes, fruity musk | rich, enchanting
TERES ED | Citrus Woody | grapefruit, orange | pepper, pink pepper, geranium | cedarwood, vetiver, patchouli | energizing, spicy
AVENTEM ED | Citrus Fruity | bergamot, apple, pineapple, herbal notes, cassis | pink pepper, birch, patchouli, jasmine | amber, vanilla, mossy notes, musk | warm, woody, comforting
BACARAT ED | Floral | jasmine | amber | mossy notes, cedarwood | sensual
MAREXY ED | Citrus Fruity | bergamot, lemon, apple | jasmine, orange blossom, lily of the valley | cedarwood, white musk, amber | light, rich, sunny
NARCO ED | Citrus Fruity | bergamot, peach, lemon | jasmine, peony, orange blossom | musk, amber, mossy notes | graceful, rich, transparent
GREEN TEA VERDOSA ED | Citrus Herbal | bergamot, petitgrain, green tea | magnolia, rose, jasmine, osmanthus, peony, green notes | dry woody notes, white musk | tranquil, refreshing
QUEEN OF ROSES | Chypre Floral | cassis, pear, osmanthus | orange blossom, jasmine, apricot | amber, cashmere wood, white musk, vanilla |
LEGENDARY BLACK DIAMONDS | Oriental Floral | davana, cinnamon | orris, violet, cashmere wood | patchouli, chocolate, benzoin, olibanum, leather |
LEATHER BOUQUET | Oriental Woody | mandarin, violet leaves, saffron, elemi | leather, tobacco, dry fruits, sandalwood, vetiver, patchouli, oud | amberwood, tonka, vanilla, benzoin |
PARADISE LAND | Floral Woody | orange, bergamot, lavender, anise, rose | jasmine, lily, black pepper, coriander, ginger | cedarwood, guaiac wood, white musk, heliotrope, vanilla, amber |
WHITE BEACH | Oriental Floral | bergamot, tangerine, orange, pineapple, jasmine | cardamom, jasmine, rose, lily, creamy notes, vanilla | vanilla, benzoin, patchouli leaves, sandalwood, cedar |
DEEP GREEN | Oriental Woody | bergamot, cinnamon, nutmeg, geranium, petitgrain | cypriol, olibanum, leather, saffron, ginger | musk, oud, amber, tonka bean |
ROYAL RESIDENCE | Oriental Woody | gardenia, cardamom, bergamot | saffron, turmeric, geranium, leather | amber, oud, vanilla, patchouli |
GINGER EARTH | Wood Mix Floral | bergamot, orange, apple, ginger, cardamom | muguet, jasmine, tea, cedarwood, patchouli, sandalwood | woody notes, amber, musk, vanilla, tonka |
ROYAL FLOWER | Oriental Woody | bergamot, mandarin, black gardenia, jasmine, ylang ylang | spicy floral orchid, black orchid accord, lotus wood | patchouli, sandalwood, incense, vanilla |
SULTAN OF DECENCY | Oriental Woody | bergamot, basil, lavender, apple, pineapple | geranium, orange blossom, jasmine, cinnamon, clove bud, saffron | patchouli, cedarwood, sandalwood, oakmoss, musk, vanilla, tonka bean, heliotrope |
GINGER BLOSSOM | Flower Mix Spicy | orange, bergamot, ginger, cardamom | jasmine, tea | sandalwood, musk, amber |
GINGERBREAD DELIGHT | Gourmand | gingerbread, caramel | cookie, nut | vanilla, musk |
BLACK TEA ACCORD | Citrus Woody | tea, davana, bergamot | rose, bay, clove, saffron | patchouli, vetiver, cedarwood, musk, amber |
ROYAL CLASS | Chypre Spicy | magnolia, cyclamen, bergamot, mandarin, mugwort, wormwood, lavender | jasmine, peony, violet, carnation, clove | cedar, patchouli, musk, leather, vanilla, tonka |
AQUATIC LADY | Flower Mix Watery | green notes, watery notes, lemon, bergamot, orange, juniper, geranium | marine notes, raspberry, violet, muguet, rose, jasmine, orris | musk, amber, sandalwood, cedar |
HEAVEN ON EARTH | Wood Mix Floral | bitter orange, grapefruit, bergamot, pink peppercorn, pepper, juniper berry, clary sage | geranium leaves, cedarwood | amber, vetiver, patchouli, musk, benzoin, castoreum, oakmoss, tree moss |
WHITE TEA | Green Fruity | tea, tangerine, orange, grapefruit | plum, rose, muguet, lily, osmanthus | floral notes, fruity notes |
FRANGIPANI | Flower Mix Fruity | mandarin, orange, bergamot | frangipani, jasmine, orange blossom, geranium | musk, vanilla, cedar |
GREEN TEA LEMONGRASS | Lemongrass | lemongrass, lemon, eucalyptus | lemongrass, geranium, tea | lemongrass, guaiac wood |
ALOE VERA-CUCUMBER | Green Citrusy | bergamot, lemon, lemongrass, fir needle, cucumber | honeysuckle, orris, rose, lily, hyacinth, carnation, peach | floral notes, musk, powdery notes |
DARKNESS | Oriental Woody | nagarmotha, olibanum, truffle, saffron, cinnamon, geranium | rose, jasmine, patchouli | patchouli, oud, musk, vanilla, moss |
GREEN FIG LEAVES | Green Citrusy | green tea, fig leaves, grapefruit, rhubarb | fig leaves, peony, magnolia, jasmine, green fig, yellow plum | fig wood, pink cedar, vetiver, nougat, fig milk |
ENGLISH LAVENDER | Lavender Fruity | lavandin, geranium, rosemary, eucalyptus, green fruity notes | lavandin, herbal notes, patchouli, cedarwood, plum | floral notes, woody notes, musk |
APPLE-CINNAMON | Fruit Mix Spicy | fruity notes, spicy notes | cinnamon | cinnamon, sweet notes |
GOLDEN HOUDINI | Oriental Floral | lemon, orange, peach | jasmine, heliotrope, iris, lily of the valley, rose | vanilla, musk, praline, amber, tonka bean, sandalwood, cedarwood |
DROP IN WHITE | Floral Fruity | bergamot, honeysuckle, neroli, green notes | jasmine sambac, magnolia, rose | musk, vanilla, ambergris, sandalwood |
GREEN CITY | Chypre Citrusy | bergamot, green mandarin, green pepper, cardamom, rosemary | juniper berry, cypress, violet, calone | muskwood, olibanum, green moss |
MAGISTIC LOTUS | Floral Fruity | exotic fruits, almond, orange | geranium, lotus flower, orange blossom, tonka bean | cacao, sandalwood, vanilla, musk, amber |
VANILA LEVENDER | Lavender Floral | lavender, rosemary, eucalyptus | lavender blossom, rose, lily of the valley, vanilla | lavender, woody notes, balsamic notes, vanilla, caramel, almond, coconut |
ARABIC COFFEE | Oriental Spicy | cardamom, clove | coffee bean, biscuit | cedarwood, sandalwood, white musk |
MAF SIGNATURE | Flower Mix | freesia, fir needle, lime | cherry blossom, lily, clover, cardamom | musk, tonka bean, ambergris, guaiac wood, sandalwood |
MAINSAIL | Fougère Herbal | green apple, violet leaves | water lotus, honeysuckle | cedarwood, white musk, dry amber |
YELLOW AMBER | Oriental | elemi, cedar | carnation, davana, cinnamon, cashmere wood, patchouli | musk, vanilla, tonka bean, tobacco flower, amber |
SCENSE HE | Citrus Floral | lemon, orange, lavender, apple, pineapple | jasmine, lily of the valley, magnolia, rose, gardenia | musk, sandalwood, patchouli, amber |
`;

/** Library names that are also sold in the online store, with the store's listed price (AED). */
export const storeOils: Record<string, { url: string; price: number }> = {
  'FRANGIPANI': { url: 'https://globalaroma.me/product/frangipani/', price: 255 },
  'WHITE BEACH': { url: 'https://globalaroma.me/product/white-beach/', price: 285 },
  'PARADISE LAND': { url: 'https://globalaroma.me/product/paradise-land/', price: 204.42 },
  'ROYAL RESIDENCE': { url: 'https://globalaroma.me/product/royal-residence/', price: 301 },
  'LEATHER BOUQUET': { url: 'https://globalaroma.me/product/leather-bouquet/', price: 248.4 },
  'WHITE TEA': { url: 'https://globalaroma.me/product/white-tea/', price: 207 },
  'GINGER EARTH': { url: 'https://globalaroma.me/product/ginger-earth/', price: 205 },
  'ROYAL FLOWER': { url: 'https://globalaroma.me/product/royal-flower/', price: 305 },
  'SULTAN OF DECENCY': { url: 'https://globalaroma.me/product/sultan-of-decency/', price: 345 },
  'GINGER BLOSSOM': { url: 'https://globalaroma.me/product/ginger-blossom/', price: 205 },
  'GINGERBREAD DELIGHT': { url: 'https://globalaroma.me/product/gingerbread-delight/', price: 205 },
  'ROYAL CLASS': { url: 'https://globalaroma.me/product/royal-class/', price: 240 },
  'HEAVEN ON EARTH': { url: 'https://globalaroma.me/product/heaven-on-earth/', price: 265 },
  'GREEN TEA LEMONGRASS': { url: 'https://globalaroma.me/product/green-tea-lemongrass/', price: 205 },
  'ALOE VERA-CUCUMBER': { url: 'https://globalaroma.me/product/aloe-vera-cucumber/', price: 205 },
  'GREEN FIG LEAVES': { url: 'https://globalaroma.me/product/green-fig-leaves/', price: 205 },
  'ENGLISH LAVENDER': { url: 'https://globalaroma.me/product/english-lavender/', price: 220 },
  'APPLE-CINNAMON': { url: 'https://globalaroma.me/product/apple-cinnamon/', price: 205 },
  'DROP IN WHITE': { url: 'https://globalaroma.me/product/drop-in-white/', price: 273 },
  'ARABIC COFFEE': { url: 'https://globalaroma.me/product/arabic-coffee/', price: 280 },
  'MAINSAIL': { url: 'https://globalaroma.me/product/mainsail/', price: 240 },
  'YELLOW AMBER': { url: 'https://globalaroma.me/product/yellow-amber/', price: 210 },
  'SCENSE HE': { url: 'https://globalaroma.me/product/scense-he/', price: 230 },
};

/** Oils sold in the store that are not in the published collection (no note data on the collection page). */
export const storeOnlyOils: { name: string; url: string; price: number }[] = [
  ['GLOBAL SHADES', 'global-shades', 210], ['AQUA ROSE', 'aqua-rose', 210], ['FOUR SEASONS', 'four-seasons', 210],
  ['SMOKY FROST', 'smoky-frost', 275], ['GOLD FEVER', 'gold-fever', 210], ['DROP IN GOLD', 'drop-in-gold', 210],
  ['BLACK EARTH', 'black-earth', 255], ['GRAPEFRUITS MANDARIN', 'grapefruits-mandarin', 210], ['SIMPLE AMBER', 'simple-amber', 255],
  ['GREEN TEA BAMBOO', 'green-tea-bamboo', 225], ['ADDRESS', 'address', 290], ['ROYAL AMBIENCE', 'royal-ambience', 215],
  ['GREEN GLOBAL', 'green-global', 245], ['HIBISCUS PUNCH', 'hibiscus-punch', 235], ['SWEET WISH', 'sweet-wish', 255],
  ['FOCUS', 'focus', 345], ['INTENSE INTEREST', 'intense-interest', 253.8], ['BLUE WATERMEN', 'blue-watermen', 282],
  ['LUXURY', 'luxury', 252], ['REASON TO HAVE', 'reason-to-have', 273], ['FOR YOU', 'for-you', 281],
  ['FAMOUS OUD', 'famous-oud', 329], ['SWEET CATCH', 'sweet-catch', 276], ['FRENCH OPEN', 'french-open', 237],
].map(([name, slug, price]) => ({ name: name as string, url: `https://globalaroma.me/product/${slug}/`, price: price as number }));

export interface RawScent {
  name: string;
  family: string;
  top: string[];
  heart: string[];
  base: string[];
  mood: string[];
}

const list = (s: string | undefined) => (s ?? '').split(',').map((x) => x.trim()).filter(Boolean);

export const rawScents: RawScent[] = RAW.trim()
  .split('\n')
  .map((line) => {
    const [name, family, top, heart, base, mood] = line.split('|').map((x) => x.trim());
    return { name, family, top: list(top), heart: list(heart), base: list(base), mood: list(mood) };
  });
