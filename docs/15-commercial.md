# 15 — Commercial breakdown

This separates what the concept **demonstrates** from what a paid engagement would **deliver to production**, so each piece can be agreed, priced and approved on its own. Effort is in working days for one developer, assuming prompt approvals and access. **Fees are left to be set** by applying an agreed day rate or fixed price to each package. The early discussion was about AED 500 for basic website work, and the full set below is substantially more than that.

The principle throughout: **the simplest architecture that reliably does the job.** WooCommerce stays the store. No custom checkout, payments, order database, CRM or ERP.

## Packages

| # | Package | Already demonstrated | Remaining to production | Effort | Depends on |
|---|---|---|---|---|---|
| 1 | **Website redesign** | Full site: 7 public routes, scent signatures, map, finder, brief builder, responsive, accessible, tested | Official logo, approved photography and copy; one revision round; remove concept labels and `noindex`; analytics decision | **3–5 days** | Owner approvals (doc 06/16) |
| 2 | **Catalogue integration** | All 62 products, build-time sync with validation and fallback, live price refresh, freshness label, cart hand-off | Re-run sync against the live store at launch; adjust the overlay after store fixes (package 3); production cache settings | **1–2 days** | Package 3 ideally first |
| 3 | **Store configuration and cleanup** | Audit and reconciliation list (doc 11 §3, doc 07 §9) | Fix duplicates, misattributed notes, empty variations, unpriced items, test email addresses, placeholder links and leftover categories in WordPress | **1–2 days** | Authorised WP admin |
| 4 | **Order notifications and staff access** (Option A) | Troubleshooting plan (doc 13), verification checklist (doc 07 §8), staff demo showing the target experience | Run doc 13: enable *New order*, recipients, SMTP, DNS records, gateway callback; Shop manager accounts; staff walkthrough | **0.5–1 day** (more if gateway or email issues are deep) | WP admin, mail provider, gateway dashboard |
| 5 | **Optional: read-only staff interface** (Option B) | Interface, adapter, fail-closed guard and connector (doc 12) | Identity provider integration, staff allow-list, separate deployment, security review, staging test | **4–7 days** | Package 4 done; decision that A isn't enough; identity provider |
| 6 | **Social branding** | 29-frame kit, reel, safe-zone proofs, studio, content maker | Approved photos into the photo templates; first month's planned posts rendered; 30-minute staff handover of the content maker | **1–2 days** | Approved photography |
| 7 | **Production migration** | Plan (doc 14) | Option 1: domain and DNS only (**0.5 day**). Option 2: staging, cut-over and redirects (**2–3 days**) | **0.5–3 days** | Hosting/DNS and WP admin |
| 8 | **Maintenance** (monthly, optional) | — | Dependency updates, catalogue overlay updates for new products, broken-link and uptime checks, small content edits | **~0.5–1 day / month** | — |

**Not in any package unless separately agreed:** Arabic (RTL) version, commissioned photography, ongoing social content production or account management, ad buying, custom notification software, rebuilding the store.

## Third-party costs (paid by the company, directly to the provider)

| Item | Needed for | Cost (check at purchase) |
|---|---|---|
| Hosting for the new frontend (Vercel) | Packages 1, 7 | Vercel's **Hobby** plan is for personal, non-commercial use, so a business site needs **Pro**: currently **US$20 per member per month** plus usage beyond the included allowance |
| Existing WordPress hosting | Store (unchanged) | Already paid |
| Domain | Already owned | Unchanged |
| SMTP / transactional email | Package 4 | Often included with the company's mail provider; otherwise a transactional email service, many with free or low-cost tiers |
| Identity provider | Package 5 only | Usually covered by existing Microsoft 365 / Google Workspace; otherwise a managed auth service's small-team tier |
| WooCommerce mobile app | Package 4, optional | Check current terms |

## Suggested order

1. **Package 4** first: it fixes the reported business problem with the least effort and no new software.
2. **Package 3**, then **1 + 2** with **7 (Option 1)**: the new site live on a subdomain, store untouched.
3. **Package 6** once photography is approved.
4. **7 (Option 2)** when the store is clean and stable.
5. **Package 5** only if staff still need it after step 1.

## What the owner gets at each step

- After 4: staff are told about every order and can open it themselves.
- After 3 + 1 + 2 + 7 (Option 1): customers browse a modern site with current prices and buy through the existing checkout.
- After 6: staff can make on-brand posts without a designer for each one.
- After 7 (Option 2): one primary address, with every old link still working.
