# Three Sentences — Landing Page Design Specification

> **Purpose.** A complete handoff document for rebuilding the Three Sentences landing page. Written to be fed to a coding agent (Claude Code, Cursor, etc.) or read by a designer/engineer working in any framework. The reference implementation lives in `Three Sentences Landing Page.html` plus the four files in `landing/`.
>
> **Stack-agnostic.** The original is plain React + inline styles for prototyping. Production is Next.js + Tailwind + Framer Motion (already scaffolded in `threesentences/landing`). This spec describes intent, not implementation — apply it to either.
>
> **Aesthetic.** "Noir editorial." Dark, monochrome, restrained. Italic serif for emotional moments, mono for metadata, sans for body. The page reads like a quiet broadsheet — never a SaaS dashboard, never a tech-y product page.

---

## Table of Contents

1. [Voice & Positioning](#1-voice--positioning)
2. [Design Tokens](#2-design-tokens)
3. [Typography System](#3-typography-system)
4. [Layout Grid](#4-layout-grid)
5. [Component Library](#5-component-library)
6. [Page Architecture](#6-page-architecture)
7. [Section Specifications](#7-section-specifications)
8. [Interactions & Motion](#8-interactions--motion)
9. [Forms & State](#9-forms--state)
10. [Responsive Behavior](#10-responsive-behavior)
11. [Accessibility](#11-accessibility)
12. [Performance Budget](#12-performance-budget)
13. [SEO & Meta](#13-seo--meta)
14. [Implementation Checklist](#14-implementation-checklist)

---

## 1. Voice & Positioning

The landing page must answer three questions in this order:
1. **What is it?** A daily journaling practice on a single rule: write exactly three sentences.
2. **Why does it matter?** Because constraint beats willpower. The smallest possible practice is the only one you'll actually do.
3. **What now?** Request access. The waitlist opens in small waves.

### 1.1 Tone

- **Quiet authority.** Declarative. Short sentences. No hype, no exclamation marks.
- **Editorial, not marketing.** Read aloud, the copy should sound like an essay — not a product page.
- **Permanence as posture.** "Your words stand." "No edits, ever." The product's defining constraint must echo in the copy's discipline.
- **Warm, not corporate.** A touch of human in the copy ("you'll do it even on your worst days") keeps the noir from becoming cold.

### 1.2 Forbidden patterns

- ❌ Emoji
- ❌ Gradients (except subtle radial glow)
- ❌ Drop shadows on UI elements (only on the phone frames)
- ❌ Accent colors beyond pure white
- ❌ Rounded image cards with hover-tilt-on-mouse
- ❌ Animated text scrambles, glitches, or matrix effects
- ❌ Sticky "trust badges" or social proof bars
- ❌ Words like "transform," "unlock," "revolutionary," "supercharge"

---

## 2. Design Tokens

All tokens are exported from `landing/system.jsx` as JS constants. In production (Tailwind), expose them as theme variables.

### 2.1 Color

| Token | Hex | Role |
|---|---|---|
| `LP_INK` | `#ebe7dc` | Bone-ivory. Primary body color, default text. |
| `LP_INK_BRIGHT` | `#ffffff` | Pure white. Active states, primary CTAs, accent borders. |
| `LP_INK_DIM` | `#8a877e` | Warm dim grey. Secondary text, captions, hover-off nav. |
| `LP_INK_FADE` | `#3a3a3e` | Very dim. Empty dot outlines, placeholder text, struck-out copy. |
| `LP_PAPER` | `#060608` | Page background — near-black with a faint warm undertone. |
| `LP_PAPER_2` | `#0e0e10` | Alternating section background. Creates rhythm without bright bands. |
| `LP_SURFACE` | `#15151a` | Card surface — elevated from `LP_PAPER`. |
| `LP_FRAME` | `#1e1e22` | Hairline divider color. All borders, dividers. |
| `LP_WARM` | `#e8d4b3` | Warm cream — reserved for rare emphasis (currently unused on the landing). |

**Section rhythm.** Alternate `LP_PAPER` ↔ `LP_PAPER_2` between sections. The eye reads the variation as pacing, not as "different sections" — it's the visual equivalent of paragraph breaks.

### 2.2 Spacing

8-based with frequent 4-step increments:

```
4 · 8 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 28 · 32 · 36 · 40 · 44 · 48 · 56 · 64 · 72 · 80 · 100 · 120 · 160 · 180 · 200
```

**Vertical rhythm.** Standard section vertical padding is **160px top + 160px bottom**. Hero is 100vh. The Final CTA is bumped to 200px on both sides for breathing room.

**Horizontal padding** at the page edge: **64px** (desktop). Sections are constrained to **max-width 1280px** centered.

### 2.3 Radius

| Use | Radius |
|---|---|
| Pills (CTAs, chips, eyebrow tags) | `999` |
| Cards (principle, trust, FAQ, AI reflect) | `12–20` |
| Inputs | `10–12` |
| Modal | `28` |
| Phone frame | `width × 0.13` |
| Mark tile | `size × 0.22` |
| Round indicators | `50%` |

### 2.4 Shadow

The phone frames carry the only significant shadow. Cards rely on `LP_SURFACE` contrast and `LP_FRAME` borders for elevation.

```css
/* Phone (hero demo & feature tabs) */
box-shadow:
  0 80px 160px -40px rgba(0,0,0,0.9),
  0 30px 60px -30px rgba(0,0,0,0.5),
  inset 0 0 0 1px rgba(255,255,255,0.03);

/* Modal */
box-shadow: 0 40px 80px -20px rgba(0,0,0,0.8);
```

### 2.5 Backdrop

```css
/* Subtle dot grid backdrop (hero + final CTA) */
background-image: radial-gradient(rgba(235,231,220,0.025) 1px, transparent 1px);
background-size: 28px 28px;
```

```css
/* Radial glow used behind the hero mark + final CTA */
background: radial-gradient(circle at 50% 38%, rgba(255,255,255,0.05), transparent 50%);
```

---

## 3. Typography System

Three families, three strict roles. **Never cross-cast** (e.g. mono in body, sans in display).

### 3.1 Families

| Family | Token | Role |
|---|---|---|
| Schibsted Grotesk | `LP_SANS` | Body, navigation labels, CTAs. Weights 400 / 500 / 600 / 700. |
| Newsreader | `LP_SERIF` | Italic moments — H1, H2, H3, large numerics, pull quotes, prompts. Italic 400/500. |
| IBM Plex Mono | `LP_MONO` | Eyebrows, metadata, timestamps, taglines. Always uppercase, generously tracked. |

Loading (Google Fonts):
```html
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 3.2 Type Scale (with `clamp()` for fluid scaling)

| Style | Family | Min → Max (clamp) | Weight | Letter-spacing | Line height | Use |
|---|---|---|---|---|---|---|
| Hero | SERIF italic | `72 → 180px` (12vw) | 400 | -6 | 1.0 | "Three Sentences." + final CTA |
| H1 | SERIF italic | `64 → 140px` (9vw) | 400 | -3 | 1.0 | Section headlines |
| H2 | SERIF italic | `40 → 72px` (5vw) | 400 | -1.4 | 1.05 | Section sub-headlines |
| H3 | SERIF italic | `28 → 40px` (3vw) | 400 | -0.6 | 1.2 | Card titles, principle headlines |
| Display Numeral | SERIF italic | `100 → 280px` (18vw) | 400 | -8 | 0.95 | "363" counter |
| Step Numeral | SERIF italic | `110px` fixed | 400 | -3 | 0.9 | Step cards "01 02 03" |
| Quote glyph | SERIF italic | `60 → 80px` (8vw) | 400 | -2 | 0.6 | Decorative `"` opener on trust cards |
| Lead | SANS | `17 → 20px` (1.4vw) | 400 | -0.1 | 1.55 | Section intro paragraphs |
| Body | SANS | `15px` fixed | 400 | -0.1 | 1.6 | Card body, FAQ answers, footer |
| Caption | SANS | `12 / 13px` | 400 | 0.3 | 1.55 | Footer legal, modal disclaimers |
| Eyebrow | MONO | `12px` | 500 | 3 | 1.0 | All section labels, ALL CAPS |
| Meta | MONO | `9 / 10 / 11px` | 500 | 1.4–2.4 | 1.0 | Dates, counters, tags, ALL CAPS |
| Nav link | MONO | `11px` | 400 | 2.4 | 1.0 | Top nav items, ALL CAPS |

### 3.3 Type rules

- **Numbers are always serif italic.** Stats, streak counts, step indexes, the "363" hero — never sans-serif.
- **Eyebrow always uppercase, tracked.** Mono `letter-spacing: 3` minimum.
- **No underlines except hover states** on text links.
- **`text-wrap: pretty` or `text-wrap: balance`** on all H1–H3 to avoid orphan words.
- **`&nbsp;`** between the last two words of a heading wherever an awkward break would occur.
- **`Pretty`-style break opportunities** in long display strings: `"Three<br />Sentences."` is intentional — the wordmark always stacks vertically in the hero.

---

## 4. Layout Grid

### 4.1 Container widths

| Container | Width |
|---|---|
| Page (outer) | 100% (full bleed for backgrounds) |
| Section content | `max-width: 1280px` |
| Narrow content (FAQ, modal copy) | `max-width: 760–840px` |
| Modal | `max-width: 520px` |
| Lead paragraph | `max-width: 580–640px` |

### 4.2 Section padding

```
section { padding: 160px 0; }
section > .container { padding: 0 64px; max-width: 1280px; margin: 0 auto; }
```

### 4.3 Two-column layouts

The Rule and AI Reflection sections use a two-column grid:
```
grid-template-columns: 1.1fr 0.9fr;  /* Rule — copy slightly wider */
grid-template-columns: 1fr 1fr;       /* AI — equal */
gap: 80px;
align-items: center;
```

### 4.4 Three-column / four-column grids

- **How it works** — 3 columns × equal width, gap 32px
- **Trust** — 3 columns × equal width, gap 24px
- **Principles** — 2×2 grid, gap 2px (hairline-thin), borders create the lattice
- **Footer** — 2fr 1fr 1fr 1fr, gap 64px

---

## 5. Component Library

Listed atom → composite. Each is implemented once in `landing/system.jsx` and reused.

### 5.1 Primitives

#### `<Section>`
Vertical section wrapper. Standardizes background, padding, container width.
```ts
<Section id?: string py?: 160 bg?: LP_PAPER narrow?: false full?: false />
```

#### `<Reveal>`
Wraps children in a scroll-triggered fade + translate. Uses `useInView` hook. Disconnects observer on first reveal.
```ts
<Reveal delay?: 0 y?: 24>{children}</Reveal>
```
Transition: `opacity 900ms cubic-bezier(0.16, 1, 0.3, 1) {delay}ms`, `transform 900ms cubic-bezier(...) {delay}ms`.

#### `<DotGrid>`
Absolutely-positioned subtle dot grid. Sits behind hero & final CTA.
```ts
<DotGrid opacity?: 0.025 size?: 28 />
```

#### `<Hairline>`
1px horizontal divider. Defaults to 60% width, centered.

### 5.2 Typography components

`<Eyebrow>`, `<H1>`, `<H2>`, `<H3>`, `<Lead>`, `<P>` — see [Section 3.2](#32-type-scale-with-clamp-for-fluid-scaling) for sizes. Each is a single semantic tag styled per the scale.

### 5.3 Atoms

#### `<CTA>`
Pill button. Three variants and three sizes.
```ts
<CTA fill?: false ghost?: false size?: 'sm' | 'md' | 'lg' onClick?>
```
- `fill` — `INK_BRIGHT` background, `#0a0a0a` text. Primary CTA.
- `ghost` — transparent, `FRAME` border. Secondary CTA, footer links.
- default — transparent, ink border.

Heights: `sm 40 / md 52 / lg 62`. Hover: `transform: translateY(-1px)` (200ms ease).

#### `<Mark>`
The brand mark — white rounded tile + three black dots.
```ts
<Mark size?: 28 />
```
Tile radius = `size × 0.22`. Dots: r = `size/9`, gap = `size/8`. Used in nav, hero, final CTA, modal, footer.

#### `<MiniDots>`
Three-position sentence counter. Filled dots are `INK_BRIGHT` solid; empty are `INK_FADE` outline.
```ts
<MiniDots filled?: 3 total?: 3 size?: 10 />
```

#### `<MiniPhone>`
Faux iPhone shell. Status bar with dynamic island + signal/wifi/battery omitted on landing version. Home indicator.
```ts
<MiniPhone width?: 380 height?: 780>{screenContents}</MiniPhone>
```

### 5.4 Composites

#### `<Nav>`
Fixed top nav. Elevates on scroll (Y > 40):
- Padding shrinks 24px → 14px
- Background becomes `rgba(6,6,8,0.78)` + 16px backdrop-blur
- Border-bottom fades from transparent to `LP_FRAME`
- 240ms ease transition

Left: `<Mark size={28}>` + "Three Sentences" italic + `by 363™` mono label. Right: four mono nav items (why / how / inside / faq) + ghost CTA "Join the waitlist".

#### `<WaitlistModal>`
Centered modal, backdrop blur `12px` + `rgba(0,0,0,0.7)`. Two states: form / success. Email validation via `/\S+@\S+\.\S+/`. Enter to submit. Close button = circle with × in top-right.

---

## 6. Page Architecture

Single page, 12 vertical sections in this order. Each is one full viewport vertical scroll-event minimum.

```
0.  <Nav>                       [fixed, all sections]
1.  Hero                        [100vh, dot grid, radial glow]
2.  Problem                     [paper, comparison table]
3.  Rule                        [paper, live typing demo]
4.  How It Works                [paper, 3 step cards]
5.  Features                    [paper-2, tabbed phone previews]
6.  363                         [paper, giant numeral watermark]
7.  Principles                  [paper-2, 2×2 grid]
8.  AI Reflection               [paper, interactive timeframe chips]
9.  Trust                       [paper-2, 3 quote cards]
10. FAQ                         [paper, accordion]
11. Final CTA                   [paper-2, dot grid, radial glow]
12. <Footer>                    [paper, hairline]
13. <WaitlistModal>             [overlay, on CTA click]
```

### Background rhythm

`paper → paper → paper → paper → paper-2 → paper → paper-2 → paper → paper-2 → paper → paper-2 → paper`

The double-paper at the top creates a long opening movement (hero through how-it-works) before the first paper-2 contrast at Features.

---

## 7. Section Specifications

### 7.1 Hero

**Purpose.** Establish brand, set the noir/editorial tone, deliver primary CTA in under one screen.

**Layout.** Full viewport height, contents centered.

**Structure (top to bottom).**
1. Floating brand mark (56px), animated with `lp-float` keyframe (`translateY(-10px)` every 4.5s, sine ease).
2. Display H1: "Three<br />Sentences." at `clamp(72px, 12vw, 180px)`, letter-spacing -6, line-height 1.
3. Mono tagline "BE BETTER. DO BETTER." at 14px, letter-spacing 4.8 (the widest in the system).
4. Lead paragraph (max-width 560): "A quiet daily journaling practice on a single truth..."
5. CTA row: `fill` "Request access →" + `ghost` "See how it works" (smooth-scrolls to `#rule`).
6. Trust strip: "Invite only · Launching Q4 2026 · iOS first" in mono caps, separated by 4×4 dots.

**Effects.**
- Hero contents track scroll: `translateY({y * 0.3}px)` up to 200px max + `opacity = 1 - y/600`.
- Background glow translates at half rate (`y * 0.15`) and fades with hero.
- Bottom: "SCROLL" mono label + 1px gradient line as scroll cue (fades with hero).

### 7.2 Problem

**Purpose.** Name the antagonist (existing journaling apps) and pivot to the alternative.

**Structure.**
- Centered headline + lead paragraph.
- Side-by-side comparison table inside a single rounded border (24px radius):
  - **Left** ("The old way"): H3 in dim ink + 4 struck-through bullet list items.
  - **Right** ("The Three Sentences way"): H3 in bright ink + 4 white-dot bullets.

**Copy structure for headline:**
```
Most journaling apps ask you to write a lot.
[break]
[dim ink] So most days, you write nothing.
```
The visual color shift inside one sentence enacts the meaning — "a lot" is bright, "nothing" is dimmed.

### 7.3 Rule (with live demo)

**Purpose.** State the product's one rule and prove it in real time.

**Layout.** 1.1fr / 0.9fr two-column.

**Left column.**
- Eyebrow "THE ONLY RULE"
- H1: "Three. / No more, / no less." — last two lines in `INK_DIM`
- Lead paragraph
- A live `<MiniDots filled={3}>` + "3 / 3 · ready" mono label

**Right column.**
- `<MiniPhone>` with `<PhoneWritingDemo>` inside.

**`<PhoneWritingDemo>` behavior.**
1. On scroll into view (`threshold: 0.3`), wait 400ms.
2. Type a hard-coded 3-sentence script character by character (38–68ms per char, randomized).
3. Update `filled` count as each sentence boundary is crossed.
4. After typing completes, wait 600ms, then transition to "submitted" state:
   - Title changes "Today" → "Done."
   - Streak pill border + flame become `INK_BRIGHT`
   - Text moves into a `SURFACE` card with bright left border
   - Counter label becomes "✓ Locked"
   - CTA fills white, label becomes "Submitted · Tomorrow returns"

The script:
```
The rain stopped just after lunch.
I walked the long way to the post office.
A small kindness from a stranger.
```

### 7.4 How It Works

**Purpose.** Demystify daily usage as three discrete acts.

**Structure.** 3-column grid of step cards.

**Each card contains:**
1. Mono "Step 0N" label
2. Giant serif italic step numeral (110px, opacity 0.85)
3. H3 title with a period: "Open the app." "Write three sentences." "Close it. Return tomorrow."
4. Body paragraph (`P`)

Cards have `1px LP_FRAME` border, 20px radius, `rgba(255,255,255,0.012)` background. No hover effect — these are read, not clicked.

**Stagger reveal.** Each card delays by 150ms × index.

### 7.5 Features

**Purpose.** Walk through the four core surfaces of the app.

**Layout.**
- Centered eyebrow + H2 ("A quiet shape for a loud year.")
- Tab selector row: 4 mono uppercase chips (Today / History / Insights / The Circle). Active chip is `INK_BRIGHT` fill.
- Below the tabs: two-column 1fr/1fr grid swapping content based on active tab. Left = copy (H2 + Lead). Right = `<MiniPhone>` with the tab's screen.

**Spacing (explicit values).**

| Where | Value |
|---|---|
| Section vertical padding | `py={180}` |
| Section background | `LP_PAPER_2` |
| Header block bottom margin | `80px` |
| Eyebrow → H2 gap (inside header) | `28px` |
| Tab selector row bottom margin | `72px` |
| Tab chip padding | `10px 22px` |
| Tab chip gap | `8px` |
| Tab font | `LP_MONO 11px / letter-spacing 1.8 / uppercase` |
| Active tab transition | `all 200ms ease` |
| Active tab content fade | `lp-fade-in 400ms ease` |
| Two-column grid gap | `80px` |
| Left-column H2 size | `52px` |
| Left-column Lead margin-top | `28px` |
| Left-column Lead max-width | `500px` |
| Phone size | `340 × 700` |

**Tab transition.** `display: none` on inactive tabs (no slide animation). The active tab content fades in 400ms.

**Four screens** to mock at small scale:
1. **Today** — date, "Today" italic title, prompt strip, two sentences mid-typing with cursor, counter 2/3, ghost Submit. Internal column gap `14px`. Submit pill gets `margin-top: 8px` + `margin-bottom: 14px` so it breathes off the counter row.
2. **History** — "History · 184 entries" eyebrow + "Your year" italic title with search icon, month navigation row (caret ← "June 2026" → caret), weekday header, 5-row calendar grid with day numbers and written/empty/today/future variants, legend row (written / empty / today swatches), stats strip pinned to bottom via `margin-top: auto`.
3. **Insights** — streak hero card with italic "13" + body line, 3 stat tiles (Longest / Entries / Goal), and a **prompt stack** of 4 cards. The bright `INK_BRIGHT` left border cycles between cards every 1800ms; active card gets 100% opacity + bright eyebrow + 13px italic body; inactive cards drop to 60% opacity + `INK_FADE` left border + 12px. Cards cascade in on mount at +220ms per index.
4. **The Circle** — cycles three sub-views every 5s with 600ms cross-fade + 8px translate:
   - **Circle list**: 5 friends with avatars, last-message previews, streak counts, unread dots. Search bar at top, "End-to-end encrypted" footer.
   - **DM**: chat header (‹ back, avatar + @handle + ACTIVE NOW, ⋮ menu), 5-message thread (incoming bubble = `LP_SURFACE` with `LP_FRAME` border; outgoing = `LP_INK_BRIGHT` fill), input row with send button.
   - **Group chat**: stacked avatar header for "Sunday Circle", multi-sender messages tagged with mono name labels, same bubble system. Pager pill at the bottom (active stretches to 14×4px, inactive 4×4px) tracks which view is showing.

### 7.6 363

**Purpose.** Land the philosophical pivot — "you cannot be perfect, but you can be relentless" — via a single dominant number.

**Structure.** Centered, single column, generous vertical breathing room (200px section padding).

**Layers (bottom up):**
1. Background: giant "363" watermark in serif italic at `clamp(220px, 32vw, 520px)`, opacity 0.03, letter-spacing -12. Behind content, `pointer-events: none`.
2. Foreground:
   - Eyebrow "NOT 365."
   - Counting numeral animating from 000 to 363 (1800ms total, +3 per frame). Always padStart to 3 digits.
   - H2 pair: "You cannot be perfect." (dim) + "But you can be relentless." (bright) — laid out inline so the contrast in color reads as continuation.
   - Lead: explanation of grace.

**Counter animation.** Use `useInView` to trigger. Use `requestAnimationFrame`, increment by 3 each frame, terminate at 363. Roughly 1.8s total at 60fps.

### 7.7 Principles

**Purpose.** State product values in four bite-size declarations.

**Structure.** 2×2 grid with `20px` gap. Each cell is a fully self-contained card with uniform `20px` border-radius. (Previously experimented with corner-specific radii + 2px gap to form a single rounded shape — abandoned because the hairline borders read as broken; standalone cards read more disciplined and give each principle its own visual frame.)

**Each cell:**
- Mono number eyebrow ("01" — "04")
- H3 title with period: "Permanence." "Privacy." "Presence." "People."
- Body paragraph (`line-height: 1.65` for easier reading)

Background: `rgba(255,255,255,0.012)`. Border: 1px `LP_FRAME`. Padding: `56px 52px`. Internal rhythm: eyebrow → 24px → H3 → 20px → body.

**Stagger reveal.** 80ms per card.

### 7.8 AI Reflection

**Purpose.** Address the AI question head-on. Show, don't tell.

**Layout.** 1fr/1fr two-column.

**Left column.**
- Eyebrow "OPTIONAL · ALWAYS OPT-IN"
- H2: "AI that finds patterns / without rewriting you."
- Lead paragraph
- Timeframe chip row: `7 days / 30 days / 90 days`. Active chip = `LP_INK` fill, dark text.

**Right column.**
- Three stacked cards bound by content state:
  1. **Theme card** (`SURFACE` + `FRAME` border): mono "THEME" + 24px italic display.
  2. **Observation card** (`SURFACE` + `FRAME` border): mono "OBSERVATION" + body paragraph.
  3. **Question card** (`SURFACE` + 2px `INK_BRIGHT` left border): mono "A QUESTION TO SIT WITH" in white + 20px italic question.
- Footer caption: "AI patterns may be wrong. Use with care. Crisis resources always available."

Three hard-coded reads for 7/30/90. Clicking a chip swaps content instantly (no loading sim — that's reserved for the app itself).

### 7.9 Trust

**Purpose.** Quiet social proof. No headshots, no logos.

**Structure.** 3-column grid.

**Each card:**
- Decorative serif italic `"` glyph at 60–80px, opacity 0.12, line-height 0.6, sitting at top-left. Title pulls up over it with negative margin -32px.
- Quote body in serif italic 20px, `INK`.
- `marginTop: auto` to push attribution to bottom.
- Hairline 32px wide + attribution in body color, fontSize 12.

**Quote sources.** Use abstract location-based bylines ("Early beta tester, London" / "Designer, New York" / "Founder, Singapore"). No names yet — protects beta privacy and avoids the "made-up customer" look of generic startup landings.

### 7.10 FAQ

**Purpose.** Address objections before they cause a bounce.

**Structure.** Single 840px-wide column.

**Header:** Eyebrow + H2 ("Questions people ask / before they start.")

**Items.** 7 accordion rows separated by 1px `LP_FRAME` top borders. Final border closes the list.

**Each item:**
- Question in serif italic 22px, `INK`.
- A 32px circle with `+` icon. On open, rotates 45° (becomes ×). 220ms ease.
- Answer reveals via `max-height` transition (0 → 300px), 300ms cubic-bezier(0.16, 1, 0.3, 1).
- Answer text is `Lead` at 16px.

**State.** Single-open at a time (`useState(open: i | null)`). Click already-open question to close.

### 7.11 Final CTA

**Purpose.** Convert. Last chance.

**Structure.** Centered, 200px section padding, dot grid + radial glow backdrop.

**Content (top to bottom):**
1. `<Mark size={52}>` centered
2. Hero H1: "Start with / today." — same scale as the opening hero
3. Lead (520px max-width)
4. Single `fill lg` CTA "Request access →"
5. Bottom mono strip: "Invite only · iOS · Q4 2026 · No spam, ever"

The final CTA is **structurally a mirror of the hero** — same backdrop, same mark size, same display H1, same trust strip. This creates a "we're back" closing parallel.

### 7.12 Footer

**Purpose.** Last orientation. Light on links, heavy on closing tone.

**Structure.** 2fr/1fr/1fr/1fr grid (left column is double-wide).

**Column 1 (wide).** Mark + wordmark, body paragraph, ghost CTA "Request access".
**Columns 2–4.** Three link columns — Product, Company, Legal — with mono eyebrows and 5 plain text links each (no underlines, hover → ink).

**Below.** Hairline divider, then bottom row: copyright (left) + brand handles (right, mono caps): `@363v1 · three63.com`.

### 7.13 Waitlist Modal

**Purpose.** Email capture, soft confirmation.

**Layout.** Centered 520px-wide card. Backdrop blur. Animate in: `translateY(16px) scale(0.98) → translateY(0) scale(1)` over 300ms cubic-bezier(0.16, 1, 0.3, 1).

**Form state.**
- `<Mark size={36}>`
- H3 "Request early access."
- Lead description
- 54px tall input with placeholder "your@email.com"
- Full-width fill CTA "Join the waitlist", disabled until `/\S+@\S+\.\S+/.test(email)`
- Caption: "No spam. No marketing. Just a single note when your spot opens."

**Success state** (after submit):
- `<Mark size={44}>`
- H3 "You're on the list."
- Lead: "We'll send you in when there's room..."
- Eyebrow at bottom: "BE BETTER. DO BETTER."

**Close affordances.**
- Backdrop click
- × button in top-right (36px circle with FRAME border)
- Escape key

---

## 8. Interactions & Motion

### 8.1 Keyframes

```css
@keyframes lp-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}
@keyframes lp-cursor {
  0%, 49%   { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes lp-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes lp-modal-in {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

### 8.2 Scroll behaviors

| Element | Behavior |
|---|---|
| Nav | Elevates (padding shrink + backdrop blur + border) when `scrollY > 40` |
| Hero contents | Translate down (parallax 0.3) and fade out by `scrollY = 600` |
| Hero background glow | Translates at 0.5 of parallax |
| Scroll cue | Fades with hero |
| All Reveals | Trigger once via `IntersectionObserver` at `threshold: 0.15` |
| 363 counter | Counts up via rAF once scrolled in at `threshold: 0.2` |
| Typing demo | Starts typing once in at `threshold: 0.3` |

### 8.3 Hover & focus

- **Nav links.** Color fades `INK_DIM → INK` (200ms).
- **CTAs.** `translateY(-1px)` (200ms ease).
- **Footer links.** Color fades `INK_DIM → INK` (180ms).
- **FAQ items.** No hover state — only the click rotation.
- **Tab chips.** Active = fill; inactive has no hover state (avoid feel-of-button when only one is "the answer").
- **Modal input focus.** No outer ring; the input is inside an already-bordered container.

### 8.4 Reduced motion

Honor `prefers-reduced-motion: reduce`:
- Disable `lp-float`, `lp-cursor`, hero parallax, 363 counter animation.
- Replace `Reveal` translate with instant opacity 1.
- Modal & FAQ still expand for clarity, but with `transition-duration: 0`.

---

## 9. Forms & State

### 9.1 Top-level state

```ts
const [waitlistOpen, setWaitlistOpen] = useState(false);
const openWaitlist = () => setWaitlistOpen(true);
```

Pass `openWaitlist` to:
- `Nav.onCTA`
- `Hero.onCTA`
- `RuleSection.onCTA`
- `FinalCTASection.onCTA`
- `Footer.onCTA`

### 9.2 Waitlist modal state

```ts
const [email, setEmail] = useState('');
const [submitted, setSubmitted] = useState(false);
const valid = /\S+@\S+\.\S+/.test(email);
```

On submit:
1. Validate `valid`.
2. (Production) POST email to backend / Supabase.
3. Set `submitted = true`.
4. Reset on close (`setSubmitted(false); setEmail('');`).

### 9.3 AI section state

```ts
const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
```

Three hard-coded reads. Switch swap is instant.

### 9.4 Features section state

```ts
const [active, setActive] = useState<0 | 1 | 2 | 3>(0);
```

Renders all four `<div>`s but hides inactive ones via `display: none`. Active one fades in via `lp-fade-in`.

### 9.5 FAQ state

```ts
const [open, setOpen] = useState<number | null>(null);
```

Single-open at a time. `setOpen(open === i ? null : i)`.

---

## 10. Responsive Behavior

### 10.1 Breakpoints

| Breakpoint | Width |
|---|---|
| Desktop | `≥ 1280px` |
| Tablet | `768px – 1279px` |
| Mobile | `< 768px` |

### 10.2 Mobile adjustments

- **Nav.** Hide the four mono link items; keep mark + CTA. Optionally add a hamburger that drops a vertical sheet menu.
- **Section padding.** Drop from 160 → 100 vertical, 64 → 24 horizontal.
- **Hero type.** Already `clamp()`-scaled. Verify the mark doesn't overlap the floating mark animation.
- **Two-column grids** (Rule, AI Reflection, Features) → single column. Phone moves below text.
- **Three-column grids** (How It Works, Trust) → single column with 20px gap. Cards stay full-width.
- **Principles 2×2 grid** → single column. Each cell gets `borderRadius: 20px` on its own.
- **Comparison table.** Single column. The two cards stack — old way first, new way second.
- **FAQ.** Reduce question size 22 → 18.
- **Footer.** 2fr/1fr/1fr/1fr → 1fr (stacked sections).

### 10.3 Tablet middle ground

- Keep two-column layouts but reduce gap from 80 → 48.
- Reduce horizontal section padding to 32.

---

## 11. Accessibility

- **Color contrast.** All ink-on-paper combinations exceed WCAG AA. `INK_DIM` body on `LP_PAPER` ≈ 5.8:1.
- **Semantic HTML.** Use `<section>`, `<nav>`, `<main>`, `<footer>`, `<button>`. Headings nest correctly: one `<h1>` per page (the hero), `<h2>` per section, `<h3>` for cards.
- **Skip link.** Add a "Skip to main content" link as the first focusable element. Hidden until focused.
- **Focus rings.** Production must add a visible focus indicator. Recommended:
  ```css
  :focus-visible { outline: 2px solid #fff; outline-offset: 4px; border-radius: 4px; }
  ```
- **Modal trap.** When open, trap focus inside the modal. First focus → email input. Escape closes.
- **Aria labels.** Mark icons + close buttons need `aria-label="Close"` etc. Hidden decorative shapes use `aria-hidden`.
- **Reduced motion.** See [Section 8.4](#84-reduced-motion).
- **Tap targets.** All buttons ≥ 44px height — verified in `<CTA size="sm">` (40px is borderline; bump to 44 for mobile if needed).

---

## 12. Performance Budget

- **Initial JS payload.** Target < 100KB gzipped for the landing route. The prototype uses CDN React (200KB+); production should ship the smallest React bundle possible or, ideally, a static HTML build.
- **Font loading.** Preconnect to `fonts.gstatic.com`. Use `display: swap`. Subset to Latin + Latin-extended if you don't need extended glyphs.
- **Images.** No raster imagery used; the design is type + UI. If product screenshots are added later, serve AVIF/WebP with `<img loading="lazy">`.
- **Animations.** All keyframes are transform/opacity only — GPU-cheap. No layout thrash.
- **Scroll listeners.** `useScrollY` uses passive listeners. Throttle if profiling shows scroll-induced layout work.

---

## 13. SEO & Meta

```html
<title>Three Sentences · Be better. Do better.</title>
<meta name="description" content="A quiet daily journaling practice on a single rule: write exactly three sentences. Invite only. Launching Q4 2026.">
<meta name="theme-color" content="#060608">
<link rel="canonical" href="https://three63.com">

<!-- Open Graph -->
<meta property="og:title" content="Three Sentences · Be better. Do better.">
<meta property="og:description" content="A quiet daily journaling practice on a single rule: write exactly three sentences.">
<meta property="og:image" content="https://three63.com/og.png">  <!-- 1200×630 noir image with mark + headline -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://three63.com">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Three Sentences · Be better. Do better.">
<meta name="twitter:image" content="https://three63.com/og.png">
```

**OG image guidance.** Generate a 1200×630 noir image with the brand mark, hero stack "Three / Sentences.", the mono tagline. Static export from the hero section works.

---

## 14. Implementation Checklist

Build in this order. Each step is a runnable artifact.

### Phase 1 — Foundation
1. Set up project (Next.js 14+ recommended).
2. Load fonts via `next/font` (Schibsted Grotesk, Newsreader, IBM Plex Mono).
3. Define theme tokens in `tailwind.config.ts`.
4. Build `<Section>`, `<Reveal>`, `<DotGrid>`, `<Hairline>` primitives.

### Phase 2 — Type & atoms
5. Implement `Eyebrow`, `H1`, `H2`, `H3`, `Lead`, `P` with `clamp()` sizes.
6. Implement `<CTA>`, `<Mark>`, `<MiniDots>`, `<MiniPhone>`.

### Phase 3 — Composite
7. `<Nav>` with scroll elevation.
8. `<WaitlistModal>` with form + success states.
9. `<Footer>`.

### Phase 4 — Sections
10. Hero — including parallax & floating mark.
11. Problem comparison table.
12. Rule + `<PhoneWritingDemo>` typing animation.
13. How It Works step cards.
14. Features with tab swap.
15. 363 with watermark + counter.
16. Principles 2×2.
17. AI Reflection with timeframe chips.
18. Trust quotes.
19. FAQ accordion.
20. Final CTA.

### Phase 5 — Polish
21. Reduced-motion overrides.
22. Mobile responsive pass.
23. Focus rings + skip link.
24. Lighthouse pass — target 95+ Performance, 100 Accessibility, 100 SEO.
25. Real backend wiring for waitlist (Supabase already scaffolded — `threesentences/landing/lib/supabase.ts`).

---

## Appendix A — File Layout (Production)

```
src/
  app/
    layout.tsx              // Fonts, meta, theme-color
    page.tsx                // Single-page landing
    globals.css             // Tokens as CSS vars
  components/
    primitives/
      Section.tsx, Reveal.tsx, DotGrid.tsx, Hairline.tsx
    typography/
      Eyebrow.tsx, H1.tsx, H2.tsx, H3.tsx, Lead.tsx, P.tsx
    atoms/
      CTA.tsx, Mark.tsx, MiniDots.tsx, MiniPhone.tsx
    sections/
      Nav.tsx, Hero.tsx, ProblemSection.tsx, RuleSection.tsx,
      PhoneWritingDemo.tsx, HowSection.tsx,
      FeaturesSection.tsx, [Phone*Preview].tsx,
      The363Section.tsx, PrinciplesSection.tsx,
      AISection.tsx, TrustSection.tsx, FAQSection.tsx,
      FinalCTASection.tsx, Footer.tsx
    modal/
      WaitlistModal.tsx
  hooks/
    useInView.ts, useScrollY.ts
  lib/
    waitlist.ts             // Backend POST
```

---

## Appendix B — Reference Implementation Files

| File | Contents |
|---|---|
| `Three Sentences Landing Page.html` | Entry HTML, font loading, script tags |
| `landing/system.jsx` | Tokens, type components, atoms, hooks |
| `landing/sections-a.jsx` | Nav, Hero, Problem, Rule (+ typing demo), How |
| `landing/sections-b.jsx` | Features, 363, Principles, AI, Trust |
| `landing/sections-c.jsx` | FAQ, Final CTA, Waitlist modal, Footer |
| `landing/app.jsx` | Root composition, global keyframes |

---

*End of landing-page specification.*
