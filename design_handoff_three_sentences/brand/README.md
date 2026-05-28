# Three Sentences · Brand

The full brand system, split into seven pieces.

## How to use

Open `index.html` in a browser for the overview, or jump straight to any section:

| # | Section | File |
|---|---------|------|
| 01 | Logo mark      | `01-logo-mark.html` |
| 02 | Wordmark       | `02-wordmark.html` |
| 03 | 3hree variant  | `03-3hree-variant.html` |
| 04 | 363 watermark  | `04-363-watermark.html` |
| 05 | Tagline        | `05-tagline.html` |
| 06 | Icons (Lucide) | `06-icons.html` |
| 07 | Atmosphere     | `07-atmosphere.html` |

Each page renders the section's specimens stacked vertically — clean for screen, print, or screenshotting.

## Raw assets

Re-usable SVGs live in `assets/svg/`:

- `logo/primary.svg` — white tile, three ink dots (1024)
- `logo/reversed.svg` — ink tile, three bone dots (1024)
- `logo/app-icon.svg` — full-bleed app-icon variant (1024)
- `logo/mono-dots.svg` — three dots only, no tile (1024×320)
- `logo/favicon.svg` — 64×64 favicon
- `wordmark/wordmark-ink.svg` — "Three Sentences" set in Newsreader italic (ink on transparent)
- `wordmark/wordmark-paper.svg` — same, in paper noir
- `wordmark/3hree-variant.svg` — the playful display wordmark
- `watermark/363.svg` — the secret number
- `watermark/363-amber.svg` — accent variant
- `icons/*.svg` — 15 outline icons at 24×24, 1.5 stroke, currentColor

> The wordmark SVGs reference Newsreader by name; embed the font file or convert to outlines for use in environments without the typeface.

## Tokens

| Role | Hex |
|------|-----|
| Paper (interior) | `#0e0e10` |
| Surface | `#15151a` |
| Frame | `#1e1e22` |
| Ink fade | `#36363a` |
| Ink dim | `#75726a` |
| Ink | `#ebe7dc` |
| Ink bright | `#ffffff` |
| Warn (crisis · 363 accent) | `#f6c177` |

Type:
- **Newsreader** — italic, 400. Display, H1, H2, pull-quotes.
- **Schibsted Grotesk** — 400 / 500 / 600. UI and body.
- **IBM Plex Mono** — 500, uppercase, generous tracking. Eyebrows, dates, meta.

## Editing

The section pages are React + Babel single-file harnesses. The component source for each is in a sibling `.jsx` file (`01-logo-mark.jsx`, etc.) that loads after `shared.jsx`. Edit the JSX, refresh, see the change.
