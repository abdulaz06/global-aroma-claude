# Global Aroma — website & brand concept

**Unofficial design concept for Global DWC LLC (Global Aroma · Global Hospitality · Global Technology), pending owner approval.** Not the official website. The build is `noindex` everywhere.

A static Astro site in the **"Lines of atmosphere"** direction: one 1 px line drawn three ways (Aroma *flows*, Hospitality *weaves*, Technology *switches*). Every fragrance in the published collection gets a generated **signature** drawn from its own notes. The same engine renders the website, the Scent Map, the social templates, the Open Graph cards and a motion reel.

## What's here

| Route | Purpose |
|---|---|
| `/` | Group story, three divisions, Scent Map, spaces served, buy-or-quote paths |
| `/aroma` | 67 fragrances (map, searchable library, detail view), diffusers, home fragrance, scent box, signature scent |
| `/hospitality`, `/technology` | Division offers, categories to add to a brief |
| `/shop` | Everything sold online, handing off to the existing WooCommerce product pages |
| `/brief` | Quote request builder: opens a pre-filled email or WhatsApp draft |
| `/contact` | Verified company contacts |
| `/studio`, `/studio/reel` | Unlisted social-asset studio (noindex) |
| `/sig/<slug>.svg` | Each fragrance's signature as a standalone SVG |

## Run it

```bash
npm ci
npm run dev          # http://localhost:4321
npm run build        # static output in dist/
npm run preview      # serve dist/
npm test             # Playwright (desktop + mobile Chromium; WEBKIT=1 adds WebKit)
npm run social       # render social/out/*.png and public/og/*.png from src/social/plan.json
npm run reel         # render social/out/reel-*.mp4 (needs ffmpeg)
```

Set `CHROME_PATH=/path/to/chrome` to use a system Chrome instead of Playwright's download.

## Where things live

```
src/data/        company facts, divisions, scent collection, diffusers (all sourced; see docs/01)
src/lib/         signature engine, accord rules, map placement, line patterns, hero field
src/components/  layout pieces (ScentMap, ScentCard, DiffuserCard, DivisionPage, …)
src/pages/       routes
src/scripts/     small client scripts (brief store, map/dialog/filters, hero canvas)
src/social/plan.json   every social frame and OG card
scripts/         social and reel renderers
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

`vercel.json` sends `X-Robots-Tag: noindex`, and `robots.txt` disallows everything. To share the Preview with external reviewers, turn off Vercel Authentication for Preview deployments in that project's settings, or create a shareable link. Set `PUBLIC_SITE_URL` to the preview URL so canonical and Open Graph URLs match.

## Commerce scope

Global Aroma's existing WooCommerce store stays the only checkout and order system. This project adds no backend, payments, accounts or order database. See **[docs/07-commerce-and-orders.md](docs/07-commerce-and-orders.md)** for the order-visibility and notification handoff.

## Documentation
1. [Research](docs/01-research.md) · 2. [Creative direction](docs/02-creative-direction.md) · 3. [Design system](docs/03-design-system.md) · 4. [Decisions](docs/04-decisions.md) · 5. [Social kit](docs/05-social-kit.md) · 6. [Owner approvals](docs/06-owner-approvals.md) · 7. [Commerce handoff](docs/07-commerce-and-orders.md) · 8. [QA report](docs/08-qa.md) · 9. [Comparison with the Codex concept](docs/09-competitive-review.md) · 10. [Scope & next steps](docs/10-scope.md)
