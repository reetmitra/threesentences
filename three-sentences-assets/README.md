# Three Sentences · Asset Handoff

Drop-in SVGs for the Three Sentences app. All vectors, all `currentColor` where it makes sense — recolor in CSS.

## Folder layout

```
svg/
├── logo/         App icon + favicon + logomark variants
├── wordmark/     "Three Sentences" + 3hree display variant
├── watermark/    363 — secret-number watermark
└── icons/        15 outline UI icons (24×24, 1.5 stroke, currentColor)
```

## Logo

| File | Use |
|------|-----|
| `logo/primary.svg` | Primary mark — white tile, three ink dots (1024) |
| `logo/reversed.svg` | Reversed — ink tile, three bone dots (1024) |
| `logo/app-icon.svg` | iOS / Android app icon, full-bleed (1024) |
| `logo/mono-dots.svg` | Three dots only, no tile (1024×320) — use inline with type |
| `logo/favicon.svg` | 64×64 favicon |

## Wordmark

| File | Use |
|------|-----|
| `wordmark/wordmark-ink.svg` | "Three Sentences" — Newsreader italic, ink on transparent |
| `wordmark/wordmark-paper.svg` | Same, in paper noir |
| `wordmark/3hree-variant.svg` | Playful display wordmark — for marketing only |

> Wordmark SVGs reference Newsreader by name. Embed the font or convert to outlines for use in environments without the typeface.

## Watermark

| File | Use |
|------|-----|
| `watermark/363.svg` | Ink variant — background watermark |
| `watermark/363-amber.svg` | Amber accent variant — crisis / warn surfaces |

## Icons (24×24, 1.5 stroke)

All icons are `currentColor`, 24×24, 1.5px stroke. Set color via CSS:

```css
.icon { color: var(--ink); width: 24px; height: 24px; }
```

Available: `arrowL`, `arrowUp`, `bell`, `caret`, `chat`, `check`, `close`, `edit`, `flame`, `lock`, `more`, `plus`, `search`, `spark`, `wifi`.

## Color tokens

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

## Type

- **Newsreader** — italic, 400. Display, H1, H2, pull-quotes.
- **Schibsted Grotesk** — 400 / 500 / 600. UI and body.
- **IBM Plex Mono** — 500, uppercase, generous tracking. Eyebrows, dates, meta.
