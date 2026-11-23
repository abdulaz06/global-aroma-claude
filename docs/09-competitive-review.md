# 09 — Phase B: comparison with the Codex concept

## Process and evidence
- Phase A was finished, tested and tagged (`phase-a-independent`) **before** any Codex material was opened.
- **Available evidence:** the Codex owner presentation (2 pages: homepage screenshot, divisions preview, five social frames, written description of Atmosphere Studio and the enquiry flow), plus the user's summary (seven pages, Atmosphere Studio, WooCommerce links, email enquiry, social package, docs, tests, CI).
- **Not available:** the Vercel Preview (redirects to a Vercel login) and the private repository (not accessible to this session). So the comparison is **partial**. Codex's interactions, mobile layouts, code quality and QA claims could not be checked first-hand, and scores in those areas are marked as low-confidence.

## Approaches
| | Codex (GPT-6.2 Astra Ultra) | This concept |
|---|---|---|
| Idea | "A sense of place": warm, photo-led luxury (Moorish arches, amber light), serif with italics | "Lines of atmosphere": scent drawn as data; one line in three behaviours; paper and ink |
| Imagery | Full-bleed atmospheric photographs (labelled illustrative) | Generated signatures and line systems; one photographic moment; labelled concept photos |
| Signature interaction | Atmosphere Studio: choose a space, pair a fragrance, prepare an email brief | Scent Map of all 67 fragrances → detail → shortlist across all divisions → email or WhatsApp draft |
| Commerce | Links to the existing catalogue | Dedicated /shop (all 47 oils and 13 diffusers) with verified store prices; Buy/Quote distinction on every item |
| Social | Introductory carousel (4) + Reel cover, photo-led | 26 frames (carousel, product posts, reel covers, stories, highlights, LinkedIn, OG) + a motion reel + a JSON-driven generator with safe-zone proofs |

## Scored comparison (weights from the brief)
| Category (weight) | Codex | This | Winner and why |
|---|---|---|---|
| Visual design & originality (30%) | 7.5 | 8.5 | **This.** Codex is polished but follows the familiar serif-italic and amber-photo luxury template (shared by many fragrance and hotel sites and by the earlier prototype). The signature system is ownable and specific to this company. Codex has the more immediately sumptuous first screen. |
| Suitability for the business (25%) | 7.5 | 8.5 | **This.** It uses the company's real catalogue (67 scents with notes, real prices) and gives Hospitality and Technology real pages and inquiry paths. Codex's photography of arches says "Dubai luxury" but not what the company sells. |
| Mobile (15%) | ? (7) | 8.5 | **Likely this, low confidence.** Ours is measured: no overflow at 375/390, sticky section nav, a 15-item library preview, a mobile-specific photo layout. Codex's mobile couldn't be inspected. |
| Functionality & usability (15%) | 7.5 | 8.5 | **This.** Map + search + filters + a cross-division brief with WhatsApp and email, plus a full shop. Codex's Atmosphere Studio is a good idea and simpler for a first-time visitor. |
| Performance & maintainability (10%) | ? (8) | 8.5 | **Even, low confidence.** Ours: Lighthouse 92–96 mobile and 100 desktop, data-driven content, CI, docs. Codex reports tests and CI that couldn't be inspected; full-bleed photography is typically heavier. |
| Social-brand consistency (5%) | 7.5 | 9 | **This.** One renderer and one system; Codex's set is consistent but small and depends on photography. |
| **Weighted** | **≈7.5** | **≈8.5** | |

## Where Codex is stronger, and what we did about it
1. **Instant warmth.** A photograph sells atmosphere faster than lines. **Adopted, our way:** a full-bleed photographic "moment" on the home page with a signature drawn over the lobby (D15).
2. **Atmosphere Studio is easy to understand.** "Choose your space" is a simpler first step than reading a map. **Already covered:** the Brief starts with the space type, and the map works by tapping a feeling. *Possible next step:* a "Start from your space" preset that pre-filters the map by space type, but only if the owner can say which scents suit which spaces (we won't invent pairings).
3. **CI and docs parity.** **Adopted:** GitHub Actions (type check, build, Playwright in Chromium and WebKit) (D16).

## Where this concept should not borrow
- Italic-serif display type and amber-arch photography: would erase the distinctiveness that makes this concept memorable.
- More pages for their own sake: the brief's goal is clarity, and this concept covers the business in seven public routes.

## Next step to complete the review
Share the Codex Preview (or a Vercel share link) and repository access, and the comparison can be completed first-hand for mobile, interactions, code and QA.
