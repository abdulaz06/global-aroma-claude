# 16 — Owner onboarding: status and access checklist

## 1. What is working, what is a demo, what needs your access

| Area | Status | Notes |
|---|---|---|
| Website design and pages | **Working** (concept, `noindex`) | Seven public routes; labelled "Unofficial concept" |
| Shop: all 62 products, search, filters, sort | **Working** | Prices from the official store, with a freshness label |
| Add to cart → store checkout | **Working**, hand-off only | Opens globalaroma.me's own cart. No test order was placed |
| Live price refresh | **Working**, falls back safely | If the store can't be reached, the page says so and shows the last known prices |
| Scent Finder, map, library, signatures | **Working** | Matches by published notes only |
| Brief / quote request | **Working** | Opens the visitor's own email or WhatsApp with a draft; it is never "sent" by the site |
| Staff Workspace (`/staff-demo`) | **Demo** | Synthetic orders only; not connected to WooCommerce |
| Example *New order* email | **Demo** | Shows what WooCommerce sends; no email is sent |
| Read-only live orders connector | **Built, disabled** | Fails closed; needs authorisation, credentials and a real staff sign-in (doc 12) |
| Webhooks for instant updates | **Designed only** | Doc 12 §5 |
| *New order* email delivery | **Needs your access** | Doc 13 |
| Staff WordPress accounts | **Needs your access** | Shop manager role per person |
| Store listing fixes | **Needs your access** | Doc 11 §3, doc 07 §9 |
| Payment ↔ order reconciliation | **Needs your access** | Depends on the gateway; confirm with real orders (doc 07 §7) |
| Social kit and content maker | **Working** | Photo templates use concept images until approved photos are supplied |
| Production domain | **Needs your approval** | Doc 14 |

## 2. What we need from you

Share these through secure channels only, never as plain text in email or chat. Where a login is needed, **create a separate account for the person doing the work**, so it can be removed afterwards; don't share your own password.

| # | Item | Why | Format |
|---|---|---|---|
| 1 | **Branding assets**: official logo (vector: SVG/AI/EPS/PDF), brand colours and fonts if defined | Replace the concept's placeholder mark | Files |
| 2 | **Approved photography**: products, installations, team or premises you have rights to use | Replace "Concept image" photos on the site and in social templates | Files + confirmation of usage rights |
| 3 | **Confirmed company information**: legal name, address, phone, WhatsApp, emails, trade licence details you want shown, opening hours | Contact page, footer, structured data | Written confirmation |
| 4 | **Authorised WordPress/WooCommerce admin review**: a temporary *Administrator* account for the person doing docs 07/11/13, removed afterwards | Notifications, store fixes, staff accounts | Account invite to their email |
| 5 | **Payment gateway information**: which gateway(s) are installed and who can log in to the merchant dashboard | Doc 13 Step 5, reconciliation | Name of gateway; dashboard access by screen-share or a delegated user |
| 6 | **Staff roles and monitored recipients**: who handles orders, their work emails, which shared mailbox should receive *New order* | Shop manager accounts; email recipients | List |
| 7 | **Mail provider**: who hosts company email (Microsoft 365, Google Workspace, other) and who manages DNS | SMTP and SPF/DKIM/DMARC | Names; DNS access only if needed |
| 8 | **Secure credentials, only if needed**: a read-only WooCommerce REST key, **only** if Option B (doc 12) is approved | Live staff interface | Entered by you directly into the hosting provider's encrypted settings, never sent |
| 9 | **Decisions**: production option (doc 14), Option A vs B (doc 12), analytics yes/no | Planning | Written confirmation |

## 3. What happens with access

1. We agree in writing what will be changed, and when.
2. Backups first (doc 13 Step 0).
3. Changes are made one at a time and recorded.
4. Results are checked against doc 07 §8, row by row.
5. Temporary accounts are removed and you get a short written summary.

**Never done without your explicit approval:** placing orders, sending emails to customers, changing prices, refunds or cancellations, changing payment settings, or deleting anything.
