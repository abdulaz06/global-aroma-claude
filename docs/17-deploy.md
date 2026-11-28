# 17 — Deploying the owner demonstration

| | |
|---|---|
| Repository | `abdulaz06/global-aroma-website`, branch `phase-b` → merged into `main` |
| Vercel project | `global-aroma-website` (account `abdulaz06`, scope `uhbdul`) |
| Production | https://global-aroma-website.vercel.app/ (deploys from `main`) |
| Architecture | Fully static Astro build in `dist/` — no server functions, no environment variables |
| Preserved | Tags `phase-a-independent`, `phase-a-checkpoint` (`a0019ec`); history is never rewritten |

`vercel.json` pins `framework: astro`, `buildCommand: npm run build` and `outputDirectory: dist`, matching the original working configuration, so a dashboard Output Directory override can't break the build. Node 20 or newer (the project default on Vercel is fine).

**Never set** `STAFF_LIVE_ENABLED`, `WC_API_URL`, `WC_CONSUMER_KEY` or `WC_CONSUMER_SECRET`. The demonstration doesn't read them, and no live order access may be deployed publicly.

## After a deployment

1. `https://global-aroma-website.vercel.app/` opens without a Vercel login (Settings → Deployment Protection: Production must not require Vercel Authentication).
2. Response headers include `x-robots-tag: noindex, nofollow, noarchive`.
3. `/review` links to the website, fragrance discovery, Shop, Staff Workspace and Content Maker.
4. `/shop` shows 62 products and the line "Products and prices as listed on the Global Aroma store on 28 November 2026".
5. `/staff-demo`: run the four walkthrough steps; nothing is sent.
6. `/studio/make`: download a PNG.
7. `/api/staff/orders.json` returns 404.
8. The deployment's commit in Vercel matches the `main` commit on GitHub.

Don't place orders, send emails or submit enquiries while checking.
