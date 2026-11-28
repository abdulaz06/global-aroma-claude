// Renders proposal/slides/*.html into "Global Aroma - Digital Experience Proposal.pdf"
// (12 full-bleed 1920×1080 pages, clickable links). Usage: npm run proposal
// CHROME_PATH may point at a system Chrome.
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = resolve('proposal');
const order = ['cover', 'value', 'identity', 'website', 'divisions', 'discovery', 'shop', 'ordering', 'staff', 'social', 'proposal', 'explore'];
const font = (p) => pathToFileURL(resolve('node_modules', p)).href;
const fonts = `
@font-face{font-family:'Newsreader';src:url('${font('@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2')}') format('woff2');font-weight:200 800}
@font-face{font-family:'Schibsted Grotesk';src:url('${font('@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2')}') format('woff2');font-weight:400 900}
@font-face{font-family:'JetBrains Mono';src:url('${font('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2')}') format('woff2');font-weight:500}`;
const print = `@page{size:1920px 1080px;margin:0} html,body{margin:0;padding:0}
section{width:1920px;height:1080px;position:relative;overflow:hidden;break-after:page}
.rise{animation:none!important} aside{display:none}
x-shape{display:block;clip-path:polygon(0 30%,58% 30%,58% 0,100% 50%,58% 100%,58% 70%,0 70%)}`;
const imgBase = pathToFileURL(resolve(root, 'img')).href + '/';
const body = order.map((n) => readFileSync(resolve(root, 'slides', `${n}.html`), 'utf8').replaceAll('src="IMG:', `src="${imgBase}`)).join('\n');
const css = readFileSync(resolve(root, 'deck.css'), 'utf8');
const htmlPath = resolve(root, '.render.html');
writeFileSync(htmlPath, `<!doctype html><html><head><meta charset="utf-8"><title>Global Aroma — Digital Experience Proposal</title><style>${fonts}${css}${print}</style></head><body>${body}</body></html>`);

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(pathToFileURL(htmlPath).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
const out = resolve(root, 'Global Aroma - Digital Experience Proposal.pdf');
await page.pdf({ path: out, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`wrote ${out}`);
