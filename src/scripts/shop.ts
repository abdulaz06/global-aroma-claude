/**
 * Shop interactions: category, search, character filters, sort, progressive
 * "show more", URL state, product dialog, and a live price/stock refresh
 * from /api/catalog.json that falls back to the build-time data (and says so).
 */
import { brief } from './brief-store';
import { showToast } from './site';
import type { ClientProduct } from '../lib/catalog';

const data = JSON.parse(document.getElementById('product-data')!.textContent || '{}') as { meta: { readAt: string; source: string }; products: ClientProduct[] };
const byId = new Map(data.products.map((p) => [p.id, p]));
const grid = document.querySelector<HTMLUListElement>('[data-grid]')!;
const cards = [...grid.querySelectorAll<HTMLLIElement>('[data-product]')];
const original = [...cards];
const q = document.querySelector<HTMLInputElement>('[data-q]')!;
const sortSel = document.querySelector<HTMLSelectElement>('[data-sort]')!;
const onlyBuy = document.querySelector<HTMLInputElement>('[data-only-buyable]')!;
const onlyNotes = document.querySelector<HTMLInputElement>('[data-only-notes]')!;
const count = document.querySelector<HTMLElement>('[data-count]')!;
const empty = document.querySelector<HTMLElement>('[data-empty]')!;
const moreWrap = document.querySelector<HTMLElement>('[data-more-wrap]')!;
const moreN = document.querySelector<HTMLElement>('[data-more-n]')!;
const filterCount = document.querySelector<HTMLElement>('[data-filter-count]')!;
const filters = document.querySelector<HTMLElement>('[data-filters]')!;
const filterToggle = document.querySelector<HTMLButtonElement>('[data-filter-toggle]')!;

// Page size fills whole rows: 3 rows on wide screens, 5 rows of 2 on phones.
const PAGE = () => {
  const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 4;
  return cols <= 2 ? 10 : cols * 3;
};
const fmt = (n: number) => 'AED ' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

const state = { cat: 'all', q: '', sort: 'featured', accords: new Set<string>(), buy: false, notes: false, limit: PAGE() };

function readUrl() {
  const u = new URLSearchParams(location.search);
  state.cat = ['oils', 'diffusers'].includes(u.get('cat') || '') ? u.get('cat')! : 'all';
  state.q = u.get('q') || '';
  state.sort = u.get('sort') || 'featured';
  (u.get('character') || '').split(',').filter(Boolean).forEach((a) => state.accords.add(a));
  state.buy = u.get('buy') === '1';
  state.notes = u.get('notes') === '1';
}
function writeUrl() {
  const u = new URLSearchParams();
  if (state.cat !== 'all') u.set('cat', state.cat);
  if (state.q) u.set('q', state.q);
  if (state.sort !== 'featured') u.set('sort', state.sort);
  if (state.accords.size) u.set('character', [...state.accords].join(','));
  if (state.buy) u.set('buy', '1');
  if (state.notes) u.set('notes', '1');
  const s = u.toString();
  history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
}

function syncControls() {
  document.querySelectorAll<HTMLButtonElement>('[data-cat-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.catBtn === state.cat)));
  q.value = state.q; sortSel.value = state.sort; onlyBuy.checked = state.buy; onlyNotes.checked = state.notes;
  document.querySelectorAll<HTMLButtonElement>('[data-accord]').forEach((b) => b.setAttribute('aria-pressed', String(state.accords.has(b.dataset.accord!))));
  const n = state.accords.size + +state.buy + +state.notes;
  filterCount.textContent = n ? String(n) : '';
}

function apply(resetLimit = true) {
  if (resetLimit) state.limit = PAGE();
  const words = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (c: HTMLElement) =>
    (state.cat === 'all' || c.dataset.cat === state.cat)
    && (!state.buy || c.dataset.buyable === 'true')
    && (!state.notes || c.dataset.notes === 'true')
    && (!state.accords.size || c.dataset.accords!.split(' ').some((a) => state.accords.has(a)))
    && words.every((w) => c.dataset.text!.includes(w));
  let list = original.filter(matches);
  const price = (c: HTMLElement) => (c.dataset.price ? +c.dataset.price : NaN);
  if (state.sort === 'price-asc' || state.sort === 'price-desc') {
    const dir = state.sort === 'price-asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      const pa = price(a), pb = price(b);
      if (isNaN(pa) && isNaN(pb)) return 0; if (isNaN(pa)) return 1; if (isNaN(pb)) return -1; // "price on request" last
      return (pa - pb) * dir;
    });
  } else if (state.sort === 'name') list = [...list].sort((a, b) => a.dataset.name!.localeCompare(b.dataset.name!));
  const show = new Set(list.slice(0, state.limit));
  // Reorder in place so keyboard order matches visual order.
  list.forEach((c) => grid.appendChild(c));
  original.filter((c) => !list.includes(c)).forEach((c) => grid.appendChild(c));
  for (const c of original) c.hidden = !show.has(c);
  const buyable = list.filter((c) => c.dataset.buyable === 'true').length;
  count.textContent = `${list.length} product${list.length === 1 ? '' : 's'} · ${buyable} available online`;
  empty.hidden = list.length > 0;
  const left = list.length - show.size;
  moreWrap.hidden = left <= 0;
  moreN.textContent = left > 0 ? `(${left} more)` : '';
  syncControls();
  writeUrl();
}

document.querySelectorAll<HTMLButtonElement>('[data-cat-btn]').forEach((b) => b.addEventListener('click', () => { state.cat = b.dataset.catBtn!; apply(); }));
let t: number | undefined;
q.addEventListener('input', () => { clearTimeout(t); t = window.setTimeout(() => { state.q = q.value; apply(); }, 120); });
sortSel.addEventListener('change', () => { state.sort = sortSel.value; apply(); });
onlyBuy.addEventListener('change', () => { state.buy = onlyBuy.checked; apply(); });
onlyNotes.addEventListener('change', () => { state.notes = onlyNotes.checked; apply(); });
document.querySelectorAll<HTMLButtonElement>('[data-accord]').forEach((b) => b.addEventListener('click', () => {
  const a = b.dataset.accord!; state.accords.has(a) ? state.accords.delete(a) : state.accords.add(a); apply();
}));
document.querySelectorAll('[data-clear]').forEach((b) => b.addEventListener('click', () => {
  Object.assign(state, { cat: 'all', q: '', sort: 'featured', buy: false, notes: false }); state.accords.clear(); apply();
}));
filterToggle.addEventListener('click', () => {
  const open = filters.hidden; filters.hidden = !open; filterToggle.setAttribute('aria-expanded', String(open));
});
document.querySelector('[data-more]')!.addEventListener('click', () => {
  const before = new Set(original.filter((c) => !c.hidden));
  state.limit += PAGE(); apply(false);
  const first = [...grid.children].find((c) => !(c as HTMLElement).hidden && !before.has(c as HTMLLIElement)) as HTMLElement | undefined;
  first?.querySelector<HTMLButtonElement>('.pc-name button')?.focus();
});

readUrl();
if (state.accords.size || state.buy || state.notes) { filters.hidden = false; filterToggle.setAttribute('aria-expanded', 'true'); }
apply();

/* ── product dialog ─────────────────────────────── */
const dlg = document.querySelector<HTMLDialogElement>('[data-product-dialog]')!;
let current: ClientProduct | null = null;
let opener: HTMLElement | null = null;
const $ = <T extends HTMLElement>(s: string) => dlg.querySelector<T>(s)!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

function openProduct(id: number, from?: HTMLElement | null) {
  const p = byId.get(id); if (!p) return;
  current = p; opener = from ?? (document.activeElement as HTMLElement);
  const media = $('[data-pd-media]');
  media.innerHTML = '';
  if (p.signature) media.insertAdjacentHTML('beforeend', `<figure class="pd-fig"><img src="${p.signature}" alt="" width="400" height="400"><figcaption>Signature, drawn from the notes</figcaption></figure>`);
  if (p.image) {
    media.insertAdjacentHTML('beforeend', `<figure class="pd-fig"><img src="${esc(p.image)}" alt="${esc(p.title)}, product photo from the Global Aroma store" width="400" height="400" referrerpolicy="no-referrer"><figcaption>Photo from the Global Aroma store</figcaption></figure>`);
    media.querySelector<HTMLImageElement>('figure:last-child img')!.onerror = function () { (this as HTMLElement).closest('figure')!.remove(); };
  }
  $('[data-pd-kind]').textContent = p.category === 'oils' ? (p.notes ? `Diffuser oil · ${p.notes.family}` : 'Diffuser oil') : 'Diffuser';
  $('[data-pd-title]').textContent = p.title;
  $('[data-pd-price]').textContent = p.purchasable && p.price ? fmt(p.price) : 'Price on request';
  $('[data-pd-opt]').textContent = p.offered[0] ? `· ${p.offered[0]}` : '';
  $('[data-pd-stock]').textContent = '';
  $('[data-pd-sum]').textContent = p.summary ?? '';
  const notes = $('[data-pd-notes]');
  notes.innerHTML = p.notes ? (['top', 'heart', 'base'] as const).map((k) => `<div><dt>${k}</dt><dd>${esc(p.notes![k].join(', '))}</dd></div>`).join('') : '';
  const src = $('[data-pd-notes-src]');
  src.innerHTML = '';
  if (p.notes) {
    src.textContent = p.notesSource === 'collection'
      ? 'Notes from the published Global Aroma scent collection.'
      : 'Notes as listed in this product’s store description.';
  } else if (p.category === 'oils') src.textContent = 'The store doesn’t list notes for this oil. Ask the team, or request a sample.';
  const flags = p.flags.filter((f) => !/volume options/.test(f));
  if (p.notesMatch === 'different' && p.collectionTitle) {
    src.insertAdjacentHTML('beforeend', `<span class="pd-flag" style="display:block;margin-top:.5rem">These notes are the same as <b>${esc(p.collectionTitle)}</b> in the published collection. Global Aroma is confirming the listing.</span>`);
  } else if (flags.length) src.insertAdjacentHTML('beforeend', `<span class="pd-flag" style="display:block;margin-top:.5rem">${esc(flags[0])}</span>`);
  const vols = $('[data-pd-vols]');
  vols.innerHTML = p.offered.length
    ? '<span class="label label-muted" style="width:100%">Volume offered online</span>' + p.offered.map((v) => `<span class="pd-vol">${esc(v)}</span>`).join('')
      + (p.buy.cartUrl ? '' : '<span class="pd-vol-note">Select it on the store, which confirms the price and availability.</span>')
    : '';
  const cart = $<HTMLAnchorElement>('[data-pd-cart]');
  cart.hidden = !(p.purchasable && p.buy.cartUrl);
  if (p.buy.cartUrl) cart.href = p.buy.cartUrl;
  const view = $<HTMLAnchorElement>('[data-pd-view]');
  view.href = p.buy.productUrl;
  const direct = p.purchasable && !p.buy.cartUrl;
  view.className = direct ? 'btn' : 'btn btn-line';
  view.firstChild!.textContent = direct ? 'Buy on globalaroma.me ' : 'View on the store ';
  $('[data-pd-sku]').textContent = p.sku ? `SKU ${p.sku}.` : '';
  syncBriefBtn();
  if (!dlg.open) dlg.showModal();
  history.replaceState(null, '', location.pathname + location.search + `#p-${p.id}`);
}
function syncBriefBtn() {
  if (!current) return;
  const b = $<HTMLButtonElement>('[data-pd-brief]');
  const on = brief.has('category', `product-${current.id}`);
  b.dataset.added = String(on); b.textContent = on ? 'In your brief' : (current.purchasable ? 'Add to brief (for volumes)' : 'Request a quote');
}
$('[data-pd-brief]').addEventListener('click', () => {
  if (!current) return;
  const on = brief.toggle({ kind: 'category', id: `product-${current.id}`, label: current.title, meta: current.purchasable && current.price ? fmt(current.price) : 'Price on request', division: 'aroma', url: current.permalink });
  showToast(on ? `${current.title} added to your brief` : `${current.title} removed`);
  syncBriefBtn();
});
$('[data-close]').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
dlg.addEventListener('close', () => { history.replaceState(null, '', location.pathname + location.search); opener?.focus?.(); });
window.addEventListener('brief:change', syncBriefBtn);
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-open-product]');
  if (b) { e.preventDefault(); openProduct(+b.dataset.openProduct!, b); }
});
// Deep links (#p-5390) open the product, on load and on in-page hash changes.
function openFromHash() {
  const m = location.hash.match(/^#p-(\d+)$/);
  if (m && !dlg.open) requestAnimationFrame(() => openProduct(+m[1]));
}
openFromHash();
window.addEventListener('hashchange', openFromHash);
