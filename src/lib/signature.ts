/**
 * Scent signatures: a fragrance drawn as contour lines.
 *
 * Inner rings are the base notes, the middle rings the heart, the outer rings
 * the top notes, one closed line per note, coloured by its accord. Each ring's
 * centre drifts a little further in one direction than the last, so the
 * figure trails like a scent moving through a room (its sillage). Spicy
 * scents get finer ripples; deep scents swell more; fresh scents stay calm.
 *
 * Pure and deterministic: the same scent draws the same figure on the site,
 * in /sig/<slug>.svg, and in every social template.
 */
import { accordOf, PIGMENT, type Accord } from './accords';
import { hash, mulberry32 } from './prng';

export interface SignatureInput {
  name: string;
  top: string[];
  heart: string[];
  base: string[];
  accords?: Partial<Record<Accord, number>>;
  depth?: number;
}

export interface SignatureOptions {
  size?: number;
  /** 'pigment' (default) colours each line by accord; 'ink' draws everything in one colour. */
  mode?: 'pigment' | 'ink';
  ink?: string;
  background?: string | null;
  stroke?: number;
  /** Time in seconds, for gentle animation (0 = still). */
  t?: number;
  /** Line width in CSS px when strokes do not scale (default 1.15). */
  hairline?: number;
  /** Draw the release point at the centre. */
  source?: boolean;
}

export interface Ring {
  d: string;
  color: string;
  width: number;
  layer: 'base' | 'heart' | 'top';
}

const TAU = Math.PI * 2;

function smoothClosedPath(pts: [number, number][]): string {
  // Catmull-Rom → cubic Bézier, closed.
  const n = pts.length;
  const f = (v: number) => (Math.round(v * 10) / 10).toString();
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}

export function signatureRings(s: SignatureInput, opts: SignatureOptions = {}): Ring[] {
  const size = opts.size ?? 400;
  const t = opts.t ?? 0;
  const rnd = mulberry32(hash(s.name));
  const cx = size / 2, cy = size / 2;
  const unit = size / 400;

  const notes = { base: s.base, heart: s.heart, top: s.top };
  const all = [...s.top, ...s.heart, ...s.base];
  const accs = all.map(accordOf);
  const share = (a: Accord) => accs.filter((x) => x === a).length / Math.max(1, accs.length);
  const spice = share('spicy') + share('citrus') * 0.4;
  const deep = s.depth ?? share('amber') + share('woody') * 0.8 + share('gourmand') * 0.6;
  const fresh = share('citrus') + share('green') + share('marine');

  const floral = share('floral') + share('fruity') * 0.5;
  const sweet = share('gourmand');

  // Wind: the direction the scent drifts. Fresh scents travel further.
  const wind = rnd() * TAU;
  const drift = 0.2 + rnd() * 0.1 + fresh * 0.14;
  const stretch = 0.05 + fresh * 0.16;

  // Shared low harmonics keep rings coherent (contours, not scribbles).
  const a2 = (0.04 + deep * 0.07) * (0.6 + rnd() * 0.8);
  const a3 = (0.025 + deep * 0.05 - sweet * 0.02) * (0.5 + rnd());
  const k4 = floral > 0.3 ? 5 : 4;
  const a4 = floral * 0.05 * (0.6 + rnd() * 0.8);
  const p2 = rnd() * TAU, p3 = rnd() * TAU, p4 = rnd() * TAU;
  const hiK = 7 + Math.floor(rnd() * 5);
  const hiA = (0.003 + spice * 0.05) * (0.7 + rnd() * 0.6);
  const hiP = rnd() * TAU;

  const ranges = { base: [18, 92], heart: [104, 140], top: [152, 176] } as const;
  type Raw = { pts: [number, number][]; note: string; layer: Ring['layer'] };
  const raw: Raw[] = [];
  (['base', 'heart', 'top'] as const).forEach((layer, li) => {
    const list = notes[layer].slice(0, 7);
    const count = Math.max(1, list.length);
    const [r0, r1] = ranges[layer];
    for (let j = 0; j < count; j++) {
      const note = list[j] ?? s.name;
      const R = count === 1 ? (r0 + r1) / 2 : r0 + ((r1 - r0) * j) / (count - 1);
      const k = R / 176;
      const ox = Math.cos(wind) * drift * R;
      const oy = Math.sin(wind) * drift * R;
      const twist = (li * 3 + j) * 0.2 + t * 0.12;
      const N = 44;
      const pts: [number, number][] = [];
      for (let i = 0; i < N; i++) {
        const th = (i / N) * TAU;
        let m = 1 + stretch * k * Math.cos(th - wind);
        m += a2 * k * Math.sin(2 * th + p2 + twist * 0.5);
        m += a3 * Math.sin(3 * th + p3 - twist * 0.35);
        m += a4 * k * Math.sin(k4 * th + p4 + twist * 0.25);
        m += hiA * k * Math.sin(hiK * th + hiP + twist);
        const r = R * m;
        pts.push([ox + Math.cos(th) * r, oy + Math.sin(th) * r]);
      }
      raw.push({ pts, note, layer });
    }
  });

  // Fit the whole figure into the frame (with margin); the release point moves with it.
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of raw) for (const [x, y] of r.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const pad = size * 0.06;
  const sc = Math.min((size - pad * 2) / (x1 - x0), (size - pad * 2) / (y1 - y0));
  const tx = cx - ((x0 + x1) / 2) * sc, ty = cy - ((y0 + y1) / 2) * sc;
  lastOrigin = [tx, ty];

  return raw.map(({ pts, note, layer }) => ({
    d: smoothClosedPath(pts.map(([x, y]) => [x * sc + tx, y * sc + ty])),
    color: opts.mode === 'ink' ? opts.ink ?? '#1A1714' : PIGMENT[accordOf(note)],
    width: (opts.stroke ?? 1.35) * unit * (layer === 'base' ? 1.2 : layer === 'heart' ? 1.0 : 0.85),
    layer,
  }));
}

/** The release point of the last figure drawn (where the scent leaves the diffuser). */
let lastOrigin: [number, number] = [200, 200];
export function signatureOrigin() { return lastOrigin; }

export function signatureSVG(s: SignatureInput, opts: SignatureOptions = {}): string {
  const size = opts.size ?? 400;
  const rings = signatureRings(s, opts);
  const bg = opts.background ? `<rect width="${size}" height="${size}" fill="${opts.background}"/>` : '';
  const [ox, oy] = signatureOrigin();
  const src = opts.source === false ? '' : `<circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="${(2.8 * size) / 400}" fill="${opts.ink ?? '#1A1714'}"/>`;
  // Non-scaling strokes keep the 1px line language at every size, from a 56px thumbnail to a poster.
  const k = opts.hairline ?? 1.15;
  const paths = rings.map((r) => `<path d="${r.d}" stroke="${r.color}" stroke-width="${((r.width / ((opts.stroke ?? 1.35) * size / 400)) * k).toFixed(2)}" vector-effect="non-scaling-stroke"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${bg}<g fill="none" stroke-linejoin="round">${paths}</g>${src}</svg>`;
}
