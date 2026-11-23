/**
 * The brief: a shortlist kept on this device only (localStorage, guarded).
 * Nothing is sent anywhere until the visitor opens their own email or
 * WhatsApp from the brief page.
 */
export type BriefKind = 'scent' | 'diffuser' | 'category' | 'oil';
export interface BriefItem { kind: BriefKind; id: string; label: string; meta?: string; division: 'aroma' | 'hospitality' | 'technology'; url?: string }

const KEY = 'ga-brief-v1';
let memory: BriefItem[] = [];

function read(): BriefItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) memory = JSON.parse(raw);
  } catch { /* storage unavailable: keep the in-memory list */ }
  return Array.isArray(memory) ? memory : [];
}
function write(items: BriefItem[]) {
  memory = items;
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('brief:change', { detail: items }));
}

export const brief = {
  items: read,
  has: (kind: BriefKind, id: string) => read().some((i) => i.kind === kind && i.id === id),
  add(item: BriefItem) {
    const items = read();
    if (!items.some((i) => i.kind === item.kind && i.id === item.id)) write([...items, item]);
  },
  remove(kind: BriefKind, id: string) { write(read().filter((i) => !(i.kind === kind && i.id === id))); },
  toggle(item: BriefItem) { brief.has(item.kind, item.id) ? brief.remove(item.kind, item.id) : brief.add(item); return brief.has(item.kind, item.id); },
  clear() { write([]); },
};

window.addEventListener('storage', (e) => { if (e.key === KEY) { read(); window.dispatchEvent(new CustomEvent('brief:change', { detail: memory })); } });
