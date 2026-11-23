// Renders every frame in src/social/plan.json from the built site's /studio
// page. Usage: npm run build && npm run social   (needs `npm run preview` running
// or starts it). CHROME_PATH may point at a system Chrome.
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import sharp from 'sharp';

const BASE = process.env.BASE_URL || 'http://localhost:4321';
const plan = JSON.parse(readFileSync('src/social/plan.json', 'utf8'));
mkdirSync('social/out', { recursive: true });
mkdirSync('public/og', { recursive: true });

async function up() { try { return (await fetch(BASE + '/studio/')).ok; } catch { return false; } }
let server;
if (!(await up())) {
  server = spawn('npx', ['astro', 'preview', '--port', '4321'], { stdio: 'ignore' });
  for (let i = 0; i < 40 && !(await up()); i++) await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1700, height: 2000 }, deviceScaleFactor: 1 });
async function shoot(query, suffix) {
  await page.goto(`${BASE}/studio/${query}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.body.classList.add('render'));
  await page.evaluate(() => document.fonts.ready);
  const files = [];
  for (const f of plan.frames) {
    const el = page.locator(`#${f.id}`);
    const file = suffix ? `social/out/_safe/${f.id}.png` : (f.out || `social/out/${f.id}.png`);
    if (suffix) mkdirSync('social/out/_safe', { recursive: true });
    await el.screenshot({ path: file });
    files.push({ f, file });
  }
  return files;
}
const files = await shoot('', '');
const safe = await shoot('?safe', 'safe');
console.log(`rendered ${files.length} frames (+ ${safe.length} safe-zone proofs)`);

// Contact sheets: every asset at a glance, and the safe-zone proof.
async function sheet(list, out) {
  const cell = 360, pad = 24, cols = 6;
  const items = list.filter(({ f }) => !f.id.startsWith('og-default'));
  const tiles = await Promise.all(items.map(async ({ f, file }) => {
    const h = Math.round((cell * f.h) / f.w);
    return { buf: await sharp(file).resize(cell, h).png().toBuffer(), h };
  }));
  const rows = [];
  for (let i = 0; i < tiles.length; i += cols) rows.push(tiles.slice(i, i + cols));
  const rowH = rows.map((r) => Math.max(...r.map((t) => t.h)));
  const W = cols * cell + (cols + 1) * pad, H = rowH.reduce((a, b) => a + b + pad, pad);
  const comps = []; let y = pad;
  rows.forEach((r, ri) => { r.forEach((t, ci) => comps.push({ input: t.buf, left: pad + ci * (cell + pad), top: y })); y += rowH[ri] + pad; });
  await sharp({ create: { width: W, height: H, channels: 3, background: '#d9d3c8' } }).composite(comps).png().toFile(out);
}
await sheet(files, 'social/out/_contact-sheet.png');
await sheet(safe, 'social/out/_safe-zones.png');
await browser.close();
server?.kill();
