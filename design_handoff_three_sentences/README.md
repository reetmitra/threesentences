# Handoff: Three Sentences

> **A complete, build-ready handoff package for implementing the Three Sentences product in production code.**
> Everything in this folder — brand assets, design tokens, full UI specs, and live prototypes — has been distilled from the user's brief, the `threesentences` codebase, and the two authoritative spec docs in `specs/`. A developer who was not in the design conversation should be able to ship from this folder alone.

---

## 1. About the design files

The HTML in this bundle (`brand/`, `ui_kits/mobile/`, `ui_kits/landing/`, `preview/`) is a set of **design references** — single-file React + Babel prototypes that demonstrate the intended look, motion, and interaction model. **They are not production code to copy directly.**

Your task is to **recreate these designs in the target codebase's environment**:

- The original product is **React Native + Expo (mobile)** and **Next.js + Tailwind + Framer Motion (landing)** — see `threesentences/` if you have the repo.
- If you are starting fresh, those are still the recommended stacks. The prototypes deliberately mirror those framework patterns (the mobile prototype's component layout in `ui_kits/mobile/proto-*.jsx` maps 1:1 to a React Native file structure; see Appendix A in `specs/Three Sentences UI Spec.md`).
- If shipping into an existing codebase with established patterns (component library, state management, design tokens) — **use those patterns**. The bundled HTML inlines styles and uses CDN React because that's the right tool for a prototype, not for production.

## 2. Fidelity

**High-fidelity (hi-fi).** Every color, font, size, spacing value, radius, easing curve, and interaction has been settled and is final. The two spec markdowns in `specs/` are pixel-precise. Recreate exactly — do not redesign.

The few intentional flexibilities:
- **Newsreader font fallback.** If you can't ship Newsreader for some reason, use Iowan Old Style / Georgia. Do NOT substitute with a generic transitional serif — the italic shape carries the brand.
- **Schibsted Grotesk fallback.** Helvetica Neue / Arial is acceptable. Inter is not — it changes the weight curve.
- **IBM Plex Mono fallback.** SF Mono / Menlo. The tracking values were tuned to Plex.

## 3. What to read first

| File | Why |
|---|---|
| `specs/Three Sentences UI Spec.md` | **Authoritative**. 14-section, screen-by-screen spec for the mobile app — tokens, components, every screen, every modal, every edge case, every keyframe. **Read end-to-end before coding.** |
| `specs/Three Sentences Landing UI Spec.md` | Same, for the marketing site. 14 sections covering all 12 page sections + waitlist modal. |
| `DESIGN_SYSTEM.md` | High-level overview, content fundamentals, visual foundations, iconography. |
| `colors_and_type.css` | The canonical CSS variables. Use as the source of truth for tokens, or port to your stack's token system. |
| `brand/README.md` | Manifest of brand assets and how they map to design moments. |
| `SKILL.md` | The non-negotiable rules — what to ship, what to refuse. |

---

## 4. The product in one paragraph

Three Sentences is a daily journaling practice with one rule: **write exactly three sentences about your day, then submit. The entry is permanent.** The constraint is enforced visually (dot counter), gated functionally (submit disabled at 0/1/2/4+), and explained narratively ("The constraint is the point. Cut one."). The goal is 363 days out of 365 — two days of grace, built in, "you cannot be perfect, but you can be relentless." Five tabs: Today, History, The Circle (friends), Insights, Settings. AI reflection is opt-in.

The aesthetic is **noir editorial**: dark monochrome, restrained, italic serif for emotional/numeric moments, mono for metadata, sans for UI. Reads like a quiet broadsheet, never a SaaS dashboard.

---

## 5. Design tokens

Full token set lives in `colors_and_type.css`. The essentials:

### Color
```
Paper interior      #0e0e10    --paper
Outer canvas        #060608    --paper-bg
Surface             #15151a    --surface
Surface hi          #1c1c22    --surface-hi
Frame (hairlines)   #1e1e22    --frame

Ink (body)          #ebe7dc    --ink           bone-ivory — never pure white
Ink bright          #ffffff    --ink-bright    CTAs, active, submitted highlight
Ink dim             #75726a    --ink-dim       secondary, metadata
Ink fade            #36363a    --ink-fade      empty-dot outlines, placeholders

Cream (editorial)   #efece5    --cream         out-of-app surfaces (brand sheet, deck title cards)
Cream hi            #f6f4ee    --cream-hi
Cream lo            #e4dfd2    --cream-lo

Warn (amber)        #f6c177    --warn          over-count, offline banner, crisis only
```

**No other colors. No gradients. No emoji. No drop shadows on UI** (only on the phone frame in the landing-page mockups).

### Type families
```
'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif    --sans     UI, body, headings
'Newsreader', 'Iowan Old Style', Georgia, serif             --serif    wordmark, numerals, reading-mode entries
'IBM Plex Mono', ui-monospace, Menlo, monospace             --mono     eyebrows, metadata, counters
```

### Italic discipline (the rule that keeps the system from reading as AI slop)
Italic Newsreader is permitted in only **three contexts**:
1. The brand wordmark ("Three Sentences" in nav, splash, footer)
2. Large display numerals (streak count, 363 watermark, milestone numbers ≥ 40px)
3. The 3hree variant wordmark, used sparingly in modal headers

Reading-mode entry bodies use **upright** Newsreader (not italic) — it's a journal page, not a pull-quote.

Everything else — page titles, prompts, principles, AI reflection text, milestone subtitles, card titles, "Welcome back.", "Begin." — is **Schibsted Grotesk semibold**. No italic. No mixing.

### Spacing
4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 22 / 24 / 28 / 32 / 40 / 48 / 56 / 64 / 72 / 80 / 100 / 120 / 160 / 200 px.
- Phone-edge horizontal padding: **24px** for content, **18–22px** for headers.
- Landing section padding: **160px top + bottom** (Final CTA is 200px); page edge **64px** desktop.

### Radius
| Use | Radius |
|---|---|
| Pills (buttons, chips, streak badges) | `999` |
| Cards | `12–20` |
| Inputs | `10–12` |
| Modal | `24` (mobile sheets `16` top corners only when bottom-anchored) |
| Phone frame | `50` (mobile prototype) / `width × 0.13` (landing demo) |
| Brand mark tile | `22%` of size |

### Motion
- **Brand spring ease:** `cubic-bezier(0.16, 1, 0.3, 1)` — use everywhere. Default 280ms (screen-in), 180ms (modal fade), 900ms (landing reveals).
- **Splash juggle:** `cubic-bezier(0.34, 1.5, 0.64, 1)` — overshoot bounce, used only on the splash dot entrance.
- **No ripples, no scale-on-press, no hover lift** in the app. Underlying color shifts are the affordance.
- **Reduced-motion:** honor `prefers-reduced-motion: reduce`. Disable juggle, parallax, count-up, screen-in keyframes.

---

## 6. Information architecture

### Mobile app (5 tabs)
1. **Today** — Two states. Empty/writing (textarea + sentence counter + submit-disabled-until-3). Submitted/locked (read-only EntryCard, AI reflect peek, streak ladder).
2. **History** — Calendar grid. Written days are solid ink, empty days hairline-bordered, today ringed. Tap a written day → entry modal. Bottom stats strip.
3. **The Circle** — Friends list / Requests tabs, search bar. Tap friend → chat modal. End-to-end encrypted messaging.
4. **Insights** — Streak hero (italic 64px numeral), 3-stat tiles, daily prompt card, AI reflection CTA, principle card, crisis-resources link.
5. **Settings** — Profile card, grouped sections with toggles (Practice / Notifications / Safety / Account), version footer.

### Modals
`entry:<dateKey>` · `reflect` · `reflect-off` · `crisis` · `conversations` · `chat:<friendId>` · `milestone:<count>` · `profile` · `invite` (bottom sheet) · `reset` (centered confirm).

### Pre-app flow
Splash → Login / Signup → Profile setup → Interests (pick 3 of 15) → 4-step onboarding → Main app.

### Landing page (12 sections)
Nav · Hero · Problem · Rule (with live typing demo) · How (3 steps) · Features (tabbed phone previews) · 363 (count-up) · Principles (2×2) · AI Reflection (timeframe chips) · Trust (3 quotes) · FAQ (accordion) · Final CTA · Footer · Waitlist Modal.

---

## 7. Component library

All atoms and composites are enumerated in **`specs/Three Sentences UI Spec.md` Section 5** (mobile) and **`specs/Three Sentences Landing UI Spec.md` Section 5** (landing). Each component has props, states, and exact dimensions.

| File | Working reference implementation |
|---|---|
| `ui_kits/mobile/proto-shell.jsx` | Tokens, icons, layout primitives, AppProvider, `useApp`, sentence parser, streak calc, `<MarkDot>`, `<Btn>`, `<Chip>`, `<Avatar>`, `<Switch>`, `<CountDots>`, `<StreakPill>`, `<Toast>`, `<PageHeader>`, `<TabBar>`, `<PhoneFrame>`, `<StatusBar>`, `<HomeIndicator>`, `<ModalSheet>`, `<Skel>`, `<ScreenFade>` |
| `ui_kits/mobile/proto-auth.jsx` | `<ScreenSplash>`, `<ScreenLogin>`, `<ScreenSignup>`, `<ScreenProfile>`, `<ScreenInterests>`, `<ScreenOnboard>`, `<Field>` |
| `ui_kits/mobile/proto-today.jsx` | `<ScreenToday>` (empty/writing + submitted states) |
| `ui_kits/mobile/proto-history.jsx` | `<ScreenHistory>`, `<HistoryEmpty>`, `<EntryModal>` |
| `ui_kits/mobile/proto-insights.jsx` | `<ScreenInsights>`, `<ReflectModal>`, `<ReflectOffModal>`, `<CrisisModal>` |
| `ui_kits/mobile/proto-social.jsx` | `<ScreenSocial>`, `<FriendRow>`, `<RequestsList>`, `<ConversationsModal>`, `<ChatModal>`, `<InviteModal>` |
| `ui_kits/mobile/proto-account.jsx` | `<ScreenSettings>`, `<ProfileModal>`, `<MilestoneModal>`, `<ResetModal>` |
| `ui_kits/mobile/proto-app.jsx` | Top-level router, dev panel, viewport scaling |
| `ui_kits/landing/landing-system.jsx` | Landing tokens, `<Section>`, `<Reveal>`, `<DotGrid>`, `<Hairline>`, typography (`H1`/`H2`/`H3`/`Lead`/`P`/`Eyebrow`/`Meta`), `<CTA>`, `<Mark>`, `<MiniDots>`, `<MiniPhone>`, `useInView`, `useScrollY` |
| `ui_kits/landing/landing-sections-a.jsx` | Nav, Hero, Problem, Rule (+`<PhoneWritingDemo>` typing animation), How |
| `ui_kits/landing/landing-sections-b.jsx` | Features (tabbed phone previews including cycling Circle/DM/Group views), 363 (count-up), Principles, AI Reflection, Trust |
| `ui_kits/landing/landing-sections-c.jsx` | FAQ accordion, Final CTA, Footer, WaitlistModal |

### Brand mark — the three-dots-in-a-rounded-tile

The defining visual element. Six asset variants, all in `assets/logo/`:
- `primary.svg` (white tile, ink dots, 1024px) — default on dark surfaces
- `reversed.svg` (ink tile, bone dots) — for cream/light backgrounds
- `app-icon.svg` (full-bleed, no margin) — iOS/Android icon export
- `mono-dots.svg` (320×80, dots only) — for inline lockups in nav/footer
- `favicon.svg` (64×64) — web favicon

Proportions (locked):
```
tile radius   = size × 0.22
dot radius    = size × 0.062
dot spacing   = size × 0.21
3 dots evenly distributed horizontally, vertically centered
```

---

## 8. State model

Single global state object, persisted to `localStorage` (web) / `AsyncStorage` (RN) under key `ts-proto-v1`. **Spec Section 6** has the full TypeScript type.

```ts
type AppState = {
  flow: 'splash' | 'login' | 'signup' | 'profile' | 'interests' | 'onboard' | 'app';
  onboardStep: 0 | 1 | 2 | 3;
  tab: 'today' | 'history' | 'social' | 'insights' | 'settings';
  modal: string | null;        // namespaced — see Section 6.1
  user: { name, handle, interests: string[3], bio };
  draft: string;
  entries: { [dateKey: 'YYYY-MM-DD']: { sentences: string[3]; submittedAt: 'h:mm AM/PM' } };
  friends: Friend[];
  requests: Friend[];
  suggested: Friend[];
  chats: { [friendId]: ChatMessage[] };
  prefs: { aiReflection, notifications, dailyPrompt, reminderTime, crisisDetection, online };
};
```

### Derived values
```js
streak       = walk backwards from today through consecutive entries; if today not written, start from yesterday
todayEntry   = entries[TODAY_KEY] or null
totalEntries = Object.keys(entries).length
```

### Sentence parser (faithful)
```js
function countSentences(text) {
  const parts = text.match(/[^.!?\n]+[.!?]+|[^.!?\n]+\n/g) || [];
  return parts.filter(s => s.trim()).length;
}
```
A line ending in `.`, `!`, `?`, or just `\n` counts. This accommodates poetic / lowercase entries.

---

## 9. Critical interactions to get right

These are the brand-defining moments. Get them wrong and the product feels generic.

### The sentence counter
- 0/3 → "0 / 3 · 3 more" in `--ink-dim`
- 1/3 → "1 / 3 · 2 more" in `--ink-dim`
- 2/3 → "2 / 3 · 1 more" in `--ink-dim`
- 3/3 → "3 / 3 · ready" in `--ink-bright`
- 4+/3 → "N / 3 · too many" in `--warn`, italic-serif advisory underneath: *"The constraint is the point. Cut one."*

Submit is disabled at every count except exactly 3.

### The submit-to-locked transition
On successful submit:
1. Save entry. Recompute streak.
2. Toast: "STREAK +1 · LOCKED" (mono uppercase, slides in from above).
3. Today screen re-renders into the locked variant on next paint.
4. If streak hits 7 / 30 / 100 / 363 → auto-open `milestone:N` modal.

### The 363 count-up (landing)
On scroll into view, `requestAnimationFrame` loop increments by 3 each frame until 363 (~1.8s at 60fps). `padStart(3, '0')` so it always displays as 3 digits.

### The Circle cycling preview (landing)
Three sub-views (list / DM / group chat) auto-rotate every 5 seconds with a 600ms cross-fade. Pager pill at the bottom (active stretches to 14×4px).

### The "Reveal" pattern (landing)
All `<Reveal>` content fades up (`opacity 0→1, translateY 24→0`) on scroll into view via `IntersectionObserver`. Once-only — don't replay on re-entry. Stagger children by `index * 80–150ms`.

---

## 10. Edge cases

Full enumeration in **Spec Section 11**. The non-obvious ones:

| Surface | Edge case | Treatment |
|---|---|---|
| Today | Already submitted today | Lock screen — no retry. |
| Today | Over count (4+) | Counter goes amber, advisory appears, submit stays disabled. |
| Chat | Send while offline | Failed bubble (amber-bordered, transparent) + "✕ Failed · tap to retry" link. |
| Reflect | AI is off | Redirect to `reflect-off` opt-in screen. |
| Offline mode | Anywhere | Wifi icon in status bar swaps to crossed-out; amber banner appears above status bar. |
| Milestone | Streak hits 7/30/100/363 | Auto-open milestone modal after submit. |
| History | Zero entries | Empty state with mark, "Begin.", "Write today" CTA. |

---

## 11. Assets

All in `assets/`:

| Folder | Contents |
|---|---|
| `assets/logo/` | 5 SVGs — primary, reversed, app-icon, mono-dots, favicon |
| `assets/wordmark/` | 3 SVGs — wordmark-ink, wordmark-paper, 3hree-variant |
| `assets/watermark/` | 2 SVGs — 363, 363-amber |
| `assets/icons/` | 15 outline icons at 24×24, 1.5 stroke, `currentColor` — arrowL, arrowUp, bell, caret, chat, check, close, edit, flame, lock, more, plus, search, spark, wifi |

Wordmark SVGs reference Newsreader by name — embed the font or convert to outlines for environments without the typeface.

### Sample assets to generate at build time
- App icon export (iOS / Android): start from `assets/logo/app-icon.svg`, export at 1024×1024.
- Favicon: `assets/logo/favicon.svg`.
- OG image (landing): 1200×630, noir, brand mark + hero stack "Three / Sentences." + tagline. Static export from the hero is fine.

---

## 12. Accessibility

- All ink-on-paper combinations exceed WCAG AA. `--ink-dim` on `--paper` ≈ 5.8:1.
- Tap targets ≥ 44×44.
- Semantic HTML — one `<h1>` per landing page (the hero), `<h2>` per section, `<h3>` for cards.
- Modal focus trap; first focus → email input; Escape closes.
- Icon-only buttons need `aria-label`.
- `:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }`
- Honor `prefers-reduced-motion`.

---

## 13. Performance budget (landing only)

- Initial JS ≤ 100KB gzipped. Don't ship dev React.
- Preconnect to `fonts.gstatic.com`. `font-display: swap`. Subset to Latin if possible.
- All keyframes are transform/opacity only — GPU-cheap.
- `useScrollY` uses passive listeners.

---

## 14. File layout in this handoff

```
design_handoff_three_sentences/
├── README.md                          ← you are here
├── DESIGN_SYSTEM.md                   ← high-level system overview
├── SKILL.md                           ← non-negotiable rules
├── colors_and_type.css                ← canonical CSS variables
│
├── specs/                             ← READ FIRST
│   ├── Three Sentences UI Spec.md         (mobile — 14 sections)
│   └── Three Sentences Landing UI Spec.md (web   — 14 sections)
│
├── assets/                            ← brand SVGs
│   ├── logo/                          (5 mark variants)
│   ├── wordmark/                      (3 wordmark variants)
│   ├── watermark/                     (2 — 363, 363-amber)
│   └── icons/                         (15 outline icons)
│
├── brand/                             ← branded brand sheet (open brand/index.html)
│   ├── README.md                          (asset manifest)
│   ├── index.html                         (overview)
│   ├── shared.jsx                         (brand primitives — MarkDot, Wordmark, Specimen)
│   └── 01-07 .html / .jsx                 (one per brand section)
│
├── ui_kits/
│   ├── mobile/                        ← React prototype of the entire 5-tab app
│   │   ├── README.md
│   │   ├── index.html                     (open this — interactive)
│   │   └── proto-{shell,auth,today,history,insights,social,account,app}.jsx
│   └── landing/                       ← React prototype of the marketing site
│       ├── README.md
│       ├── index.html                     (open this — interactive)
│       └── landing-{system,sections-a,sections-b,sections-c}.jsx
│
└── preview/                           ← single-purpose specimen cards
    ├── _base.css
    ├── color-*.html                       (4 color cards)
    ├── type-*.html                        (7 type cards including italic-policy)
    ├── spacing-*.html                     (3 spacing/radius/motion cards)
    ├── component-*.html                   (14 component spec cards)
    └── brand-*.html                       (7 brand cards using real SVGs)
```

---

## 15. Where to start

1. Open **`brand/index.html`** for a 60-second visual orientation.
2. Open **`ui_kits/mobile/index.html`** and tap through all 5 tabs + write/submit flow + every dev-panel modal.
3. Open **`ui_kits/landing/index.html`** and scroll the full page; click each Features tab; wait for the Circle to cycle; click "Request access" to see the waitlist modal.
4. Read **`specs/Three Sentences UI Spec.md`** front to back.
5. Read **`specs/Three Sentences Landing UI Spec.md`** front to back.
6. Wire up tokens in your codebase from **`colors_and_type.css`**.
7. Implement primitives → atoms → composites → screens, in that order (Spec Section 14 has the full phased checklist).

---

## 16. Questions to confirm with the designer / PM before starting

- Final font licensing — are Newsreader, Schibsted Grotesk, and IBM Plex Mono all approved? (All three are SIL OFL, free for commercial use.)
- Crisis-resources phone numbers — currently US-only (988 + 741741). What does international rollout look like?
- Backend: the prototype's chat is a simulated auto-reply; what's the real messaging stack (Supabase Realtime? something else)?
- "Reset prototype" affordance in Settings — keep as dev tool or strip from production?
- The dev panel in `ui_kits/mobile/proto-app.jsx` (top-right floating UI) is prototype-only — do not ship it.

---

*Built from: the `threesentences` codebase, two authoritative spec docs, and ~25 brand SVG assets. Total bundle: ~125 files, ~500KB.*
