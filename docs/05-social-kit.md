# 05 — Social kit

A small, reusable identity for Instagram and LinkedIn, rendered from the same engine as the website. Nothing is a resized screenshot.

## Deliverables (`social/out/`)

| File(s) | Format | Size | Notes |
|---|---|---|---|
| `ig-carousel-1…5` | Instagram carousel, "Every scent has a shape" | 1080×1350 (4:5) | Cover → how to read a signature → colour is the accord → the map → call to action |
| `ig-post-arabic-coffee`, `-frangipani`, `-green-fig-leaves` | Product introduction posts | 1080×1350 | Reusable scent-post template (notes, store price) |
| `ig-post-divisions` | Group introduction | 1080×1350 | The three behaviours |
| `reel-cover-scent`, `-hospitality`, `-technology` | Reel covers (three series) | 1080×1920 | Key content inside the 3:4 grid crop and clear of UI |
| `reel-signature-arabic-coffee.mp4` (+ `-cover.png`) | Motion concept, 12 s | 1080×1920, 30 fps, H.264 | Rings draw base → heart → top with each layer's notes, then name, then end card |
| `story-new-scent`, `story-ask` | Stories | 1080×1920 | Space left for link and question stickers |
| `highlight-aroma/-hospitality/-technology/-scents/-contact` | Highlight covers | 1080×1920 | Icon sized for the circular crop |
| `linkedin-post`, `linkedin-banner` | LinkedIn | 1200×1200, 1584×396 | Banner keeps the wordmark clear of the profile photo |
| `public/og/*.png` | Link previews | 1200×630 | Marked "Concept preview" |
| `_contact-sheet.png`, `_safe-zones.png`, `_safe/*` | Review sheets | — | Safe-zone proofs for every frame |

## Safe zones used
- **Feed 4:5:** 34 px side margins kept clear for the profile grid's 3:4 crop; content margin 80 px.
- **Reels:** top 220 px and bottom 420 px clear of interface; right 140 px clear of the action buttons; the cover's key content inside the central 1080×1440.
- **Stories:** top 250 px and bottom 340 px clear.
- **Highlights:** icon inside a 620 px circle.
- **LinkedIn banner:** left 568 px kept free (profile photo on desktop).
- Minimum text: 20 px on 1080-wide canvases (labels); headlines 92–140 px.

## House style
- Paper or ink grounds only; one signature or one behaviour per frame.
- Newsreader for the message, JetBrains Mono uppercase for context (series, family, price, link).
- Prices only as the store lists them, followed by "online". Never "from" unless per-volume prices are confirmed.
- No stock statistics, no "best", no exclamation marks.
- Photographs only from approved shoots. This kit uses none, so nothing in it is concept imagery. The only unconfirmed content is the store prices, valid as of 23 Nov 2026.

## Making new assets (about five minutes)
1. Open `src/social/plan.json`.
2. Copy a frame, change `id` and `scent` (any slug in `/aroma`) or the copy fields.
3. `npm run build && npm run social` (add `npm run reel` for reels).
4. Check `social/out/_safe-zones.png`, then post from `social/out/`.

Captions and posting schedules are deliberately out of scope (no account management promised).
