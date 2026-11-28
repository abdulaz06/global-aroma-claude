# 04 — Decision log

Short, dated decisions with the reason and, where relevant, the measurement. (Format borrowed from Sonora's `DECISIONS.md`.)

**D1 — Static Astro, no UI framework.** The site is content plus a few interactions (map, dialog, filters, brief, hero canvas). Astro ships HTML with ~10 KB of scoped scripts; React or Three.js would add weight without improving the experience.

**D2 — Direction "Lines of atmosphere" (A inside D).** Scored highest on originality, memorability and relevance without depending on photography the company doesn't own. See 02.

**D3 — Signatures generated, not designed.** The store uses one placeholder image for every oil. Generating signatures from the published notes gives 67 distinct, consistent images that are free to maintain.

**D4 — SVG signatures as static files (`/sig/<slug>.svg`).** Inlining 67 signatures on one page would add ~1.4 MB of markup. Separate lazy-loaded SVGs are cached, reusable in social templates, and work without JavaScript.

**D5 — Map axes from the fragrance wheel.** The first axes (fresh/warm × light/deep) correlated at ~0.9 and left the plane diagonal. Fresh/warm × floral/woody with partial de-trending gives correlation 0.22 and a filled plane.

**D6 — Hero field: canvas only when it helps.** A static SVG ships first and is drawn by the same function as the canvas. The canvas starts only with motion allowed, no Save-Data, and ≥4 GB device memory; it runs ~30 fps while visible. Lighthouse mobile performance on `/`: 94; desktop 100.

**D7 — Store remains the checkout.** Every purchase hands off to the WooCommerce product page. Reasons: client requirement; orders must stay in the system that records them; no payment or order handling outside it. See 07.

**D8 — Brief opens drafts, never "sends".** `mailto:`/`wa.me` links are live hrefs (testable, work with middle-click), labelled "Open in email / WhatsApp", with copy that says nothing is sent until the visitor sends it.

**D9 — Prices without "from".** The Store API returns no price range for variable oils, so "from" is unsupported. Listed prices are shown as-is; missing prices read "Price on request". *Phase B: the variation audit showed only 500 ml is priced, so prices now read "AED 280 · 500 ml" (D18).*

**D10 — Concept imagery reused, labelled.** Environment photographs come from the earlier prototype (AI-generated). Each is tagged "Concept image"; the prototype's render of a branded diffuser was excluded because it depicts an unapproved product.

**D11 — Product photos load from the official store.** They can't be copied into this repo here (no network access to the store from the build environment). If one fails, the card shows a type pictogram (unit or HVAC) instead of a broken image.

**D12 — One renderer for social.** `/studio` renders every frame from `src/social/plan.json` with the site's engines; Playwright exports exact sizes, and ffmpeg encodes the reel (H.264, CRF 18, veryfast). Safe-zone proofs are rendered alongside.

**D13 — Library shows 15 first.** 67 cards made the Aroma page ~27,000 px tall on a phone. Filters and search always cover the full set; "Show all" reveals the rest, and deep links expand automatically.

**D14 — Contrast.** Muted text raised to 70% ink; text-safe accent tones added after Lighthouse flagged saffron labels. Accessibility now scores 100 on most pages and 96 on Home/Aroma, where the Scent Map's dots overlap (target-size). The library offers the same scents as full-size targets.

**D15 (Phase B) — Photographic "moment" on the home page.** The Codex concept's photo-led hero carries immediate warmth. Rather than copy it, we added one full-bleed photograph with a signature drawn over it: warmth plus our own device.

**D16 (Phase B) — CI workflow.** GitHub Actions runs type check, build and Playwright in Chromium and WebKit (parity with the Codex project's CI).

## Phase B

**D17 — Static first, two on-demand routes.** The site stays static (fast, cheap, nothing to break). Only `/api/catalog.json` (public prices) and the disabled `/api/staff/orders.json` run on demand, through Astro's Vercel adapter (Node adapter for local preview and tests). No database, no sessions.

**D18 — The store is authoritative; freshness is always labelled.** Four layers: audited snapshot → build-time sync (validated, falls back on any failure) → live refresh cached 10 minutes at the edge → a label stating source and time. A failed live read is never cached, and stale data is marked as stale (doc 11).

**D19 — Editorial overlay keyed by product ID.** Names repeat (two WHITE BEACH listings) and six listings carry another scent's notes. Notes, flags and summaries are attached by WooCommerce ID with an explicit `same`/`different` match, and differences are shown to the visitor rather than silently corrected.

**D20 — Cart hand-off uses WooCommerce's own add-to-cart URLs.** `?add-to-cart=<parent>&variation_id=<id>&attribute_pa_volume=500ml` for the verified priced variation, `?add-to-cart=<id>` for simple products. The store's cart and checkout do the rest. Unpriced items are quote-only.

**D21 — Shop pages fill whole rows.** 62 products made the phone shop 16,626 px tall. The grid now shows three full rows (10 items on two columns) with "Show more", URL-synced filters and a detail dialog with `#p-ID` deep links. Mobile height is about 4,500 px.

**D22 — Home: photography first, signature on top.** The hero is a photograph (reed diffuser) with Royal Residence's signature drawn over it, and Shop and Brief buttons. The long alternating division sections became three compact photo cards (image beside text on phones). Shorter on both desktop and mobile without losing the line identity.

**D23 — Scent Finder ranks by notes, not by space.** Visitors choose a feeling; fragrances are ranked by their accord shares from the published notes. The optional space choice labels the result and is passed to the brief, and the page says it doesn't change the matches. We have no basis for claiming "this scent suits hotels", so we don't.

**D24 — Touch-safe map.** On coarse pointers the map's dots are not tap targets; any tap lists the four nearest scents as full-size buttons. This fixes mis-taps on closely spaced dots without hiding the map.

**D25 — Staff demo is synthetic and separate; live access fails closed.** The demo uses `example.com` customers generated in the browser, with a permanent demonstration banner and no fake login. The live connector requires an explicit server flag, HTTPS credentials and a verified staff session; the session check has no implementation until an identity provider is chosen, so live access is impossible by construction (doc 12).

**D26 — Option A before Option B.** WooCommerce already records every field staff asked for; the reported gap is access and notification. Fixing those (doc 13) costs hours. A custom interface is optional and comes later, if at all.

**D27 — No prices on social; a browser-only content maker.** Prices go stale but posts don't come down, so social frames say "order online". `/studio/make` lets staff make a post without editing JSON; it keeps everything in the browser.

**D28 — Preview server management.** Astro 7's `astro preview` runs as a background service; restart it with `astro preview stop` after a build, or the on-demand routes keep serving the previous server bundle. (Found during QA.)

## Owner demonstration

**D29 — A dated snapshot instead of a sync.** For the founders' review, predictability beats freshness: one verified snapshot, stated date, store authoritative. The sync, live refresh and both on-demand routes were removed, so the site is fully static again and deploys exactly like Phase A did.

**D30 — Verified cart links only.** Direct add-to-cart links remain only where verified (simple products, two individually read variations). Other variable oils link to the product page ("Buy on the store"). Every product reaches the right store page; none relies on an inferred variation ID.

**D31 — An owner review guide, outside the customer navigation.** A slim, clearly labelled "Proposal preview" bar and `/review` let the founders find the Staff Workspace and Content Maker without instructions, while the customer navigation stays as it would be at launch. Both are removed at launch.

**D32 — Guided demos.** The Staff Workspace has a four-step walkthrough (simulate, open, view email, reset) that ticks off as you go; the Content Maker is ordered as four steps (fragrance → photograph and format → text → download).

