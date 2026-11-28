# 12 — Staff order visibility: demo now, integration later

**Today:** `/staff-demo` is a **public demonstration with synthetic data only**. It is not connected to WooCommerce, has no login, and every screen carries the label *"Demonstration — sample data only. Not connected to live customer orders."*

**Live access is disabled.** The read-only connector exists in code but fails closed. It cannot be switched on by a flag or a hidden URL: it also needs real credentials **and** a real staff sign-in, and the sign-in deliberately has no implementation until the company chooses one.

## 1. What staff need (from the client requirement)

When an order arrives, staff should see: that it arrived (awareness); **who** (customer, contact, delivery city); **what** (products, variation, quantity); **how much** (line totals, shipping, VAT, total); **when**; the **order ID**; and **status** (payment and fulfilment). They also need to find an order later.

The demo shows all of this:

| Area | In the demo |
|---|---|
| Awareness | "Simulate new order" adds an order, shows a toast and a bell count, raises the "New / unopened" counter, and logs it in Activity |
| Overview | New/unopened, to fulfil, awaiting payment, payments today, last 7 days |
| List | Status tabs with counts; search by order number, customer, email, phone or product; date range; sort; table on desktop, cards on phones |
| Detail | Customer (marked *Sample*), items with variation, SKU, quantity, unit and line totals; subtotal, shipping, VAT, total; payment status, method and reference; history; customer note (read-only) |
| Notification | "Example email": what WooCommerce's own *New order* email contains. Clearly labelled; **no email is sent** |
| Reset | Restores the seeded data |

**Synthetic data rules:** names are "First I."; emails use `example.com` (reserved for documentation, RFC 2606); phones are `+971 50 000 0xxx`; order numbers are `D-####`; transaction references read `SAMPLE-TXN-…`. The data is generated deterministically in the browser and kept in `localStorage`. Nothing is sent anywhere. Tests check that no other email domain appears.

## 2. Two ways to give real staff this view

### Option A — WooCommerce's own screens (recommended first)

WooCommerce already records each order with everything in section 1, and shows it in **WooCommerce → Orders**. The gap the client reported is about *access* and *awareness*, not missing data:

1. Give each staff member their own WordPress account with the **Shop manager** role (orders and products, no site administration), not a shared admin login.
2. Fix *New order* email delivery and recipients (doc 13).
3. Optionally install the official **WooCommerce mobile app** for push notifications of new orders. *(Confirm current availability and terms at setup time.)*

**Cost:** configuration only. **Risk:** lowest; nothing new to secure. **Limits:** WordPress admin look and feel, and access is broader than "view orders".

### Option B — a read-only custom interface (the demo, connected)

The demo's interface backed by real orders, for teams that want a simpler, view-only screen.

```
Browser (staff) ──HTTPS──▶ /staff (server-rendered, behind sign-in)
                              │  guardStaffRequest(): enabled? configured? signed-in? role?
                              ▼
                        /api/staff/orders.json (server only, no-store)
                              │  WooCommerce REST v3, READ-ONLY key, Basic auth over TLS
                              ▼
                        globalaroma.me/wp-json/wc/v3/orders
```

**Cost:** an identity provider, a server function, and security review. **When it's worth it:** many staff, need for a cleaner view, or a wish to keep staff out of WordPress admin.

**Recommendation:** start with **A**. Move to **B** only if A proves insufficient after doc 13's fixes.

## 3. The shared adapter

Both the demo and a future live view use one model, so the interface needs no changes to switch source:

- `src/staff/types.ts`: `Order`, `OrderLine`, `OrderEvent`, `OrderQuery`, and the `OrderSource` interface (`list`, `get`).
- `src/staff/demo-source.ts`: `DemoOrderSource` (synthetic, browser-only).
- `src/staff/woocommerce.ts`: `mapWooOrder(raw, notes)` maps a WooCommerce REST v3 order (and its notes) into `Order`. It takes billing name and contact, line items with variation meta (skipping private `_` keys), GMT timestamps, payment method title and transaction ID. **Card or payment meta is never mapped.** Covered by a fixture test.
- `src/lib/server/woo-orders.ts`: `fetchRecentOrders()`. GET only; never logs request or response bodies.

## 4. Security design (built in, enforced on the server)

| Requirement | How |
|---|---|
| No credentials in browser code | WooCommerce keys are read only inside server modules (`src/lib/server/*`) from `process.env`. Nothing under `src/lib/server` is imported by client scripts |
| No secrets in public env vars | Names are `WC_API_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`, `STAFF_LIVE_ENABLED`. Never `PUBLIC_*`, which Astro would expose to the browser |
| No credentials in Git | `.env*` is git-ignored; values live only in Vercel's encrypted project settings |
| Fails closed | `guardStaffRequest()`: not enabled → 404; no HTTPS URL or keys → 503; no verified staff session → 401; wrong role → 403. `verifyStaffSession()` returns `null` until a real provider is integrated and reviewed |
| A flag or hidden route isn't enough | All four checks must pass. Tests send forged `Authorization` and custom headers and still get refused |
| Server-side permissions | Checked in the endpoint on every request, not by hiding buttons |
| Least privilege | WooCommerce key with **Read** permission, belonging to a dedicated user with the minimum role. Never an administrator's key |
| No caching of private data | `Cache-Control: private, no-store, max-age=0`, `Vary: Authorization, Cookie`, `X-Robots-Tag: noindex`. The route is on-demand (`prerender = false`), so it can never be baked into a static build |
| No sensitive logging | No request or response bodies logged; errors return a reason code only |
| Read-only | Only `GET` is implemented; every other method returns 405. No editing, refunds, cancellations or payment changes |
| Demo kept separate | `/staff-demo` never calls `/api/staff/*` and imports nothing from `src/lib/server` |
| Never live on the public demo | The concept deployment sets none of the live variables; `STAFF_LIVE_ENABLED` must stay unset there |

**Before Option B could go live (all required):**
1. The company's written authorisation and a named owner for the integration.
2. An identity provider chosen (e.g. the company's Microsoft 365 / Google Workspace via OIDC, or a managed auth service). It must support named accounts, MFA and immediate revocation.
3. `verifyStaffSession()` implemented against it, with an allow-list of staff and a role check, then reviewed.
4. A dedicated read-only WooCommerce key, created by the owner and entered directly into Vercel's encrypted environment settings. Never sent by email or chat.
5. Deployment to a **separate** project and domain from the public concept.
6. Testing against a staging copy of the store or test orders, not real customer data.

## 5. Real-time awareness (designed, not built)

For instant updates in Option B, WooCommerce **webhooks** can push `order.created` and `order.updated` to a server endpoint.

- **Verify every delivery:** `X-WC-Webhook-Signature` is a base64 HMAC-SHA256 of the raw body, keyed with the webhook secret. Compare with a constant-time check, and reject anything unsigned (WooCommerce's activation ping is unsigned).
- **Respond 2xx quickly**, then process. WooCommerce disables a webhook after about five consecutive failed deliveries and sends no alert. Monitor webhook status, and after an outage reconcile by reading recent orders through the REST API.
- **Idempotency:** key processing on order ID plus `X-WC-Webhook-Delivery-ID`, and treat the REST API as the source of truth. A webhook only says "something changed; re-read order N".
- **Privacy:** a webhook payload contains the full order (billing address, email, phone). Store nothing beyond what the view needs, keep it out of logs, and set a retention period.
- **No delivery to the public demo**, ever.

Polling the REST API every minute or two from the signed-in page is a simpler alternative with no inbound endpoint. It is adequate for a small team.

## 6. Files

```
src/pages/staff-demo/index.astro        public demo page (noindex)
src/components/staff/StaffApp.tsx       interface (Preact island)
src/styles/staff.css
src/staff/{types,demo-source,woocommerce}.ts
src/lib/server/staff-guard.ts           fail-closed guard + private headers
src/lib/server/woo-orders.ts            read-only REST client
src/pages/api/staff/orders.json.ts      disabled endpoint (404 unless every check passes)
tests/unit/staff.test.ts                guard matrix, endpoint, mapper, synthetic-data rules
tests/fixtures/woo-order.json           invented REST-shaped order for the mapper test
```
