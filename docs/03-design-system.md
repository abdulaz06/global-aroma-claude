# 03 — Design system: "Lines of atmosphere"

Tokens live in `src/styles/global.css`; generators in `src/lib/`.

## Principles
1. **One line.** Everything decorative is a 1 px line (non-scaling strokes keep it 1 px at any size).
2. **The subject brings the colour.** Paper and ink frame everything; colour comes from scent accords and the three division signals.
3. **Real data only.** Signatures, map positions and prices come from the company's published data.
4. **Still first, then live.** Every moving thing has a static version that ships first.

## Colour
| Token | Value | Use |
|---|---|---|
| `--paper` | `#F2EEE7` | Page |
| `--paper-2` / `--paper-3` | `#E9E3D8` / `#DED6C8` | Tints, frames |
| `--ink` | `#1A1714` | Text, lines, dark sections |
| `--ink-72/56/32/16/08` | ink at opacity | Secondary text (`-56` is 70% for contrast) … hairlines |
| `--aroma` / `--aroma-text` | `#B4612A` / `#96491C` | Saffron signal / text-safe tone |
| `--hospitality` | `#3E5C50` | Juniper |
| `--technology` / `--technology-text` | `#3149B0` / `#2C42A0` | Lapis |

Accord pigments (signatures and map only): citrus `#C99A1E`, green `#5E7A3A`, marine `#2F6F8A`, fruity `#C0573F`, floral `#B4567A`, musk `#8C857B`, spicy `#A2452A`, woody `#6E4E33`, amber `#9A5A1C`, gourmand `#7A4A2E`.

## Type
- **Newsreader** (variable, optical size): statements, scent names. Roman, tracking −2 to −3.5%. No decorative italics.
- **Schibsted Grotesk** (variable): body and UI.
- **JetBrains Mono** 400/500: labels, codes, prices. Uppercase, +8% tracking.
- Scale: `--t-mega` 3.4–9.5 rem → `--t-label` 0.72 rem (fluid `clamp`). All fonts are self-hosted via Fontsource (OFL).

## The three behaviours (`src/lib/patterns.ts`)
| Division | Behaviour | Drawing | Motion |
|---|---|---|---|
| Aroma | **Flow** | drifting contours bunching into a band | accent line draws on |
| Hospitality | **Weave** | warp and weft with over/under gaps | accent thread draws across |
| Technology | **Signal** | stepped lines switching level | a pulse travels the accent line |

## Scent signature (`src/lib/signature.ts`)
- One closed contour per note: base notes inside, heart in the middle, top notes outside. Coloured by accord (`src/lib/accords.ts`).
- Each ring's centre drifts further downwind (sillage). Fresh scents drift further, spicy scents ripple (high harmonics), deep scents swell (low harmonics), floral scents gain lobes.
- Seeded by the scent's name, so it is deterministic everywhere.

## Scent Map (`src/lib/library.ts`)
x = fresh → warm, y = floral → woody: the two axes of the classic fragrance wheel, computed from accord weights per layer (top 0.7, heart 1, base 1.35). Most of the shared warmth/woodiness trend is removed so the axes say different things. Positions blend rank and raw value.

## Components
Buttons (`.btn`, `.btn-line`, `.btn-sm`), text links (`.link`), chips (`.chip`, `aria-pressed`), **commerce actions** (`.act-buy` = store hand-off ↗, `.act-add` = add to brief +), ScentMap, ScentCard, ScentDialog, DiffuserCard, DivisionPage, Pattern, Mark.

## Motion
Easing `cubic-bezier(.22,1,.36,1)`. Reveals 0.9 s, line draws 2.6 s, signature breathing 14 s. Hero field runs at ~30 fps only while visible, never under reduced motion, Save-Data or <4 GB device memory. Everything is static under `prefers-reduced-motion`.

## Layout
12-column grid, max width 1520 px, gutters `clamp(1.25rem, 4vw, 4.5rem)`, section rhythm `clamp(4.5rem, 10vw, 9rem)`, square corners (2 px radius on controls), hairline dividers.
