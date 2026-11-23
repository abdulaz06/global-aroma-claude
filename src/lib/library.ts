import { rawScents, storeOils, type RawScent } from '../data/scents';
import { ACCORDS, accordOf, DEPTH, WARMTH, type Accord } from './accords';

export interface Scent extends RawScent {
  slug: string;
  /** Display name: the published name, title-cased, with the house suffixes kept. */
  title: string;
  accords: Record<Accord, number>;
  dominant: Accord[];
  /** Raw character from notes. */
  warmth: number;
  depth: number;
  woodiness: number;
  /** Position on the map, 0..1: x fresh → warm, y floral → woody. */
  x: number;
  y: number;
  store?: { url: string; price: number };
}

const LAYER_WEIGHT = { top: 0.7, heart: 1, base: 1.35 } as const;

function slugify(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function titleCase(s: string) {
  return s
    .toLowerCase()
    .replace(/(^|[\s-])([a-zà-ÿ])/g, (_, p, c) => p + c.toUpperCase())
    .replace(/\b(Ed|Jnt|Af|Tfr|He)\b/g, (m) => m.toUpperCase());
}

function analyse(s: RawScent) {
  const accords = Object.fromEntries(ACCORDS.map((a) => [a, 0])) as Record<Accord, number>;
  let w = 0, d = 0, total = 0;
  (['top', 'heart', 'base'] as const).forEach((layer) => {
    for (const note of s[layer]) {
      const a = accordOf(note);
      const k = LAYER_WEIGHT[layer];
      accords[a] += k;
      w += WARMTH[a] * k;
      d += DEPTH[a] * k;
      total += k;
    }
  });
  // Heavy materials deepen a scent beyond their accord average.
  const all = [...s.top, ...s.heart, ...s.base].join(' ').toLowerCase();
  const heavy = ['oud', 'agarwood', 'leather', 'incense', 'olibanum', 'patchouli', 'tobacco', 'castoreum'].filter((h) => all.includes(h)).length;
  const sum = Object.values(accords).reduce((a, b) => a + b, 0) || 1;
  for (const a of ACCORDS) accords[a] = accords[a] / sum;
  // Second axis of the classic fragrance wheel: floral/soft (−) to woody/dry (+).
  const woodiness = (accords.woody + accords.green * 0.35 + accords.spicy * 0.35 + accords.amber * 0.25)
    - (accords.floral + accords.fruity * 0.6 + accords.musk * 0.35 + accords.gourmand * 0.3);
  const dominant = [...ACCORDS].sort((a, b) => accords[b] - accords[a]).filter((a) => accords[a] > 0).slice(0, 3);
  return { accords, dominant, woodiness, warmth: total ? w / total : 0, depth: (total ? d / total : 0) + heavy * 0.035 };
}

function rankNormalise(values: number[]): number[] {
  const idx = values.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
  const out = new Array(values.length);
  idx.forEach(([, i], r) => (out[i] = values.length > 1 ? r / (values.length - 1) : 0.5));
  return out;
}

function build(): Scent[] {
  const seen = new Map<string, number>();
  const partial = rawScents.map((s) => {
    let slug = slugify(s.name);
    // The collection lists MAREXY ED twice (two families); keep both, distinct URLs.
    if (seen.has(slug)) slug = `${slug}-${slugify(s.family)}`;
    seen.set(slug, 1);
    return { ...s, slug, title: titleCase(s.name), ...analyse(s), store: storeOils[s.name] };
  });
  // Woodiness rises with warmth across the collection; remove most of that
  // shared trend so the two axes say different things and the plane fills.
  {
    const mw = partial.reduce((a, p) => a + p.warmth, 0) / partial.length;
    const mo = partial.reduce((a, p) => a + p.woodiness, 0) / partial.length;
    let cov = 0, vw = 0;
    for (const p of partial) { cov += (p.warmth - mw) * (p.woodiness - mo); vw += (p.warmth - mw) ** 2; }
    const beta = vw ? cov / vw : 0;
    for (const p of partial) p.woodiness -= 0.65 * beta * (p.warmth - mw);
  }
  // Blend rank (even spread) with the raw value (keeps real clusters visible).
  const rw = rankNormalise(partial.map((p) => p.warmth));
  const rd = rankNormalise(partial.map((p) => p.woodiness));
  const minW = Math.min(...partial.map((p) => p.warmth)), maxW = Math.max(...partial.map((p) => p.warmth));
  const minD = Math.min(...partial.map((p) => p.woodiness)), maxD = Math.max(...partial.map((p) => p.woodiness));
  return partial.map((p, i) => ({
    ...p,
    x: 0.55 * rw[i] + 0.45 * ((p.warmth - minW) / (maxW - minW || 1)),
    y: 0.55 * rd[i] + 0.45 * ((p.woodiness - minD) / (maxD - minD || 1)),
  }));
}

export const scents: Scent[] = build();
export const scentBySlug = Object.fromEntries(scents.map((s) => [s.slug, s]));

/** The compact shape shipped to the browser for the map and the brief. */
export function clientScents() {
  return scents.map((s) => ({
    slug: s.slug, title: s.title, family: s.family, top: s.top, heart: s.heart, base: s.base, mood: s.mood,
    dominant: s.dominant, x: +s.x.toFixed(4), y: +s.y.toFixed(4), store: s.store ?? null,
  }));
}
export type ClientScent = ReturnType<typeof clientScents>[number];
