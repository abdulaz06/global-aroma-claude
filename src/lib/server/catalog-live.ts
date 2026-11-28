/**
 * Live catalogue read for /api/catalog.json. Only public Store API data (the
 * same data any shopper sees). Parent-product prices are read in one or two
 * requests; for variable oils the parent price is the price of the purchasable
 * 500 ml option. Failures return null so the caller can answer "unavailable"
 * and the page keeps showing its build-time data with that data's date.
 */
export interface LivePrice { id: number; price: number | null; purchasable: boolean; inStock: boolean | null }
export interface LiveCatalog { readAt: string; origin: string; items: LivePrice[] }

export async function readLiveCatalog(origin: string, timeoutMs = 6000, fetchImpl: typeof fetch = fetch): Promise<LiveCatalog | null> {
  const api = `${origin.replace(/\/$/, '')}/wp-json/wc/store/v1/products`;
  const items: LivePrice[] = [];
  try {
    for (let page = 1; page <= 5; page++) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      let res: Response;
      try { res = await fetchImpl(`${api}?per_page=100&page=${page}&orderby=id&order=asc`, { signal: ctrl.signal, headers: { accept: 'application/json' } }); }
      finally { clearTimeout(t); }
      if (!res.ok) return null;
      const json = await res.json();
      if (!Array.isArray(json)) return null;
      for (const p of json) {
        if (typeof p?.id !== 'number') continue;
        const unit = Number(p.prices?.currency_minor_unit ?? 2);
        const n = Number(p.prices?.price);
        const price = Number.isFinite(n) && n > 0 ? n / 10 ** unit : null;
        items.push({ id: p.id, price, purchasable: !!p.is_purchasable && price !== null, inStock: typeof p.is_in_stock === 'boolean' ? p.is_in_stock : null });
      }
      if (json.length < 100) break;
    }
  } catch { return null; }
  return items.length ? { readAt: new Date().toISOString(), origin: api, items } : null;
}
