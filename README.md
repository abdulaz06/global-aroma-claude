# Global Aroma — website, shop, staff workspace and social kit

**Unofficial design concept for Global DWC LLC (Global Aroma · Global Hospitality · Global Technology), pending owner approval.** Not the official website. The build is `noindex` everywhere.

A fully static Astro site in the **"Lines of atmosphere"** direction: one 1 px line drawn three ways (Aroma *flows*, Hospitality *weaves*, Technology *switches*). Every fragrance in the published collection gets a generated **signature** drawn from its own notes. The same engine renders the website, the Scent Map, the social templates, the Open Graph cards and a motion reel.

## What's here

| Route | Purpose |
|---|---|
| `/` | Photo hero with a signature, three divisions, Scent Finder, featured products, spaces served |
| `/aroma` | 67 fragrances (finder, map, searchable library, detail view), diffusers, home fragrance, scent box, signature scent |
| `/hospitality`, `/technology` | Division offers, categories to add to a brief |
| `/shop` | All 62 store products from a dated snapshot: search, filters, sort, details; every purchase continues on the official store |
| `/brief` | Quote request builder: opens a pre-filled email or WhatsApp draft |
| `/contact` | Verified company contacts |
| `/review` | Owner review guide: a short tour linking every demonstration (remove at launch) |
| `/staff-demo` | **Demonstration** Staff Workspace with synthetic orders and a four-step walkthrough (noindex) |
| `/studio`, `/studio/reel`, `/studio/make` | Unlisted social studio, reel stage and content maker (noindex) |
| `/sig/<slug>.svg` | Each fragrance's signature as a standalone SVG |

## Run it

```bash
npm ci
npm run dev          # http://localhost:4321
npm run build        # static output in dist/
npm run preview      # serve dist/ (restart with `npx astro preview stop` after rebuilding)
npm run check        # type check
npm run test:unit    # catalogue and staff-guard unit tests
npm test             # Playwright (desktop + mobile Chromium; WEBKIT=1 adds WebKit)
npm run social       # render social/out/*.png and public/og/*.png from src/social/plan.json
npm run reel         # render social/out/reel-*.mp4 (needs ffmpeg)
```

Set `CHROME_PATH=/path/to/chrome` to use a system Chrome instead of Playwright's download.

### Environment variables

Only `PUBLIC_SITE_URL` (optional; defaults to `https://global-aroma-website.vercel.app`). The staff connector variables (`STAFF_LIVE_ENABLED`, `WC_API_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`) are **not used** by this static demonstration and must stay unset.

## Where things live

```
src/data/            company facts, divisions, scent collection (all sourced; see docs/01)
src/data/catalog/    verified, dated store snapshot + editorial overlay keyed by product ID
src/lib/catalog/     types, normalisation and validation, buy links, source selection
src/lib/server/      prepared, not deployed: staff guard and read-only orders client for a future authorised integration (doc 12)
src/staff/           order model, demo source, WooCommerce mapper
src/lib/             signature engine, accord rules, map placement, line patterns, hero field
src/components/      ScentMap, ScentFinder, ProductCard, ScentCard, DivisionPage, staff/StaffApp, …
src/pages/           routes (incl. api/)
src/scripts/         client scripts (brief store, scents UI and finder, shop)
src/social/plan.json   every social frame and OG card
scripts/         social and reel renderers
tests/           Playwright e2e (site.spec.ts) and unit tests (tests/unit)
docs/            research, direction, design system, decisions, social kit, approvals, commerce, QA, comparison
```

**Updating content:** edit `src/data/*.ts`. Adding a scent to `scents.ts` gives it a signature, a map position, a library card and an SVG automatically.

## Deploy (Vercel)

Project **`global-aroma-website`** (scope `uhbdul`), Production at **https://global-aroma-website.vercel.app/**. `vercel.json` pins the framework (Astro), build command (`npm run build`) and output directory (`dist`), so a dashboard override can't break it. Production deploys from `main`; see [docs/17-deploy.md](docs/17-deploy.md).

`vercel.json` sends `X-Robots-Tag: noindex`, every page has a `noindex` meta tag, and `robots.txt` disallows everything. Keep these, and the unofficial-concept labels, until the owner authorises a launch. Don't attach the company's domain.

## Commerce scope

Global Aroma's existing WooCommerce store stays the only checkout and order system. This project adds no payments, accounts, server routes or order database. See docs 07, 11–14.

## Documentation
1. [Research](docs/01-research.md) · 2. [Creative direction](docs/02-creative-direction.md) · 3. [Design system](docs/03-design-system.md) · 4. [Decisions](docs/04-decisions.md) · 5. [Social kit](docs/05-social-kit.md) · 6. [Owner approvals](docs/06-owner-approvals.md) · 7. [Commerce handoff](docs/07-commerce-and-orders.md) · 8. [QA report](docs/08-qa.md) · 9. [Comparison with the Codex concept](docs/09-competitive-review.md) · 10. [Scope & next steps](docs/10-scope.md)

**Phase B:** 11. [Catalogue audit & sync](docs/11-catalogue.md) · 12. [Staff integration & security](docs/12-staff-integration.md) · 13. [Notification troubleshooting](docs/13-notification-troubleshooting.md) · 14. [Migration plan](docs/14-migration.md) · 15. [Commercial breakdown](docs/15-commercial.md) · 16. [Owner onboarding & access](docs/16-owner-onboarding.md) · 17. [Deploying](docs/17-deploy.md)
