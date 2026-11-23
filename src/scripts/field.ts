/**
 * Animates the hero field on capable devices. The static SVG stays as the
 * fallback: no JS, reduced motion, Save-Data, or low-memory devices never
 * start the canvas (the Sonora rule: still first, then live).
 */
import { field, FIELD_ACCENTS } from '../lib/flowfield';

export function startField(host: HTMLElement, area: HTMLElement = host) {
  const m = (q: string) => matchMedia(q).matches;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (m('(prefers-reduced-motion: reduce)') || nav.connection?.saveData || (nav.deviceMemory && nav.deviceMemory < 4)) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'field-canvas';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0, h = 0, dpr = 1, running = false, visible = true, raf = 0, t0 = performance.now();
  let px = -1, py = -1, pull = 0, target = 0;
  const coarse = m('(pointer: coarse)');

  function size() {
    const r = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  }
  function draw(now: number) {
    const t = (now - t0) / 1000;
    pull += (target - pull) * 0.06;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, w, h);
    const lines = field({ w, h, n: w < 700 ? 20 : 26, t, px, py, pull });
    for (const l of lines) {
      ctx!.beginPath();
      l.pts.forEach(([x, y], i) => (i ? ctx!.lineTo(x, y) : ctx!.moveTo(x, y)));
      if (l.accent >= 0) { ctx!.strokeStyle = FIELD_ACCENTS[l.accent]; ctx!.lineWidth = 1.6; ctx!.globalAlpha = 1; }
      else { ctx!.strokeStyle = '#1a1714'; ctx!.lineWidth = 1; ctx!.globalAlpha = 0.32; }
      ctx!.stroke();
    }
    ctx!.globalAlpha = 1;
  }
  let last = 0;
  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    if (now - last < 33) return; // ~30 fps is plenty for drifting air
    last = now;
    draw(now);
  }
  function setRunning(on: boolean) {
    if (on === running) return;
    running = on;
    if (on) { raf = requestAnimationFrame(loop); } else cancelAnimationFrame(raf);
  }

  size();
  draw(performance.now());
  host.classList.add('live');
  new ResizeObserver(() => { size(); draw(performance.now()); }).observe(host);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; setRunning(visible && !document.hidden); }).observe(host);
  document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
  if (!coarse) {
    area.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; target = 1; });
    area.addEventListener('pointerleave', () => { target = 0; });
  }
}
