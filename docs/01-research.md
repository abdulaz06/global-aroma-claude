# 01 — Independent research (Phase A)

Done before opening any Codex material (repository, preview or owner presentation).
Sources: the live official site and its public WooCommerce Store API (read on 23 Nov 2026), the public `abdulaz06/sonora` repository and sonoravisuals.com, the earlier single-file prototype, and public competitor sites.

Every statement here is marked **Verified** (seen on an official Global Aroma page or API), **Observed** (a fact about the site itself) or **Assumption** (our reading, which the owner needs to confirm).

---

## 1. The company

| Fact | Status | Source |
|---|---|---|
| Legal entity: Global DWC LLC | Verified | site footer, About |
| Three divisions: Global Aroma, Global Hospitality, Global Technology | Verified | home, footer |
| Dubai office: Office 531, 5th Floor, Building A3, Dubai World Central. P.O. Box 712930 | Verified | Contact, footer |
| Main line +971 4 351 7399 | Verified | Contact ("For Inquiries") |
| WhatsApp +971 55 582 7212 | Verified | Contact page labels it WhatsApp; scent-collection enquiry links use `wa.me/971555827212` |
| Other mobiles +971 50 954 2841, +971 50 631 1538 | Verified as listed, **not assigned to a division** | footer |
| Email info@globaldwc.com, bdm@globaldwc.com | Verified | footer, Contact |
| "Leading scent marketing solutions company", advises customers worldwide | Verified (company's own claim) | About |
| Fragrance oils and "high-tech" diffuser machines "developed by its experts" | Verified (company's own claim) | About |
| Custom/bespoke fragrances to match a brand identity | Verified | Candles / reed / room-spray page |
| Industries listed: Hotels, Restaurants, Residential Buildings, Hospitals, Airports, Malls, Information Technology, AI and Data Center | Verified | home |
| Sri Lanka showroom, 108 Station Road, Kelaniya | Listed on Contact, **unconfirmed** — the site also carries a `facebook.com/ColomboMarket` publisher tag from its template, so this could be leftover. Not used on the new site. | Contact |
| Founding year, clients, certifications, team, awards | **Not stated anywhere.** Nothing of this kind appears in the new site. | — |

### Division offer (verified from the footer and category pages)

- **Global Aroma:** scent collection (67 named fragrances with top/heart/base notes), oils for diffusers, aroma diffusers (14 models), candles / reed diffusers / room spray, scent boxes (21 × 5 ml sampler), car diffusers, scent bottles, distributors, custom fragrance.
- **Global Hospitality:** guest room linen, guest room electrical, guest amenities, housekeeping & front-office trolleys, F&B linen, banquet furniture. No product pages, no specifications.
- **Global Technology:** smart solutions, ICT & connectivity, digital signage, system integration, support & maintenance. No product pages, no specifications.

## 2. The store (WooCommerce)

Read through the public Store API (`/wp-json/wc/store/v1/products`), with no account and no cart actions.

- **~60 purchasable products** in two real categories: *Oils* (≈46) and *Diffusers* (14). Currency AED; shipping "calculated at checkout".
- **Oils:** variable products with a Volume attribute (100 / 250 / 300 / 500 ml). Listed "from" prices AED 204–345. **Every oil uses the same image** (`Untitled-design-2.png`). Many have notes in their long description; several have none.
- **Diffusers:** GA-OV-1 (190), GA-OV-2 (265), OV 3 (350), GA-OV-5 (400), OV-8 (650), GA-OV-10 (850), F Air (999), GA-G-Air (1,200), GA-M-H3000 (1,550), GA-M-H5000 (2,200), GA-AD-Scent (6,250). Rad 0, GA-OV-5 Pro and "Reed Diffusers & Candles" have no price ("Read more"). The only specifications published: GA-M-H3000 / H5000 "connecting with HVAC" (H5000 has a double refill bottle); GA-OV-5 has a forward-spray atomiser head, quick-swap reservoir, LCD and Bluetooth. **No coverage areas are published for any model**, so the new site never claims one.
- Product pages have Add to cart + Buy now, quantity 1–5, and a "Get in touch" link that points to `#`.
- **Purchase works up to checkout in principle. We did not add to cart or check out** (no authorisation to place orders). Whether an order reaches the sellers, how they are notified, and which payment methods are live all need the owner to confirm.

## 3. Audit of the current site

| Area | Finding |
|---|---|
| Positioning & hierarchy | Good group line ("One Global Vision. Three Distinct Experiences."), but all three "Explore" buttons go to `#`. Hospitality and Technology have no pages, so two-thirds of the business is a footer list. |
| Content quality | Thin and generic. Scent pages are the exception: real note pyramids for 67 scents, which is the site's best asset and is buried. |
| Product discovery | The shop sidebar lists ~22 leftover electronics categories (HDMI, Drones, Cell Phones…). All oils share one picture. No way to browse by mood or space. |
| Navigation | Eleven top-level items, all Aroma. Duplicated footer blocks, many dead links. |
| Credibility | Template leftovers (ColomboMarket publisher, electronics categories, `PASTE-BUY-NOW-URL-HERE`, mailto links to `test-sales@`/`test-info@`). These are the most damaging issue for a B2B buyer. |
| Visual consistency | Mixed product shots (screenshots dated 2024), WhatsApp-export gallery with no captions or alt text. |
| Mobile | Elementor theme; long menu; product images 114–300 px wide. |
| Conversion | Contact form has a topic selector and a button that points to `#send-message`; no submission path. The working routes are phone, email, and the scent-collection WhatsApp links. Buying vs. quoting is never explained. |

**Biggest opportunities:** give Hospitality and Technology real pages; turn the 67-scent library into the centre of discovery; separate "buy online" from "request a quote" everywhere; replace the broken form with a working structured enquiry; remove every template leftover.

## 4. Sonora — what makes it feel like a product

From `site/` (Astro 7, static output, hand-written CSS, TypeScript strict), `DOCS/brand/17-BRAND.md`, `DOCS/DECISIONS.md` (D73–D89) and `DOCS/REELS.md`:

1. **The content is loud, the chrome is quiet.** Two colours (Night/Bone), opacity greys, 1 px dividers, square corners, one display face and one mono. No brand accent: colour comes from the product. *Lesson: let the subject provide the colour and keep the frame disciplined.*
2. **It shows the real thing.** The landing page runs the real engine on recorded analysis frames. Nothing is a mock-up of the product. *Lesson: the signature interaction must use real company data, not invented demo content.*
3. **Still first, then live.** Every section ships a still; the engine loads after first paint, is gated on reduced motion, device memory, cores and Save-Data, and warms shaders in a worker so scrolling never stalls. *Lesson: progressive enhancement with an honest static fallback.*
4. **Decisions are written down** with measurements (Lighthouse before/after, compile times). *Lesson: keep a decision log; claim only what was measured.*
5. **One renderer for everything.** The reel studio, trailer and site share the engine; reels follow a house style (lowercase title line, safe-zone overlay, 3:4 grid crop, deterministic renders from JSON plans). *Lesson: social assets should come from the same system as the website, through a repeatable tool, not from a design tool by hand.*
6. **Voice:** few words, no exclamation marks, no "ultimate". Sentence case.

What does **not** transfer: the monochrome night palette (wrong for a hospitality/fragrance business), shaders and fluid visuals (no reason to run a GPU for a B2B catalogue), lowercase voice (too informal for Global Aroma's corporate buyers).

## 5. Market reference

Category leaders (Mood Media, ScentAir, Prolitec) and Dubai competitors present scent marketing with the same kit: stock hotel lobbies, borrowed statistics, "the strongest sense tied to memory". They explain HVAC versus standalone diffusion clearly; that distinction matters to buyers and is worth explaining.

Global Aroma can stand out on things they don't show: a real, browsable fragrance library with notes, published prices, and three divisions under one contact.

Other references: Aesop and Le Labo (restraint, typography, materials), Byredo (index-like product naming), Teenage Engineering and Muji (catalogue precision), Aman and Six Senses (calm hospitality pacing). We take principles from them, not visuals.
