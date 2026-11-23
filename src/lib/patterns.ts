/**
 * The three division behaviours of the same 1px line.
 *   flow   — Aroma: contours that drift (air, sillage)
 *   weave  — Hospitality: warp and weft (linen, order, care)
 *   signal — Technology: lines that switch state (data, connection)
 * Deterministic SVG strings; used on the site and in social templates.
 */
import { hash, mulberry32 } from './prng';

export type Behaviour = 'flow' | 'weave' | 'signal';

interface Opts {
  w?: number;
  h?: number;
  lines?: number;
  seed?: string;
  stroke?: string;
  accent?: string;
  /** index of the line drawn in the accent colour (−1 for none) */
  accentLine?: number;
  width?: number;
}

const f = (v: number) => (Math.round(v * 10) / 10).toString();

export function flow(o: Opts = {}): string {
  const w = o.w ?? 800, h = o.h ?? 500, n = o.lines ?? 22;
  const r = mulberry32(hash(o.seed ?? 'flow'));
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
  const fq = [1.2 + r() * 0.8, 2.6 + r() * 1.2, 5 + r() * 2];
  const acc = o.accentLine ?? Math.floor(n * 0.62);
  let out = '';
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    // Bunch the lines in the middle band: topographic density.
    const y0 = h * (0.5 + 0.62 * Math.sign(t - 0.5) * Math.pow(Math.abs(t - 0.5) * 2, 1.35) * 0.5) ;
    let d = '';
    const steps = 48;
    for (let s = 0; s <= steps; s++) {
      const x = (s / steps) * w;
      const u = x / w;
      const y = y0
        + Math.sin(u * fq[0] * Math.PI + ph[0] + t * 0.9) * h * 0.11
        + Math.sin(u * fq[1] * Math.PI + ph[1] - t * 1.6) * h * 0.035
        + Math.sin(u * fq[2] * Math.PI + ph[2] + t * 3.1) * h * 0.008;
      d += (s ? 'L' : 'M') + f(x) + ' ' + f(y);
    }
    const isA = i === acc && o.accent;
    out += `<path ${isA ? 'class="acc" pathLength="1"' : ''} d="${d}" stroke="${isA ? o.accent : o.stroke ?? 'currentColor'}" stroke-width="${isA ? (o.width ?? 1) * 1.6 : o.width ?? 1}" ${isA ? '' : 'opacity="0.55"'}/>`;
  }
  return wrap(w, h, out);
}

export function weave(o: Opts = {}): string {
  const w = o.w ?? 800, h = o.h ?? 500, n = o.lines ?? 14;
  const r = mulberry32(hash(o.seed ?? 'weave'));
  const gy = h / (n + 1), cols = Math.round(w / gy), gx = w / cols;
  const acc = o.accentLine ?? Math.floor(n * 0.6);
  const gap = Math.min(gx, gy) * 0.26;
  let out = '';
  // Weft (horizontal): broken where it passes under the warp.
  for (let i = 1; i <= n; i++) {
    const y = i * gy, wob = r() * 6.28;
    let d = '';
    for (let c = 0; c < cols; c++) {
      const xa = c * gx, xb = (c + 1) * gx;
      const under = (c + i) % 2 === 0;
      const x0 = under ? xa + gap : xa, x1 = under ? xb - gap : xb;
      const yy = (x: number) => y + Math.sin(x / w * 9 + wob) * 1.4;
      d += `M${f(x0)} ${f(yy(x0))}L${f((x0 + x1) / 2)} ${f(yy((x0 + x1) / 2))}L${f(x1)} ${f(yy(x1))}`;
    }
    const isA = i === acc && o.accent;
    out += `<path ${isA ? 'class="acc" pathLength="1"' : ''} d="${d}" stroke="${isA ? o.accent : o.stroke ?? 'currentColor'}" stroke-width="${isA ? (o.width ?? 1) * 1.8 : o.width ?? 1}" ${isA ? '' : 'opacity="0.6"'}/>`;
  }
  // Warp (vertical): broken where it passes under the weft.
  let d = '';
  for (let c = 1; c < cols; c++) {
    const x = c * gx;
    for (let i = 0; i <= n; i++) {
      const ya = i * gy, yb = (i + 1) * gy;
      const under = (c + i) % 2 === 1;
      d += `M${f(x)} ${f(under ? ya + gap : ya)}L${f(x)} ${f(under ? yb - gap : yb)}`;
    }
  }
  out += `<path d="${d}" stroke="${o.stroke ?? 'currentColor'}" stroke-width="${o.width ?? 1}" opacity="0.32"/>`;
  return wrap(w, h, out);
}

export function signal(o: Opts = {}): string {
  const w = o.w ?? 800, h = o.h ?? 500, n = o.lines ?? 16;
  const r = mulberry32(hash(o.seed ?? 'signal'));
  const gy = h / (n + 1), cell = gy * 1.2, cols = Math.ceil(w / cell);
  const acc = o.accentLine ?? Math.floor(n * 0.55);
  let out = '';
  for (let i = 1; i <= n; i++) {
    const y = i * gy, amp = gy * 0.42;
    let lvl = 0, d = `M0 ${f(y)}`;
    for (let c = 0; c < cols; c++) {
      const x = c * cell;
      if (r() < 0.24) {
        const next = lvl === 0 ? (r() < 0.5 ? -1 : 1) : 0;
        d += `L${f(x)} ${f(y + lvl * amp)}L${f(x)} ${f(y + next * amp)}`;
        lvl = next;
      }
    }
    d += `L${f(w)} ${f(y + lvl * amp)}`;
    const isA = i === acc && o.accent;
    out += `<path d="${d}" stroke="${isA ? o.accent : o.stroke ?? 'currentColor'}" stroke-width="${isA ? (o.width ?? 1) * 1.6 : o.width ?? 1}" ${isA ? '' : 'opacity="0.55"'}/>`;
    // A pulse that travels along the accent line (animated in CSS where motion is allowed).
    if (isA) out += `<path class="pulse" pathLength="1" d="${d}" stroke="${o.accent}" stroke-width="${(o.width ?? 1) * 3.2}" stroke-dasharray="0.06 0.94" stroke-dashoffset="0.4"/>`;
  }
  return wrap(w, h, out);
}

function wrap(w: number, h: number, inner: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" fill="none" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true" focusable="false">${inner}</svg>`;
}

export function pattern(b: Behaviour, o: Opts = {}) {
  return b === 'flow' ? flow(o) : b === 'weave' ? weave(o) : signal(o);
}
