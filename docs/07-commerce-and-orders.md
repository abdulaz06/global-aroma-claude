# 07 — Commerce handoff: ordering, order visibility and notifications

For: the Global Aroma owner and whoever is given authorised WordPress access.
Status date: 23 Nov 2026. Nothing in this document was tested on the live WordPress admin. We had no access, and we neither placed orders nor changed the live site.

---

## 1. Architecture (unchanged by this project)

```
New concept frontend ──"Buy online ↗"──▶ existing WooCommerce product page (globalaroma.me)
                                          │ cart · checkout · payment
                                          ▼
                                  WooCommerce order record ──▶ Global Aroma staff
                                          │                      (WP admin / WooCommerce app)
                                          └── New order email ──▶ staff inbox
New concept frontend ──"Request a quote"──▶ visitor's own email/WhatsApp ──▶ info@globaldwc.com / +971 55 582 7212
```

Global Aroma is the only seller. The new site adds discovery (Shop, Scent Map, product pages) and **hands every purchase to the existing WooCommerce product page**. It does not add a checkout, payment processing, customer accounts, an order database, a CRM/ERP or a staff dashboard.

A **quote request is not an order.** The Brief opens a pre-filled draft in the visitor's own email or WhatsApp. Nothing is sent until the visitor presses send there, and the site says so.

## 2. What we know, and how we know it

| Item | Category | Basis |
|---|---|---|
| Customers can place orders on globalaroma.me | **Reported** | Client, via intermediary (23 Nov). Not tested by us. |
| Staff can see amounts paid, but not the matching order details (customer, items, quantities, date, ID, status) | **Reported symptom** | Client, via intermediary. Which screen they use is unknown. |
| Staff are not reliably told about new orders | **Reported symptom** | Client, via intermediary. |
| Products, prices, variations and permalinks in the Store API | **Confirmed (public data)** | `/wp-json/wc/store/v1/products`, read 23 Nov 2026 (see §8). |
| WooCommerce records customer, items, quantities, totals, date, ID, status and payment method on every order | **Confirmed (standard WooCommerce behaviour)** | Not inspected on this installation. |
| Cause of the visibility/notification problem | **Unknown** | Plausible causes in §5. Requires admin verification. |

## 3. Where staff find complete order information

**WooCommerce → Orders** (WordPress admin, `/wp-admin/`). With High-Performance Order Storage the screen is `admin.php?page=wc-orders`; with legacy storage it is `edit.php?post_type=shop_order`. The menu item is the same either way.

The list shows order number, date, status, customer and total. Opening an order shows:

| Staff need | Where it appears on a standard WooCommerce order |
|---|---|
| Order / transaction identifier | Order number in the title (e.g. "Order #1234"). Payment gateways usually add their **transaction ID** in the payment line or in **order notes** |
| Who placed it | **Billing** block (name, email, phone, address), plus **Customer** (a registered account, or "Guest") |
| What was bought, and variations | **Items** table: product name, variation (e.g. *Volume: 500ml*), SKU |
| Quantity | **Qty** column per line |
| Amount paid | Line totals, shipping, tax, **Order total**, and "Paid on <date> via <method>" when the gateway reports payment |
| When | **Date created** (date and time, in the site's timezone; check Settings → General → Timezone is set to Dubai) |
| Status | **Status** (*Pending payment*, *Processing*, *On hold*, *Completed*, *Cancelled*, *Refunded*, *Failed*) |
| History | **Order notes** (status changes, gateway messages, emails sent) |

Useful views: filter by status or date; **WooCommerce → Customers**; **Analytics → Orders** (exportable CSV with date, order number, status, customer, products, items sold, net sales).

## 4. Giving staff access without full admin rights

Use the built-in **Shop Manager** role (Users → Add New → Role: *Shop manager*). It can view and edit orders, products, customers, coupons and WooCommerce reports, but cannot install plugins, change themes or manage other administrators.

- Create one named account per person, each with their own email. No shared logins.
- Turn on two-factor authentication if a security plugin is available.
- Keep the Administrator role for the person responsible for the website.
- For phone access and push alerts, staff can sign in to the official **WooCommerce mobile app** (iOS/Android) with their own account. It shows the order list and order details, and can notify on new orders.

## 5. Plausible causes of the reported symptoms (to verify, not assume)

1. **Staff look at the payment gateway's dashboard, not WooCommerce.** Gateway portals (card processor, PayPal, Stripe, a local bank gateway) show amounts and transaction IDs but usually not products or quantities. This fits "we can see how much was paid" exactly.
2. **No staff WordPress access, or the wrong role.** Without a Shop Manager/Admin login, WooCommerce → Orders isn't available to them.
3. **The New order email is disabled, or goes to an old/test/developer address.** The public Contact page currently links to `test-sales@globalaroma.me` and `test-info@globalaroma.me` (§7). That is a separate public-facing issue and **may or may not** reflect the email settings.
4. **Email is sent but not delivered:** PHP mail blocked by the host, no SMTP, missing SPF/DKIM/DMARC, or filtered as spam.
5. **Orders stay in *Pending payment*:** if a gateway's return/callback fails, the order is never marked paid and no New order email fires, even though the gateway shows a payment.

## 6. Notification settings to inspect

**WooCommerce → Settings → Emails → New order → Manage:**
- **Enable this email notification** is ticked.
- **Recipient(s)**: current, monitored addresses for the right staff (comma-separated). Remove test, developer or former-staff addresses.
- **Subject / heading**: optional. Including `{order_number}` and `{order_date}` helps staff scan the inbox.
- Email type: HTML or plain text.

**Email sender options** (same screen): "From" address on the company's own domain (e.g. `orders@globalaroma.me` or a `globaldwc.com` address the provider allows), so receiving servers don't reject it.

**Delivery:**
- Install or check an SMTP/transactional plugin (e.g. WP Mail SMTP, FluentSMTP) connected to the company mailbox provider. Use its **email log** to see whether order emails are attempted, sent or failing.
- Check the domain's DNS for **SPF**, **DKIM** and **DMARC** for the sending domain.
- Check recipients' spam/quarantine folders.
- **WooCommerce → Status → Logs** for gateway and email errors.
- Do **not** send test emails or change settings until the owner authorises it.

## 7. Reconciling a payment with its order

When staff have a payment (amount, date, gateway transaction ID) but not the order:
1. In the gateway dashboard, open the payment. Many gateways show the WooCommerce **order number** in the description, reference or metadata (e.g. "Order #1234", or a `order_id` field).
2. In WooCommerce → Orders, search that order number, or search by the customer's email or name and match by **date and total**.
3. Open the order and check that the transaction ID in the payment line or order notes matches the gateway's.
4. If no order matches, the order may be *Pending payment*/*Failed* while the gateway shows success (callback problem, §5.5). Treat this as a configuration issue for the administrator.

Whether every payment can be matched automatically depends on how the installed gateway records references. Confirm this with a real completed order before relying on it.

## 8. Owner verification checklist

Do it together with the owner, using an **existing completed order**. Redact customer details in any notes or screenshots shared outside the company. No new purchases, no live changes, no test emails without authorisation.

| # | Check | Pass when |
|---|---|---|
| 1 | A valid customer order exists in WooCommerce → Orders | It's listed with a number, date and status |
| 2 | It identifies the customer | Billing name, email and phone are present |
| 3 | Products and quantities are correct | Items table matches what the customer bought, including volume |
| 4 | Amount and time are recorded | Total, payment method and date/time (Dubai timezone) are present |
| 5 | The right staff can access it | Each named staff member opens it with their own Shop Manager login (or the mobile app) |
| 6 | New-order notifications reach the right people | The New order email setting lists the correct recipients, the SMTP log shows it sent, and staff confirm receipt for a recent order (or one authorised test) |
| 7 | Payment reconciles with the order | The gateway transaction for that order is found and matches by order number or transaction ID, date and total |

Record the result of each row (pass / fail / not checked) before deciding what to change.

## 9. Public store issues found (independently verified, 23 Nov 2026)

| Issue | Where | Effect |
|---|---|---|
| "Quick help" email links point to `test-sales@globalaroma.me` and `test-info@globalaroma.me` | Contact page | Customer emails may go nowhere. Not proven to relate to order notifications |
| Scent Boxes "Buy now" goes to `/scent-boxes/PASTE-BUY-NOW-URL-HERE`; two gallery images are also placeholders | Scent Boxes page | The sampler can't be bought online, so the concept treats it as quote-only |
| ~22 unrelated electronics categories (HDMI, Drones, Cell Phones…) in shop navigation | Store sidebar/menus | Confusing; erodes trust |
| Facebook publisher tag `facebook.com/ColomboMarket` | Site metadata | Template leftover |
| All variable oils share one image (`Untitled-design-2.png`) | Product pages | The concept's scent signatures give each one a distinct image |
| Variable oils return no price range, so each volume appears to be listed at the same price | Store API | Owner should confirm per-volume pricing. The concept shows the listed price without "from" |
| SCENSE HE, YELLOW AMBER and LUXURY list three empty volume values and only 500 ml; ROYAL FLOWER lists one empty value and 500 ml | Store API variations | Possible misconfigured variations |
| Two products named WHITE BEACH: `white-beach` (simple, AED 285) and `white-beach-2` (variable, AED 204) | Store | Concept links to `white-beach`; owner to pick one |
| GA-OV-5 Pro, Rad 0, "Reed Diffusers & Candles" have no price | Diffusers | Concept shows "Price on request" and links to the product page |
| "Get in touch" buttons on product pages and the Contact form's "Send a message" link to `#` | Product and Contact pages | Dead ends |

## 10. What the concept frontend does about all this

- Every "Buy online ↗" opens the product's own WooCommerce page, so orders keep landing in the one system that records them.
- Prices shown are the store's listed prices on 23 Nov 2026. Missing prices say "Price on request", and the sampler is quote-only.
- Pages say plainly that checkout happens on globalaroma.me, and never say an order or quote has been sent or received.
- The Brief prepares a quote request (who, contact, space, shortlist) for the visitor to send from their own app.

## 11. Possible later improvements (need admin access and approval)
- "Add to cart" deep links (`/?add-to-cart=<product ID>&variation_id=<ID>`) once product and variation IDs are confirmed.
- Per-volume prices on the Shop page once variation pricing is fixed.
- A store cleanup pass covering §9.
