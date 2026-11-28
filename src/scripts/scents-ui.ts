/**
 * Scent map, detail dialog and library filters. Reads the collection from the
 * page's <script type="application/json" id="scent-data">.
 */
import { brief } from './brief-store';
import type { ClientScent } from '../lib/library';

const dataEl = document.getElementById('scent-data');
const scents: ClientScent[] = dataEl ? JSON.parse(dataEl.textContent || '[]') : [];
const bySlug = new Map(scents.map((s) => [s.slug, s]));
const WA = '971555827212';
const list = (a: string[]) => a.join(', ');

/* ── dialog ─────────────────────────────────────── */
const dlg = document.querySelector<HTMLDialogElement>('[data-scent-dialog]');
let current: ClientScent | null = null;
let opener: HTMLElement | null = null;

function syncDialogAdd() {
  if (!dlg || !current) return;
  const b = dlg.querySelector<HTMLButtonElement>('[data-dlg-add]')!;
  const on = brief.has('scent', current.slug);
  b.textContent = on ? 'In your brief ✓' : 'Add to brief';
  b.setAttribute('aria-pressed', String(on));
}

export function openScent(slug: string, from?: HTMLElement | null) {
  const s = bySlug.get(slug);
  if (!s || !dlg) return false;
  current = s;
  opener = from ?? (document.activeElement as HTMLElement);
  const q = <T extends HTMLElement>(sel: string) => dlg.querySelector<T>(sel)!;
  q<HTMLImageElement>('[data-sig]').src = `/sig/${s.slug}.svg`;
  q('[data-title]').textContent = s.title;
  q('[data-family]').textContent = s.family;
  q('[data-mood]').textContent = s.mood.length ? s.mood.join(' · ') : '';
  q('[data-top]').textContent = list(s.top);
  q('[data-heart]').textContent = list(s.heart);
  q('[data-base]').textContent = list(s.base);
  const buy = q<HTMLAnchorElement>('[data-buy]');
  buy.hidden = !s.store;
  if (s.store) buy.href = s.store.url;
  q('[data-store-note]').textContent = s.store
    ? `Sold online as diffuser oil. Listed store price: AED ${s.store.price.toLocaleString('en-US', { minimumFractionDigits: s.store.price % 1 ? 2 : 0 })}; volume is chosen on the store. Checkout on globalaroma.me.`
    : 'Not listed in the online store. Add it to your brief and the team will quote volumes and formats.';
  q<HTMLAnchorElement>('[data-wa]').href = `https://wa.me/${WA}?text=${encodeURIComponent(`Hello Global Aroma, I would like to enquire about ${s.title}.`)}`;
  syncDialogAdd();
  if (!dlg.open) dlg.showModal();
  history.replaceState(null, '', `#scent-${s.slug}`);
  return true;
}

if (dlg) {
  dlg.querySelector('[data-close]')!.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => {
    history.replaceState(null, '', location.pathname + location.search);
    opener?.focus?.();
  });
  dlg.querySelector('[data-dlg-add]')!.addEventListener('click', () => {
    if (!current) return;
    brief.toggle({ kind: 'scent', id: current.slug, label: current.title, meta: current.family, division: 'aroma', url: current.store?.url });
  });
  window.addEventListener('brief:change', syncDialogAdd);
  const m = location.hash.match(/^#scent-(.+)$/);
  if (m) requestAnimationFrame(() => openScent(m[1]));
}

document.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-open-scent]');
  if (t && openScent(t.dataset.openScent!, t)) e.preventDefault();
});

/* ── map ────────────────────────────────────────── */
document.querySelectorAll<HTMLElement>('[data-scent-map]').forEach((map) => {
  const plane = map.querySelector<HTMLElement>('[data-plane]')!;
  const probe = map.querySelector<HTMLElement>('[data-probe]')!;
  const panel = map.querySelector<HTMLElement>('[data-panel]')!;
  const near = map.querySelector<HTMLOListElement>('[data-near]')!;
  const hint = map.querySelector<HTMLElement>('[data-hint]');
  const dots = [...map.querySelectorAll<HTMLAnchorElement>('.smap-dot')];
  const lib = map.dataset.libraryHref || '';
  const active = new Set<string>();

  map.querySelectorAll<HTMLButtonElement>('[data-accord]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const a = chip.dataset.accord!;
      active.has(a) ? active.delete(a) : active.add(a);
      chip.setAttribute('aria-pressed', String(active.has(a)));
      map.querySelectorAll<HTMLLIElement>('.smap-dots li').forEach((li) => {
        const acc = li.dataset.accords!.split(' ');
        li.classList.toggle('dim', active.size > 0 && !acc.some((x) => active.has(x)));
      });
    });
  });

  dots.forEach((d) => d.addEventListener('click', (e) => {
    if (dlg && openScent(d.dataset.slug!, d)) e.preventDefault();
  }));

  plane.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.smap-dot')) return;
    const inner = map.querySelector<HTMLElement>('.smap-dots')!.getBoundingClientRect();
    const r = plane.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - inner.left) / inner.width));
    const y = Math.min(1, Math.max(0, (e.clientY - inner.top) / inner.height));
    probe.hidden = false;
    probe.style.left = `${e.clientX - r.left}px`;
    probe.style.top = `${e.clientY - r.top}px`;
    if (hint) hint.style.opacity = '0';
    const ranked = scents.map((s) => ({ s, d: Math.hypot(s.x - x, (s.y - y) * 0.9) })).sort((a, b) => a.d - b.d).slice(0, 4);
    dots.forEach((d) => d.classList.toggle('near', ranked.some((r) => r.s.slug === d.dataset.slug)));
    near.innerHTML = '';
    for (const { s } of ranked) {
      const li = document.createElement('li');
      li.className = 'near-item';
      li.innerHTML = `<img src="/sig/${s.slug}.svg" alt="" width="56" height="56" loading="lazy"><div><a href="${lib}#scent-${s.slug}" data-open-scent="${s.slug}" class="near-name"></a><span class="near-meta"></span></div>`;
      const a = li.querySelector('a')!; a.textContent = s.title;
      if (!dlg) a.removeAttribute('data-open-scent');
      li.querySelector('.near-meta')!.textContent = `${s.family} · ${s.top.slice(0, 2).join(', ')}`;
      near.appendChild(li);
    }
    panel.classList.add('on');
  });
});

/* ── library filters ────────────────────────────── */
const libEl = document.querySelector<HTMLElement>('[data-library]');
if (libEl) {
  const cards = [...libEl.querySelectorAll<HTMLElement>('[data-card]')];
  const search = libEl.querySelector<HTMLInputElement>('[data-search]');
  const online = libEl.querySelector<HTMLInputElement>('[data-online]');
  const count = libEl.querySelector<HTMLElement>('[data-count]');
  const empty = libEl.querySelector<HTMLElement>('[data-empty]');
  const chips = [...libEl.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const moreWrap = libEl.querySelector<HTMLElement>('[data-more-wrap]');
  const PREVIEW = 15;
  // Deep links to a scent show the whole collection so the target exists.
  let expanded = /^#scent-/.test(location.hash);
  let acc = '';
  const apply = () => {
    const q = (search?.value || '').trim().toLowerCase();
    const filtering = !!(acc || q || online?.checked);
    let n = 0, shown = 0;
    for (const c of cards) {
      const ok = (!acc || c.dataset.accords!.split(' ').includes(acc))
        && (!online?.checked || c.dataset.online === 'true')
        && (!q || c.dataset.text!.includes(q));
      if (ok) n++;
      const show = ok && (filtering || expanded || shown < PREVIEW);
      c.hidden = !show;
      if (show) shown++;
    }
    if (count) count.textContent = `${n} of ${cards.length}`;
    if (empty) empty.hidden = n > 0;
    if (moreWrap) moreWrap.hidden = filtering || expanded;
  };
  libEl.querySelector('[data-more]')?.addEventListener('click', () => {
    expanded = true; apply();
    cards[PREVIEW]?.querySelector<HTMLAnchorElement>('.scard-name a')?.focus();
  });
  chips.forEach((ch) => ch.addEventListener('click', () => {
    acc = acc === ch.dataset.filter ? '' : ch.dataset.filter!;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === acc)));
    apply();
  }));
  search?.addEventListener('input', apply);
  online?.addEventListener('change', apply);
  apply();
}


/* ── scent finder ───────────────────────────────── */
type Acc = Record<string, number>;
const MOODS: Record<string, { title: string; score: (a: Acc) => number }> = {
  fresh: { title: 'Fresh & clean', score: (a) => (a.citrus ?? 0) + (a.green ?? 0) + (a.marine ?? 0) * 1.1 - (a.amber ?? 0) * 0.5 - (a.gourmand ?? 0) * 0.5 },
  floral: { title: 'Light & floral', score: (a) => (a.floral ?? 0) + (a.fruity ?? 0) * 0.7 - (a.amber ?? 0) * 0.4 - (a.woody ?? 0) * 0.2 },
  warm: { title: 'Warm & welcoming', score: (a) => (a.gourmand ?? 0) + (a.amber ?? 0) * 0.7 + (a.spicy ?? 0) * 0.4 - (a.citrus ?? 0) * 0.3 },
  woody: { title: 'Woody & refined', score: (a) => (a.woody ?? 0) + (a.green ?? 0) * 0.15 - (a.gourmand ?? 0) * 0.3 - (a.fruity ?? 0) * 0.3 },
  soft: { title: 'Soft & calm', score: (a) => (a.musk ?? 0) * 1.3 + (a.floral ?? 0) * 0.35 - (a.spicy ?? 0) * 0.5 - (a.amber ?? 0) * 0.3 },
  rich: { title: 'Rich & oriental', score: (a) => (a.amber ?? 0) + (a.woody ?? 0) * 0.5 + (a.spicy ?? 0) * 0.5 - (a.citrus ?? 0) * 0.4 - (a.marine ?? 0) * 0.5 },
};
const ACC_NAME: Record<string, string> = { citrus: 'citrus', green: 'green', marine: 'marine', fruity: 'fruity', floral: 'floral', musk: 'musk', spicy: 'spicy', woody: 'woody', amber: 'amber and resin', gourmand: 'gourmand' };

document.querySelectorAll<HTMLElement>('[data-finder]').forEach((f) => {
  const lib = f.dataset.libraryHref || '';
  let space = ''; let mood = ''; let shown = 3;
  const list = f.querySelector<HTMLOListElement>('[data-f-list]')!;
  const results = f.querySelector<HTMLElement>('[data-f-results]')!;
  const emptyEl = f.querySelector<HTMLElement>('[data-f-empty]')!;
  const title = f.querySelector<HTMLElement>('[data-f-title]')!;
  const more = f.querySelector<HTMLButtonElement>('[data-f-more]')!;
  const briefLink = f.querySelector<HTMLAnchorElement>('[data-f-brief]')!;
  function render() {
    if (!mood) { results.hidden = true; emptyEl.hidden = false; return; }
    const m = MOODS[mood];
    const ranked = scents.map((s) => ({ s, v: m.score((s as any).acc ?? {}) })).sort((a, b) => b.v - a.v);
    results.hidden = false; emptyEl.hidden = true;
    title.textContent = `${m.title}${space ? ` · for a ${space.toLowerCase()}` : ''}`;
    list.innerHTML = '';
    for (const { s } of ranked.slice(0, shown)) {
      const acc = Object.entries((s as any).acc as Acc).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => ACC_NAME[k]).join(' and ');
      const li = document.createElement('li');
      li.className = 'f-item';
      li.innerHTML = `<img src="/sig/${s.slug}.svg" alt="" width="72" height="72" loading="lazy"><div><a class="f-item-name" href="${lib}#scent-${s.slug}"></a><p class="f-item-why"></p><div class="f-item-acts"></div></div>`;
      const a = li.querySelector('a')!; a.textContent = s.title;
      if (dlg) a.dataset.openScent = s.slug;
      li.querySelector('.f-item-why')!.textContent = `Mostly ${acc} notes: ${[...s.top, ...s.heart].slice(0, 3).join(', ')}.`;
      const acts = li.querySelector('.f-item-acts')!;
      const add = document.createElement('button');
      add.type = 'button'; add.className = 'act act-add';
      Object.assign(add.dataset, { briefAdd: '', kind: 'scent', id: s.slug, label: s.title, meta: s.family, division: 'aroma', addText: 'Add to brief' });
      add.innerHTML = '<span data-add-label>Add to brief</span>';
      acts.appendChild(add);
      if (s.store) {
        const buy = document.createElement('a');
        buy.className = 'act act-buy'; buy.href = s.store.url; buy.rel = 'noopener';
        buy.textContent = `Buy · AED ${s.store.price.toLocaleString('en-US', { minimumFractionDigits: s.store.price % 1 ? 2 : 0 })}`;
        acts.appendChild(buy);
      }
      list.appendChild(li);
    }
    more.hidden = shown >= ranked.length;
    briefLink.href = `/brief?need=aroma${space ? `&space=${encodeURIComponent(space)}` : ''}`;
    window.dispatchEvent(new CustomEvent('brief:change'));
  }
  f.querySelectorAll<HTMLButtonElement>('[data-space]').forEach((b) => b.addEventListener('click', () => {
    space = space === b.dataset.space ? '' : b.dataset.space!;
    f.querySelectorAll('[data-space]').forEach((x) => x.setAttribute('aria-pressed', String((x as HTMLElement).dataset.space === space)));
    render();
  }));
  f.querySelectorAll<HTMLButtonElement>('[data-mood]').forEach((b) => b.addEventListener('click', () => {
    mood = b.dataset.mood!; shown = 3;
    f.querySelectorAll('[data-mood]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    render();
  }));
  more.addEventListener('click', () => { shown += 3; render(); });
});

/* On touch screens a tap on the map always shows the nearest scents as a
   list of large targets, never a tiny dot directly (avoids mis-taps). */
if (matchMedia('(pointer: coarse)').matches) document.documentElement.classList.add('coarse');
