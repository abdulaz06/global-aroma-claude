/**
 * The hero field: one set of drifting contour lines, three of them drawn in
 * the division colours. The same function draws the static SVG (server, no-JS,
 * reduced motion) and every animated canvas frame, so the two never differ.
 */
export interface FieldLine { pts: [number, number][]; accent: number }
export interface FieldOpts { w: number; h: number; n?: number; t?: number; px?: number; py?: number; pull?: number }

export const FIELD_ACCENTS = ['#b4612a', '#3e5c50', '#3149b0'];

export function field({ w, h, n = 26, t = 0, px = -1, py = -1, pull = 0 }: FieldOpts): FieldLine[] {
  const lines: FieldLine[] = [];
  const steps = Math.max(32, Math.round(w / 22));
  const accentAt = new Map([[Math.round(n * 0.38), 0], [Math.round(n * 0.55), 1], [Math.round(n * 0.72), 2]]);
  for (let i = 0; i < n; i++) {
    const s = i / (n - 1);
    // Lines gather into a band that rises left to right, like air pulled through a room.
    const base = h * (0.18 + 0.78 * s);
    const pts: [number, number][] = [];
    for (let k = 0; k <= steps; k++) {
      const x = (k / steps) * w;
      const u = x / w;
      const gather = Math.exp(-Math.pow((s - 0.55 + (u - 0.5) * 0.35) * 2.6, 2));
      let y = base
        - gather * h * 0.16 * Math.sin(u * 3.1 + t * 0.21 + s * 1.3)
        + Math.sin(u * 5.3 - t * 0.33 + s * 4.1) * h * 0.022
        + Math.sin(u * 11.7 + t * 0.47 - s * 7.0) * h * 0.006
        - (u - 0.5) * h * 0.18 * gather;
      if (pull > 0 && px >= 0) {
        const dx = x - px, dy = y - py, d2 = dx * dx + dy * dy, r = Math.min(w, h) * 0.22;
        if (d2 < r * r * 4) y += (dy / Math.sqrt(d2 + 1)) * pull * Math.exp(-d2 / (r * r)) * r * 0.22;
      }
      pts.push([x, y]);
    }
    lines.push({ pts, accent: accentAt.has(i) ? accentAt.get(i)! : -1 });
  }
  return lines;
}

export function fieldSVG(w: number, h: number, n = 26): string {
  const f = (v: number) => (Math.round(v * 10) / 10).toString();
  const paths = field({ w, h, n }).map((l) => {
    const d = l.pts.map((p, i) => (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1])).join('');
    return l.accent >= 0
      ? `<path d="${d}" stroke="${FIELD_ACCENTS[l.accent]}" stroke-width="1.6"/>`
      : `<path d="${d}" stroke="#1a1714" stroke-opacity="0.32" stroke-width="1"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">${paths}</svg>`;
}
