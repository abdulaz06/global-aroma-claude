# Global Aroma — website & brand concept

**Unofficial design concept for Global DWC LLC (Global Aroma · Global Hospitality · Global Technology), pending owner approval.** Not the official website. The build is `noindex` everywhere.

An Astro site (static pages plus two on-demand routes) in the **"Lines of atmosphere"** direction: one 1 px line drawn three ways (Aroma *flows*, Hospitality *weaves*, Technology *switches*). Every fragrance in the published collection gets a generated **signature** drawn from its own notes. The same engine renders the website, the Scent Map, the social templates, the Open Graph cards and a motion reel.

## What's here

| Route | Purpose |
|---|---|
| `/` | Photo hero with a signature, three divisions, Scent Finder, featured products, spaces served |
| `/aroma` | 67 fragrances (finder, map, searchable library, detail view), diffusers, home fragrance, scent box, signature scent |
| `/hospitality`, `/technology` | Division offers, categories to add to a brief |
| `/shop` | All 62 store products: search, filters, sort, detail dialog, add to the store's own cart |
| `/brief` | Quote request builder: opens a pre-filled email or WhatsApp draft |
| `/contact` | Verified company contacts |
| `/staff-demo` | **Demonstration** Staff Workspace with synthetic orders (noindex) |
| `/studio`, `/studio/reel`, `/studio/make` | Unlisted social studio, reel stage and content maker (noindex) |
| `/sig/<slug>.svg` | Each fragrance's signature as a standalone SVG |
| `/api/catalog.json` | On demand: public prices and availability from the store, edge-cached |
| `/api/staff/orders.json` | On demand: future read-only staff orders. **Disabled; fails closed** (404) |

## Run it

```bash
npm ci
npm run dev          # http://localhost:4321
npm run build        # syncs the catalogue, then builds dist/client + dist/server
npm run preview      # serve the build (restart with `npx astro preview stop` after rebuilding)
npm run check        # type check
npm run test:unit    # catalogue and staff-guard unit tests
npm test             # Playwright (desktop + mobile Chromium; WEBKIT=1 adds WebKit)
npm run sync:catalog # re-read the store's catalogue on its own
npm run social       # render social/out/*.png and public/og/*.png from src/social/plan.json
npm run reel         # render social/out/reel-*.mp4 (needs ffmpeg)
```

Set `CHROME_PATH=/path/to/chrome` to use a system Chrome instead of Playwright's download.

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `PUBLIC_SITE_URL` | build | Canonical and Open Graph base URL |
| `CATALOG_SYNC=off` | build | Skip the store sync (offline builds); the audited snapshot is used |
| `CATALOG_ORIGIN` | build + server | Store to read from (default `https://globalaroma.me`) |
| `CATALOG_SOURCE=snapshot` | build | Force the snapshot even if a sync file exists |
| `STAFF_LIVE_ENABLED`, `WC_API_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` | server only | **Leave unset.** Future read-only staff connector; also needs a staff sign-in that isn't implemented (doc 12). Never `PUBLIC_*`, never committed |

## Where things live

```
src/data/            company facts, divisions, scent collection (all sourced; see docs/01)
src/data/catalog/    audited store snapshot + editorial overlay keyed by product ID
src/lib/catalog/     types, normalisation and validation, buy links, source selection
src/lib/server/      server-only code: live catalogue reader, staff guard, read-only orders client
src/staff/           order model, demo source, WooCommerce mapper
src/lib/             signature engine, accord rules, map placement, line patterns, hero field
src/components/      ScentMap, ScentFinder, ProductCard, ScentCard, DivisionPage, staff/StaffApp, …
src/pages/           routes (incl. api/)
src/scripts/         client scripts (brief store, scents UI and finder, shop)
src/social/plan.json   every social frame and OG card
scripts/         catalogue sync, social and reel renderers
tests/           Playwright e2e (site.spec.ts) and unit tests (tests/unit)
docs/            research, direction, design system, decisions, social kit, approvals, commerce, QA, comparison
```

**Updating content:** edit `src/data/*.ts`. Adding a scent to `scents.ts` gives it a signature, a map position, a library card and an SVG automatically.

## Deploy (Vercel)

New, independent project **`global-aroma-claude-concept`**. Don't reuse the Codex project or attach the official domain.

```bash
npm i -g vercel
vercel login
vercel link --project global-aroma-claude-concept   # create it when asked
vercel deploy                                       # Preview deployment
```

The Vercel adapter writes the Build Output API format, so **leave the project's Output Directory setting empty** (if it was set to `dist` for Phase A, clear it). Phase B is on the `phase-b` branch; deploying that branch as a Preview leaves the production deployment (Phase A) untouched until you promote it.

`vercel.json` sends `X-Robots-Tag: noindex`, and `robots.txt` disallows everything. To share the Preview with external reviewers, turn off Vercel Authentication for Preview deployments in that project's settings, or create a shareable link. Set `PUBLIC_SITE_URL` to the preview URL so canonical and Open Graph URLs match.

## Commerce scope

Global Aroma's existing WooCommerce store stays the only checkout and order system. This project adds no payments, accounts or order database; its two on-demand routes read public prices and (when authorised, in future) orders, read-only. See docs 07, 11–14.

## Documentation
1. [Research](docs/01-research.md) · 2. [Creative direction](docs/02-creative-direction.md) · 3. [Design system](docs/03-design-system.md) · 4. [Decisions](docs/04-decisions.md) · 5. [Social kit](docs/05-social-kit.md) · 6. [Owner approvals](docs/06-owner-approvals.md) · 7. [Commerce handoff](docs/07-commerce-and-orders.md) · 8. [QA report](docs/08-qa.md) · 9. [Comparison with the Codex concept](docs/09-competitive-review.md) · 10. [Scope & next steps](docs/10-scope.md)

**Phase B:** 11. [Catalogue audit & sync](docs/11-catalogue.md) · 12. [Staff integration & security](docs/12-staff-integration.md) · 13. [Notification troubleshooting](docs/13-notification-troubleshooting.md) · 14. [Migration plan](docs/14-migration.md) · 15. [Commercial breakdown](docs/15-commercial.md) · 16. [Owner onboarding & access](docs/16-owner-onboarding.md) · 17. [Deploying Phase B](docs/17-deploy-phase-b.md)
