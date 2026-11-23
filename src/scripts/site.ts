import { brief, type BriefItem } from './brief-store';

// Header: hairline once the page scrolls.
const nav = document.querySelector<HTMLElement>('[data-nav]');
const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu.
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu]');
const menu = document.getElementById('mobile-menu');
function setMenu(open: boolean) {
  if (!menu || !menuBtn) return;
  menu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Close' : 'Menu';
  document.body.style.overflow = open ? 'hidden' : '';
}
menuBtn?.addEventListener('click', () => setMenu(menu?.hidden ?? true));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu && !menu.hidden) { setMenu(false); menuBtn?.focus(); } });
window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => e.matches && setMenu(false));

// Reveal on scroll (motion only; content is visible without JS or with reduced motion).
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  reveals.forEach((el) => io.observe(el));
} else reveals.forEach((el) => el.classList.add('in'));

// Brief counter and add buttons.
function syncBrief() {
  const n = brief.items().length;
  document.querySelectorAll('[data-brief-count]').forEach((el) => (el.textContent = String(n)));
  document.querySelectorAll('[data-brief-count-text]').forEach((el) => (el.textContent = `${n} item${n === 1 ? '' : 's'}`));
  document.querySelectorAll<HTMLButtonElement>('[data-brief-add]').forEach((b) => {
    const on = brief.has(b.dataset.kind as BriefItem['kind'], b.dataset.id!);
    b.dataset.added = String(on);
    b.setAttribute('aria-pressed', String(on));
    const lbl = b.querySelector('[data-add-label]');
    if (lbl) lbl.textContent = on ? 'In brief' : b.dataset.addText ?? 'Add to brief';
  });
}
syncBrief();
window.addEventListener('brief:change', syncBrief);

const toast = document.querySelector<HTMLElement>('[data-toast]');
let tt: number | undefined;
export function showToast(text: string) {
  if (!toast) return;
  toast.querySelector('[data-toast-text]')!.textContent = text;
  toast.classList.add('show');
  clearTimeout(tt);
  tt = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-brief-add]');
  if (!b) return;
  const item: BriefItem = {
    kind: b.dataset.kind as BriefItem['kind'], id: b.dataset.id!, label: b.dataset.label!,
    meta: b.dataset.meta, division: (b.dataset.division as BriefItem['division']) ?? 'aroma', url: b.dataset.url,
  };
  const on = brief.toggle(item);
  showToast(on ? `${item.label} added to your brief` : `${item.label} removed`);
});
