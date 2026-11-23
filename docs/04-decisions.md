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

**D9 — Prices without "from".** The Store API returns no price range for variable oils, so "from" is unsupported. Listed prices are shown as-is; missing prices read "Price on request".

**D10 — Concept imagery reused, labelled.** Environment photographs come from the earlier prototype (AI-generated). Each is tagged "Concept image"; the prototype's render of a branded diffuser was excluded because it depicts an unapproved product.

**D11 — Product photos load from the official store.** They can't be copied into this repo here (no network access to the store from the build environment). If one fails, the card shows a type pictogram (unit or HVAC) instead of a broken image.

**D12 — One renderer for social.** `/studio` renders every frame from `src/social/plan.json` with the site's engines; Playwright exports exact sizes, and ffmpeg encodes the reel (H.264, CRF 18, veryfast). Safe-zone proofs are rendered alongside.

**D13 — Library shows 15 first.** 67 cards made the Aroma page ~27,000 px tall on a phone. Filters and search always cover the full set; "Show all" reveals the rest, and deep links expand automatically.

**D14 — Contrast.** Muted text raised to 70% ink; text-safe accent tones added after Lighthouse flagged saffron labels. Accessibility now scores 100 on most pages and 96 on Home/Aroma, where the Scent Map's dots overlap (target-size). The library offers the same scents as full-size targets.

**D15 (Phase B) — Photographic "moment" on the home page.** The Codex concept's photo-led hero carries immediate warmth. Rather than copy it, we added one full-bleed photograph with a signature drawn over it: warmth plus our own device.

**D16 (Phase B) — CI workflow.** GitHub Actions runs type check, build and Playwright in Chromium and WebKit (parity with the Codex project's CI).
