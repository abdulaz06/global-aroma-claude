// Renders each reel in src/social/plan.json to MP4 (1080×1920, H.264) plus a
// cover frame. Frames are stepped deterministically with window.reelAt(id, t).
// Usage: npm run build && npm run reel   (CHROME_PATH optional; needs ffmpeg)
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';

const BASE = process.env.BASE_URL || 'http://localhost:4321';
const plan = JSON.parse(readFileSync('src/social/plan.json', 'utf8'));
async function up() { try { return (await fetch(BASE + '/studio/reel/')).ok; } catch { return false; } }
let server;
if (!(await up())) {
  server = spawn('npx', ['astro', 'preview', '--port', '4321'], { stdio: 'ignore' });
  for (let i = 0; i < 40 && !(await up()); i++) await new Promise((r) => setTimeout(r, 500));
}
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(`${BASE}/studio/reel/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

for (const r of plan.reels) {
  const dir = `social/out/.frames-${r.id}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const el = page.locator(`#${r.id}`);
  await el.scrollIntoViewIfNeeded();
  const n = Math.round(r.seconds * r.fps);
  for (let i = 0; i < n; i++) {
    await page.evaluate(([id, t]) => window.reelAt(id, t), [r.id, i / r.fps]);
    await el.screenshot({ path: `${dir}/${String(i).padStart(4, '0')}.png` });
  }
  const out = `social/out/${r.id}.mp4`;
  const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(r.fps), '-i', `${dir}/%04d.png`,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: 'inherit' });
  if (ff.status !== 0) throw new Error('ffmpeg failed');
  // Cover: the moment the name lands, everything inside the 3:4 grid crop.
  await page.evaluate(([id]) => window.reelAt(id, 8.6), [r.id]);
  await el.screenshot({ path: `social/out/${r.id}-cover.png` });
  rmSync(dir, { recursive: true, force: true });
  console.log(`rendered ${out} (${n} frames)`);
}
await browser.close();
server?.kill();
