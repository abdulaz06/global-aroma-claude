# 14 — Going to production without breaking the store

**Goal:** put the new frontend in front of customers while WooCommerce keeps doing everything it does now: product pages, cart, checkout, payments, customer accounts, order records and emails.

**Status:** a plan. Nothing here has been done. Every option needs the owner's approval, and Options 2–3 need hosting/DNS access and a WordPress administrator.

## 1. What must keep working (the preservation list)

| What | Typical paths / items | Why it matters |
|---|---|---|
| Product pages | `/product/<slug>/` (62 products) | Search engines, shared links, the new site's cart hand-off |
| Shop and category archives | `/shop/`, `/product-category/…` | Existing links and rankings |
| Cart and checkout | `/cart/`, `/checkout/`, `/checkout/order-received/…` | Orders |
| Customer accounts | `/my-account/…`, password reset links | Returning customers |
| Payment gateway return and callback URLs | `/?wc-api=…`, `/wc-api/…`, `/wp-json/…` and plugin-specific endpoints | Orders are marked paid only when these arrive (doc 13 Step 5) |
| Sessions | WooCommerce session and cart cookies (`wp_woocommerce_session_*`, `woocommerce_cart_hash`, `woocommerce_items_in_cart`) | A cart must survive between the hand-off and checkout |
| Admin and APIs | `/wp-admin/`, `/wp-login.php`, `/wp-json/` (Store API used by the catalogue sync) | Staff and the sync |
| Emails | WooCommerce's transactional emails and their links | Customers and staff |
| Media | `/wp-content/uploads/…` | Product images used by both sites |

## 2. Options

### Option 1 — New site on its own subdomain; store untouched (lowest risk)

`www.globalaroma.me` or a chosen subdomain (e.g. `new.`) serves the new site. `globalaroma.me` stays WordPress exactly as now. The new site's Shop hands off to the store's own URLs, as it already does.

- **Store changes:** none. **Gateway changes:** none. **Session risk:** none.
- **Downside:** two addresses. The store's own home and menu pages still show the old design unless they redirect to the new site, which is a small, reversible WordPress change.
- **Good as:** the first production step, while the store's issues (docs 07, 11, 13) are fixed.

### Option 2 — New site on the main domain; store moves to `shop.globalaroma.me` (recommended end state)

The main domain serves the new site; WordPress moves to a subdomain; old store URLs redirect permanently.

- **Store changes:** WordPress *Site Address* and *WordPress Address* become `https://shop.globalaroma.me`, and stored URLs are updated with a proper search-replace that handles serialized data (e.g. `wp search-replace`). Done on a **staging copy first**.
- **Redirects** on the new site (Vercel): `/product/*`, `/product-category/*`, `/shop/*`, `/cart/*`, `/checkout/*`, `/my-account/*`, `/wp-content/uploads/*` → the same path on `shop.` with **301**. Customers' and search engines' old links keep working.
- **Gateway:** update the webhook/notification URL in each gateway's dashboard to the new host, then confirm live delivery with one real or gateway-sandbox transaction. *(WooCommerce generates return URLs from the site address automatically; dashboard-registered webhooks don't update themselves.)*
- **Sessions:** carts in progress at the moment of cut-over are lost once. Do it at a quiet hour. Accounts and orders are unaffected (same database).
- **Emails:** sender domain and links follow the new site address. Re-check SPF/DKIM if the sending host changes.
- **Catalogue sync:** set `CATALOG_ORIGIN=https://shop.globalaroma.me`.

### Option 3 — One domain, split by path at the edge (not recommended now)

An edge proxy (e.g. CDN rules) sends WordPress paths to the WordPress server and everything else to the new site, all under `globalaroma.me`.

- Keeps every URL identical, but WordPress must see the correct host behind the proxy, and caching must never touch cart, checkout or account pages.
- Gateway callbacks and cookies pass through a proxy, so every gateway needs testing. Mistakes show up as lost carts or unpaid orders.
- **More moving parts than this business needs.** Revisit only if Option 2's redirects prove a problem.

## 3. Cut-over checklist for Option 2

**Before (on a staging copy):**
1. Full backup; confirm a restore works.
2. Clone the site to staging (`staging.shop.globalaroma.me`) with the gateway in **test/sandbox** mode and outgoing email captured, not delivered.
3. Change the addresses, run the search-replace, and fix mixed-content or hard-coded URLs.
4. Test on staging: browse → add to cart from the new site → cart → checkout with a sandbox payment → order appears as *Processing* → *New order* email captured → order visible to a Shop manager → customer account login and password reset.
5. Prepare the redirect list (generated from the catalogue: 62 product URLs plus the patterns above) and test it against staging.

**Cut-over (quiet hour, about 1–2 hours):**
1. Put WooCommerce in maintenance mode, or close the store briefly.
2. Final backup.
3. Point `shop.` DNS at the WordPress host, issue TLS, and change the addresses on live WordPress.
4. Update each gateway's webhook/notification URL.
5. Deploy the new site to the main domain with redirects active; remove `noindex` and the concept labels (owner approval required).
6. Smoke test: three product redirects, add to cart, checkout page loads, `/my-account/` loads, `/wp-admin/` loads, Store API responds.
7. Reopen the store.

**After:**
- Watch the first real orders end-to-end (status, email, staff visibility).
- Submit the new sitemap; watch Search Console for 404s for two weeks.
- Keep the old WordPress address settings recorded for rollback.

**Rollback:** restore the WordPress addresses (or the backup), remove the main-domain deployment, and repoint DNS. With Option 2 the database isn't touched beyond URLs, so rollback is quick.

## 4. What the new frontend already does to make this safe

- It never takes payments or stores orders; it only links to the store's own URLs (doc 11 §6).
- Product links come from the store's own permalinks via the catalogue sync, so moving the store means setting `CATALOG_ORIGIN`, updating the store links in `src/data/company.ts`, and rebuilding. The sync accepts `globalaroma.me` and its subdomains only. Links in the bundled snapshot still use the old addresses, which the redirects cover.
- Catalogue sync failures fall back to the last known good data, so a store outage or migration hiccup can't break the site.
