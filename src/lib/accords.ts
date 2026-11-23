/**
 * Note → accord classification. A small, readable rule table: each accord
 * lists the words that identify it. A note can match more than one accord
 * (e.g. "pink pepper" is spicy; "orange blossom" is floral, not citrus:
 * longer, more specific keys are tried first).
 */
export type Accord =
  | 'citrus' | 'green' | 'marine' | 'fruity' | 'floral'
  | 'musk' | 'spicy' | 'woody' | 'amber' | 'gourmand';

export const ACCORDS: Accord[] = ['citrus', 'green', 'marine', 'fruity', 'floral', 'musk', 'spicy', 'woody', 'amber', 'gourmand'];

/** Dry-pigment colours, tuned to read on limestone paper and on ink. */
export const PIGMENT: Record<Accord, string> = {
  citrus: '#C99A1E',
  green: '#5E7A3A',
  marine: '#2F6F8A',
  fruity: '#C0573F',
  floral: '#B4567A',
  musk: '#8C857B',
  spicy: '#A2452A',
  woody: '#6E4E33',
  amber: '#9A5A1C',
  gourmand: '#7A4A2E',
};

export const ACCORD_LABEL: Record<Accord, string> = {
  citrus: 'Citrus', green: 'Green', marine: 'Marine', fruity: 'Fruity', floral: 'Floral',
  musk: 'Musk', spicy: 'Spicy', woody: 'Woody', amber: 'Amber & resin', gourmand: 'Gourmand',
};

// Order matters only for multi-word specifics, checked before single words.
const RULES: [string, Accord][] = [
  ['orange blossom', 'floral'], ['cherry blossom', 'floral'], ['lily of the valley', 'floral'], ['ginger flower', 'floral'],
  ['lotus wood', 'woody'], ['cashmere wood', 'woody'], ['guaiac', 'woody'], ['pink pepper', 'spicy'], ['pink cedar', 'woody'],
  ['violet leaves', 'green'], ['green leaves', 'green'], ['fig leaves', 'green'], ['geranium leaves', 'green'], ['fir needle', 'green'],
  ['tree moss', 'woody'], ['oakmoss', 'woody'], ['mossy', 'woody'], ['moss', 'woody'], ['water lotus', 'marine'],
  ['white flowers', 'floral'], ['tobacco flower', 'amber'], ['sugar cane', 'gourmand'], ['fig milk', 'gourmand'], ['coffee', 'gourmand'],
  ['gingerbread', 'gourmand'], ['tea', 'green'], ['amberwood', 'amber'], ['ambergris', 'amber'], ['muskwood', 'musk'],
  // single words
  ['lemongrass', 'citrus'], ['lemon', 'citrus'], ['bergamot', 'citrus'], ['mandarin', 'citrus'], ['orange', 'citrus'], ['grapefruit', 'citrus'],
  ['tangerine', 'citrus'], ['lime', 'citrus'], ['neroli', 'citrus'], ['petitgrain', 'citrus'], ['citrus', 'citrus'],
  ['green', 'green'], ['cucumber', 'green'], ['basil', 'green'], ['eucalyptus', 'green'], ['rosemary', 'green'], ['herbal', 'green'],
  ['aromatic', 'green'], ['juniper', 'green'], ['cypress', 'green'], ['mugwort', 'green'], ['wormwood', 'green'], ['sage', 'green'],
  ['anise', 'green'], ['rhubarb', 'green'], ['fig', 'green'], ['lavender', 'green'], ['lavandin', 'green'], ['aldehydes', 'musk'],
  ['marine', 'marine'], ['watery', 'marine'], ['calone', 'marine'], ['aquatic', 'marine'],
  ['peach', 'fruity'], ['apple', 'fruity'], ['pear', 'fruity'], ['pineapple', 'fruity'], ['raspberry', 'fruity'], ['cassis', 'fruity'],
  ['plum', 'fruity'], ['apricot', 'fruity'], ['fruit', 'fruity'], ['coconut', 'fruity'], ['davana', 'fruity'],
  ['rose', 'floral'], ['jasmine', 'floral'], ['muguet', 'floral'], ['lily', 'floral'], ['ylang', 'floral'], ['tuberose', 'floral'],
  ['frangipani', 'floral'], ['gardenia', 'floral'], ['peony', 'floral'], ['magnolia', 'floral'], ['freesia', 'floral'], ['iris', 'floral'],
  ['orris', 'floral'], ['violet', 'floral'], ['geranium', 'floral'], ['osmanthus', 'floral'], ['hibiscus', 'floral'], ['honeysuckle', 'floral'],
  ['hyacinth', 'floral'], ['carnation', 'floral'], ['cyclamen', 'floral'], ['heliotrope', 'floral'], ['orchid', 'floral'], ['lotus', 'floral'],
  ['clover', 'floral'], ['hedione', 'floral'], ['floral', 'floral'], ['blossom', 'floral'],
  ['musk', 'musk'], ['powdery', 'musk'],
  ['pepper', 'spicy'], ['cinnamon', 'spicy'], ['cardamom', 'spicy'], ['clove', 'spicy'], ['saffron', 'spicy'], ['ginger', 'spicy'],
  ['nutmeg', 'spicy'], ['turmeric', 'spicy'], ['coriander', 'spicy'], ['bay', 'spicy'], ['spicy', 'spicy'], ['elemi', 'spicy'], ['peppercorn', 'spicy'],
  ['cedar', 'woody'], ['sandal', 'woody'], ['vetiver', 'woody'], ['patchouli', 'woody'], ['oud', 'woody'], ['agarwood', 'woody'],
  ['birch', 'woody'], ['cypriol', 'woody'], ['nagarmotha', 'woody'], ['wood', 'woody'], ['truffle', 'woody'],
  ['amber', 'amber'], ['benzoin', 'amber'], ['labdanum', 'amber'], ['tolu', 'amber'], ['balsam', 'amber'], ['incense', 'amber'],
  ['olibanum', 'amber'], ['leather', 'amber'], ['tobacco', 'amber'], ['castoreum', 'amber'],
  ['vanilla', 'gourmand'], ['caramel', 'gourmand'], ['chocolate', 'gourmand'], ['cacao', 'gourmand'], ['almond', 'gourmand'],
  ['praline', 'gourmand'], ['tonka', 'gourmand'], ['cookie', 'gourmand'], ['gingerbread', 'gourmand'], ['biscuit', 'gourmand'],
  ['meringue', 'gourmand'], ['milky', 'gourmand'], ['creamy', 'gourmand'], ['nougat', 'gourmand'], ['nut', 'gourmand'], ['sweet', 'gourmand'],
  ['dry fruits', 'fruity'],
];

export function accordOf(note: string): Accord {
  const n = note.toLowerCase();
  for (const [key, acc] of RULES) if (n.includes(key)) return acc;
  return 'musk';
}

/** Warmth (−1 fresh … +1 warm) and depth (0 light … 1 deep) contributed by each accord. */
export const WARMTH: Record<Accord, number> = {
  citrus: -1, green: -0.85, marine: -1, fruity: -0.35, floral: -0.05, musk: 0.1, spicy: 0.55, woody: 0.6, amber: 1, gourmand: 0.85,
};
export const DEPTH: Record<Accord, number> = {
  citrus: 0.02, green: 0.12, marine: 0.06, fruity: 0.2, floral: 0.35, musk: 0.42, spicy: 0.55, woody: 0.75, amber: 0.95, gourmand: 0.78,
};
