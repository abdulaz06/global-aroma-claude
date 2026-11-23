# 07 — Commerce, orders and notifications

## Decision
The concept keeps **Global Aroma's existing WordPress/WooCommerce store** (globalaroma.me) as the only place where customers pay and orders are recorded. Global Aroma is the seller; there are no third-party vendors.

The new site is the **discovery layer** in front of it:

| Journey | Where it happens | Status |
|---|---|---|
| Browse scents, oils, diffusers, sampler | New site (`/shop`, `/aroma`) | Built |
| Product page, cart, checkout, payment | Existing WooCommerce store (each "Buy online ↗" links to the product's own store page) | Existing. Per the client, **customers can place orders successfully** (reported 23 Nov 2026, not tested by us) |
| Order record (date, customer, items) | WooCommerce → Orders, in WordPress admin | Existing (standard WooCommerce behaviour), **not inspected by us** |
| Company notified of a new order | WooCommerce "New order" email | **Not working: confirmed client issue** (see below) |
| Quotes for services, volumes, Hospitality, Technology | New site's Brief → the customer's own email/WhatsApp app → info@globaldwc.com / +971 55 582 7212 | Built. Delivery to the company inbox not verified |

**Explicitly out of scope:** custom checkout, payment processing, backend, order database, customer accounts, CRM/ERP, inventory sync, seller dashboards. None was built.

## The confirmed requirement
Global Aroma wants to know, for every order: **when** it was placed, **who** placed it, and **what** was ordered.

WooCommerce already records all three on every order, and its built-in **New order** email sends them to the shop: order number and date, the customer's billing details, line items and totals. So the likely fix is configuration and email delivery, not new software. It needs **authorised WordPress admin access**. We have not accessed or changed the live site.

## Troubleshooting guide (for whoever gets WordPress admin access)
Work through these in order; most cases stop at step 2 or 4.

1. **Confirm the orders exist.** WooCommerce → Orders. Recent orders should be listed with date, customer and items. If they are, the store works and only notification is broken. In the meantime, this screen is where staff can see every order.
2. **Check the New order email.** WooCommerce → Settings → Emails → *New order*:
   - **Enabled** is ticked.
   - **Recipient(s)** is a real, monitored inbox (for example info@globaldwc.com and bdm@globaldwc.com, comma-separated). The template default is the WordPress admin email, which may be a developer's or a test address. Note: the current Contact page links to `test-sales@globalaroma.me` and `test-info@globalaroma.me`, which suggests test addresses may also be set here.
   - Email type is HTML or plain text, either is fine.
3. **Check the sender.** WooCommerce → Settings → Emails → *Email sender options*. "From" address should be on the site's own domain (e.g. `orders@globalaroma.me`); a Gmail/Outlook "From" address is often rejected by receiving servers.
4. **Fix delivery (the most common cause).** By default WordPress sends mail through the web server's PHP `mail()`. Many hosts block it, or mail sent that way lands in spam. Install a reputable SMTP plugin (e.g. WP Mail SMTP or FluentSMTP) and send through the company's real mail provider (Google Workspace, Microsoft 365, Zoho, or a transactional service). Use the plugin's **test email** to the recipient address.
5. **Domain authentication.** In the domain's DNS, make sure SPF, DKIM (from the mail provider) and a DMARC record exist for the sending domain. Without them, order emails are likely to be marked as spam or rejected.
6. **Check spam/quarantine** at the recipient: Gmail spam, Microsoft 365 quarantine, any company mail filter.
7. **Check order status triggers.** The New order email fires when an order moves to *Processing* or *On hold* (and certain pending→completed transitions). If a payment gateway leaves orders in *Pending payment* (e.g. abandoned or failed redirects), no email is sent. Look at the statuses of recent orders in step 1.
8. **Look at the logs.** WooCommerce → Status → Logs, and the SMTP plugin's email log (if enabled), show whether an email was attempted and why it failed.
9. **Optional backups (no custom code):** the official WooCommerce mobile app (iOS/Android) gives push notifications for new orders and an order list on a phone. A free alternative is a second recipient address on the New order email.
10. **Verify end-to-end** with one authorised test order (or the payment gateway's test mode), then delete or refund it.

## What the concept site already does about it
- Every purchase link goes to the existing WooCommerce product page, so the orders the company receives keep arriving through the one system that records them.
- The site never says orders or notifications reach the company.
- Quote requests from the Brief arrive as a structured message in the company's normal inbox or WhatsApp: who is asking, how to reach them, the space, and every shortlisted item. The email or message timestamp records when it was sent.

## Possible later enhancements (need owner approval and product IDs)
- WooCommerce "add to cart" deep links (`/?add-to-cart=<ID>`) so "Buy" can drop the item straight into the store cart. Needs the store's product IDs.
- Variation-specific links (100 / 250 / 300 / 500 ml) once per-size prices are confirmed. The Store API currently returns only a base price for variable oils.
