# 11 — Catalogue: audit, reconciliation and sync

**Status:** working. The shop shows the whole public catalogue. Prices come from the official store, and the page labels how fresh they are. **The official store is authoritative**: it confirms the final price, stock and checkout.

## 1. Source

| | |
|---|---|
| Endpoint | `https://globalaroma.me/wp-json/wc/store/v1/products` (WooCommerce **Store API**: public, read-only, no credentials) |
| Paging | `per_page=100&page=n&orderby=id&order=asc`, using the `X-WP-TotalPages` header |
| Variations | `/products/{variationId}` for each variation's own price and purchasability |
| Money | Minor units (`currency_minor_unit: 2`), AED |
| Audit date | 27 Nov 2026, 23:55 (America/Chicago). Read with WebFetch, because this build environment's shell cannot reach the store |

No WordPress admin, REST credentials or private data were used or requested.

## 2. What the store publishes

| Measure | Count |
|---|---|
| Published products | **62** |
| Diffuser oils | 48 |
| Diffusers | 14 |
| Variable products / simple products | 46 / 16 |
| Purchasable online (has a price) | **59** |
| Listed without a price (quote only) | 3: GA-OV-5 Pro (5426), Rad 0 (5499), Reed Diffusers & Candles (5500) |
| Marked in stock | 62 |
| With a product image | 62 |
| Oil price range (500 ml) | AED 204–345 |
| Diffuser price range | AED 190–6,250 |

The Electronics categories that appear in the store menu contain no published products, so the Store API does not return them. The shop does not invent entries for them.

### Volumes

Variable oils list up to four volumes: 100, 250, 300 and 500 ml. **Only the 500 ml option has a price and is purchasable.** Checked directly on four products (French Open 5234 and Arabic Coffee 5390: 100 ml = price 0, not purchasable; 500 ml = AED 237 and AED 280, purchasable). The build-time sync re-reads every variation, so a change on the store shows up at the next build.

So the site shows **"AED 280 · 500 ml"**, not a "from" price or a range. The earlier Phase A wording ("Volumes 100–500 ml") was wrong and has been removed.

## 3. Reconciliation findings (for the store owner, not fixed here)

These are differences between store listings, or between the store and the published scent collection. The concept site handles each honestly, as described. **Correcting the listings needs authorised WordPress access** (doc 16).

| # | Finding | How the site handles it |
|---|---|---|
| 1 | Two listings named **WHITE BEACH**: 5239 (simple, AED 285) and 5254 (variable, AED 204) | Both shown, with a flag; 5254 carries Darkness notes (see 2) |
| 2 | **Six listings carry another scent's notes**: 5240 "White Tea" → Deep Green; 5241 "Reason To Have" → Legendary Black Diamonds; 5249 → Black Tea Accord; 5254 "White Beach" → Darkness; 5385 → Magistic Lotus; 5395 → MAF Signature | The listing keeps the store's own name. Its notes and signature come from the scent whose notes they match, with a visible note saying so. Nothing is renamed |
| 3 | **Empty variation values** on Royal Flower, Luxury, Yellow Amber and Scense He; Mainsail shows "500ml/null" | The variation is shown as the store lists it. Cart hand-off uses the variation's ID, which is valid regardless of the label |
| 4 | **Three products with no price** (above) | "Request a quote", never "Add to cart" |
| 5 | **20 oils have no published notes** | No signature is generated for them. They show the store photo and "Notes not published", and the "With published notes" filter excludes them |
| 6 | Volume options without prices (row 2 above) | Only the priced volume is offered |

Of the 67 scents in the published collection, **22** are matched to a purchasable listing with the same name (`match: 'same'` in the overlay). Mismatched listings are never used for a scent's "Buy" link. White Tea is deliberately not linked, because its listing carries Deep Green's notes.

## 4. How the data flows

```
1. Audited snapshot      src/data/catalog/snapshot.ts      always available (last-known-good)
2. Build-time sync       scripts/sync-catalog.ts            → src/generated/catalog.json (git-ignored)
3. Live price refresh    /api/catalog.json (on demand)      edge-cached 10 min, stale-while-revalidate 1 day
4. Browser refresh       src/scripts/shop.ts                updates prices and the freshness label
```

**Layer 1: snapshot.** All 62 products with ID, name, slug, SKU, category, type, price, purchasability, image and variations. Used when the build cannot reach the store.

**Layer 2: build-time sync** (`npm run sync:catalog`, also run automatically before `npm run build`):
- paginates the Store API and fetches every variation (concurrency 6, 12 s timeout);
- normalises with `normalizeProduct()`, which rejects any item whose permalink is not on `globalaroma.me` or whose category is neither oils nor diffusers;
- validates with `validateCatalog()`, which rejects the whole sync on: no products; fewer than 60% of the previous count; a purchasable item without a price; implausible prices; or duplicate IDs;
- on **any** failure it deletes the generated file, warns, and exits 0. The build then uses the snapshot. A broken store response can never break a deployment or publish garbage.

Set `CATALOG_SYNC=off` to skip it (offline builds, CI). `CATALOG_ORIGIN` points it at a staging store.

**Layer 3: live refresh.** `GET /api/catalog.json` returns `{ ok: true, readAt, items: [{ id, price, purchasable, inStock }] }`: prices and availability only, nothing private. When the store is unreachable it returns `{ ok: false }` with `Cache-Control: no-store`, so a failure is never cached.

**Layer 4: freshness label.** The shop header always states where prices come from and when:
- *Build:* "Prices and stock from the Global Aroma store, as listed on 27 Nov 2026."
- *Live:* "checked just now" (green dot).
- *Stale:* if the live read fails and the build data is more than a day old, the label turns amber and says prices may have changed, with a link to the store.
- A product the live read no longer returns shows "Check on the store" instead of a price.

**Stale prices are never presented as current.**

## 5. Editorial overlay

`src/data/catalog/overlay.ts`, keyed by **WooCommerce product ID** (never by name, because names repeat):
- which collection scent supplies the notes, and whether the names match;
- the flag text shown for a mismatch;
- short summaries for diffusers (from the store's own descriptions) and an HVAC marker for ducted units.

A new store product with no overlay entry still appears in the shop with its store data, under "Notes not published". Nothing is fabricated to fill the gap.

## 6. Hand-off to the store

`buyAction()` builds links only from the store's own URL patterns:

| Product | Add to cart | Product page |
|---|---|---|
| Variable (verified 500 ml variation) | `…/product/arabic-coffee/?attribute_pa_volume=500ml&variation_id=5394&add-to-cart=5390` | `…/product/arabic-coffee/?attribute_pa_volume=500ml` |
| Simple | `…/product/<slug>/?add-to-cart=<id>` | `…/product/<slug>/` |
| No price | none: quote only | `…/product/<slug>/` |

These are WooCommerce's standard add-to-cart query parameters, the same ones its own product forms submit. The customer lands on the store's page with the item in the cart, then uses the store's own cart and checkout. **Verified against the public store's markup and Store API; no test order was placed** (doc 16 lists the owner-side check).

## 7. Tests

- `tests/unit/catalog.test.ts`: snapshot counts (62 / 48 / 14); normalisation; rejection of foreign or invalid items; validation thresholds; the live reader returning `null` on timeout, bad JSON or non-200.
- `tests/site.spec.ts`: all 62 products render; categories, search, sort and paging; every cart link matches the store pattern; unpriced items never get a cart link; the deep-linked dialog; and the freshness label when the store is unreachable.
