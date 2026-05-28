# Three Sentences — UI Specification

> **Purpose.** This document is a complete handoff for rebuilding the Three Sentences mobile UI from scratch. It is written to be fed to an LLM coding agent (Claude Code, Cursor, etc.). Every screen, component, token, interaction, and edge case is enumerated. The reference implementation lives in `Three Sentences Prototype.html` and the `proto-*.jsx` files in this project.
>
> **Target stack.** The original app is React Native + Expo. This spec is stack-agnostic where possible, but call-outs note where RN differs from web React.
>
> **Aesthetic.** "Noir" — dark, monochrome, restrained. Editorial italic serif for emotional moments, mono for metadata, sans for UI. Pure white as the only true highlight; no chromatic accents.

---

## Table of Contents

1. [Product Philosophy](#1-product-philosophy)
2. [Design Tokens](#2-design-tokens)
3. [Typography System](#3-typography-system)
4. [Iconography](#4-iconography)
5. [Component Library](#5-component-library)
6. [State Model](#6-state-model)
7. [Navigation & Routing](#7-navigation--routing)
8. [Screen Specifications](#8-screen-specifications)
9. [Modals](#9-modals)
10. [Interactions & Motion](#10-interactions--motion)
11. [Edge Cases & States](#11-edge-cases--states)
12. [Persistence & Data](#12-persistence--data)
13. [Accessibility](#13-accessibility)
14. [Implementation Checklist](#14-implementation-checklist)

---

## 1. Product Philosophy

Three Sentences is a daily journaling practice with one rule: **write exactly three sentences about your day, then submit. The entry is permanent.**

Design principles that shape every screen:

- **Restraint over expression.** Empty space, hairline borders, single-color emphasis. No gradients, no accent colors beyond pure white.
- **Editorial, not utilitarian.** Newsreader italic for headlines and emotional copy. The app reads like a quiet broadsheet, not a SaaS dashboard.
- **The constraint is the product.** "Three" is enforced visually (dot counter), gated functionally (submit disabled at 0/1/2/4+), and explained narratively ("The constraint is the point. Cut one.").
- **Permanence is a feature.** Submitted entries cannot be edited or deleted. UI reinforces this with locks, monospace "LOCKED" tags, and "no edits, no deletions" footers.
- **Privacy by default.** AI features are opt-in. End-to-end encrypted chat. "Nothing leaves the device unless you opt in."
- **Forgiveness, not punishment.** Missed days are not marked as failures. The goal is 363/365, not 365/365 — "you cannot be perfect, but you can be relentless."

---

## 2. Design Tokens

All tokens are exported from `proto-shell.jsx` as JS constants. Use semantic names — never inline hex.

### 2.1 Color

| Token | Hex | Role |
|---|---|---|
| `INK` | `#ebe7dc` | Bone-ivory. Primary text, default strokes, icons. |
| `INK_BRIGHT` | `#ffffff` | Pure white. Active states, highlights, submitted streak, milestone borders. |
| `INK_DIM` | `#75726a` | Warm grey. Secondary text, metadata, inactive tabs. |
| `INK_FADE` | `#36363a` | Very dim. Placeholder strokes, dashed borders, empty dots. |
| `PAPER` | `#0e0e10` | Phone interior background. |
| `PAPER_BG` | `#060608` | Outer canvas backdrop (only seen behind the device frame). |
| `FRAME` | `#1e1e22` | Hairline frame border (1px). All dividers, card borders. |
| `SURFACE` | `#15151a` | Card surface — slight elevation from `PAPER`. |
| `SURFACE_HI` | `#1c1c22` | Higher surface — toasts, hover states. |
| `ACCENT` | `#ffffff` | Same as `INK_BRIGHT`. Reserved name for "emphasis" semantically. |
| `WARN` | `#f6c177` | Warm amber. Only used for over-count, offline banner, crisis border, retry affordances. Never decorative. |

**Rule.** If a non-warning color enters the design, audit it. The palette is intentionally near-monochrome.

### 2.2 Spacing

The app uses an 8px-based scale with frequent 4px sub-steps:

```
4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32
```

Phone-edge padding: **24px** horizontally for content, **18–22px** for headers.

### 2.3 Radius

| Use | Radius |
|---|---|
| Pills (buttons, chips, streak badges) | `999` |
| Cards (entries, AI peek, stats) | `12–16` |
| Inputs | `10–12` |
| Phone frame | `50` |
| Status bar dynamic island | `16` |
| Brand mark tile | `~22%` of size |
| Small swatch tiles | `2–4` |

### 2.4 Shadow & Elevation

The phone frame is the only major shadow:
```css
box-shadow:
  0 60px 120px -40px rgba(0,0,0,0.95),
  0 30px 60px -30px rgba(0,0,0,0.6),
  inset 0 0 0 1px rgba(255,255,255,0.025);
```

Inside the phone: **no shadows**. Depth comes from `SURFACE` vs `PAPER`, never blur.

### 2.5 Phone Dimensions

- **Width**: `360px` (logical) — close to iPhone 14 (390pt) but slightly tighter for canvas
- **Height**: `760px`
- **Status bar**: 50px including dynamic island offset
- **Tab bar**: ~80px including home indicator and 30px bottom padding
- **Home indicator**: 120px wide × 5px tall, 9px from bottom, 50% opacity ink

---

## 3. Typography System

Three families, each with a strict role. **Never mix roles** (e.g. don't use mono for body text).

### 3.1 Families

| Family | Constant | Role |
|---|---|---|
| Schibsted Grotesk | `SANS` | UI text, buttons, body copy, navigation labels. Weights: 400, 500, 600. |
| Newsreader | `SERIF` | Italic moments — headings, quotes, prompts, milestone numbers, hero stats, pull-quotes in AI reflection. Always italic. Weight 400. |
| IBM Plex Mono | `MONO` | Metadata, dates, counters, eyebrows, system labels, "LOCKED" badges, legends. Always uppercase, letter-spaced. Weight 400–500. |

**Loading (web).** Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Loading (React Native).** Use `expo-font` with `@expo-google-fonts/schibsted-grotesk`, `@expo-google-fonts/newsreader`, `@expo-google-fonts/ibm-plex-mono`.

### 3.2 Type Scale

| Style | Family | Size | Weight | Letter-spacing | Use |
|---|---|---|---|---|---|
| Display XL | SERIF italic | 56–84 | 400 | -1.5 to -3 | Milestone numbers, splash hero |
| Display | SERIF italic | 32–38 | 400 | -0.7 | Onboarding headlines, splash wordmark |
| H1 | SERIF italic | 28–34 | 400 | -0.5 to -0.6 | Page titles ("Today", "History", "The Circle") |
| H2 | SERIF italic | 22–26 | 400 | -0.3 to -0.5 | Card titles, prompts, modal titles |
| Body | SANS | 14–15 | 400 | -0.1 to 0 | Default copy |
| Body Serif | SERIF (regular or italic) | 17–18 | 400 | -0.1 | The day's entry, AI reads, the writing surface |
| Label / Eyebrow | MONO | 9–11 | 500 | 1.2–2.4 | UPPERCASE labels, dates, counters |
| Caption | MONO | 8–10 | 500 | 0.8–1.6 | Footer disclaimers, timestamps |

**Rule.** Italic serif numbers are the brand signature — used for streak counts, milestone numbers, stats hero. Never use sans-serif for a "wow" number.

### 3.3 Line height

- Body: `1.4–1.55`
- Body serif (entries): `1.55–1.6`
- Display: `1.0–1.2`
- Mono labels: `1.0`

---

## 4. Iconography

All icons are **inline SVG, 1.3–1.5 stroke weight**, `currentColor` fill or stroke. No filled glyphs except the streak flame, sentence-counter dots, and unread message dots.

### 4.1 Icon Set

| Name | Description | Use |
|---|---|---|
| `plus` | `+` thin cross | Add friend, add photo |
| `bell` | Bell outline | Notifications |
| `chat` | Speech bubble with tail | Messages, friend chat |
| `edit` | Pencil at 45° | Edit profile (decorative — entries cannot be edited) |
| `search` | Magnifier (circle + diagonal) | Find friend, search history |
| `flame` | Stylized flame outline | Streak badges |
| `spark` | Four-point asterisk | AI reflection |
| `caret` | Right-pointing chevron | Disclosure indicator (rotate for back / direction) |
| `check` | Checkmark | Submitted confirmations, accept request |
| `close` | × | Dismiss, reject request, retry failed |
| `arrowUp` | Up arrow | Send message |
| `arrowL` | Left arrow | Back navigation |
| `more` | Three dots horizontal | Overflow menu |
| `lock` | Padlock | Permanent entries, security |
| `wifi` | Wi-fi arcs | Status bar |

### 4.2 Icon Sizes

- Tab bar icons: 22×22 (with 1.05× transform scale)
- Inline icons in buttons/chips: 14–16
- Status bar icons: 14
- Header right-action icons: 16–18
- "Hero" decorative icons (e.g. spark on empty reflect): scale up via CSS transform, never increase viewBox

---

## 5. Component Library

Below is every reusable atom and molecule, ordered from primitive to composite. **Each component should be implemented exactly once and reused.**

### 5.1 Layout primitives

#### `<Row>` / `<Col>`
Flex layouts with named props. Drop-in replacements for `<div style={{display:'flex'}}>` to keep markup readable.

```jsx
<Row gap={8} align="center" justify="space-between">…</Row>
<Col gap={12}>…</Col>
```

Props: `gap`, `align` (alignItems), `justify` (justifyContent), `style` (passthrough).

#### `<PhoneFrame>`
The device shell — fixed 360×760, rounded 50, paper background, dramatic outer shadow. Hosts everything else.

#### `<StatusBar>`
Static iOS-style status bar: time `9:41` left, dynamic island center (108×30 black pill), signal/wifi/battery icons right.
Props: `online` (toggles wifi icon to crossed-out variant).

#### `<HomeIndicator>`
Absolutely-positioned 120×5 pill at bottom, 50% opacity ink, z-index above tab bar.

#### `<TabBar>`
Fixed bottom navigation. 5 tabs: today, history, social, insights, settings. Active tab is `INK_BRIGHT` + 4px white dot underneath; inactive tabs are `INK_DIM` at 55% opacity.

#### `<PageHeader>`
Two variants:
- **Large** (`large={true}`) — used for top-of-tab pages. Has a mono uppercase eyebrow + a large italic serif title. Optional right-side icon/control.
- **Compact** (default) — used inside modals. Centered title, optional mono uppercase sub, back arrow on the left, close button on the right.

Props: `title`, `sub`, `large`, `right` (ReactNode), `back` (onClick handler).

### 5.2 Atoms

#### `<Btn>`
Pill button. Single component, three variants:
- `fill` — `INK_BRIGHT` background, `#0a0a0a` text. Primary CTA.
- `ghost` — transparent background, `FRAME` border, ink text. Secondary.
- default — transparent background, ink border, ink text. Used inline.
- `disabled` / `dim` — `INK_FADE` border, `INK_DIM` text.

Props: `fill`, `ghost`, `disabled`, `w`, `h` (default 50), `onClick`.

Height: **50px primary**, 38–42px inline.

#### `<Chip>`
Pill toggle. Two visual states (`on={true|false}`). When `on`, ink fill with dark text. When off, transparent with `FRAME` border.
Default uppercase mono small caps (`mono={true}`); pass `mono={false}` for normal-case sans (used in onboarding interests).

#### `<Avatar>`
Circular gradient avatar with two-letter initials in italic serif. Generated from a single seed hex color via `linear-gradient(135deg, color, darker-mix)`. Always includes inset highlight: `inset 0 0 0 1px rgba(255,255,255,0.08)`.
Props: `name` (string — initials derived), `color` (hex seed), `size` (px).

#### `<Switch>`
44×26 pill toggle. Off: `SURFACE` background, `FRAME` border, dim grey thumb. On: `INK_BRIGHT` background, dark thumb. Animated `left` transition 180ms.

#### `<CountDots>`
Sentence counter. N circles (default 3), 9px size. Filled = `INK_BRIGHT` solid. Empty = transparent with `INK_FADE` outline.
Color prop overrides fill color (used to switch to `WARN` when over-count).

#### `<StreakPill>`
Compact pill: flame icon + number, mono font. Two states: default (`FRAME` border, `INK_DIM` flame) and `bright` (after submit — `INK_BRIGHT` border + bright flame).

#### `<MarkDot>`
The Three Sentences brand mark: a rounded white tile (radius = size × 0.22) with three small black dots inside, evenly spaced. Used on splash, login, milestone, history-empty.

#### `<Skel>`
Loading skeleton. Solid `SURFACE` block with `pt-skel` pulsing opacity animation (0.35 ↔ 0.7, 1400ms ease-in-out).

#### `<Toast>`
Top-center floating mono uppercase message. Auto-dismisses after 2.4s. Slides in from above (`pt-toast-in` keyframe).

### 5.3 Composite

#### `<ScreenFade>`
Wraps a screen in a `pt-screen-in` keyframe (opacity 0→1, translateY 6→0, 280ms ease-out). Use `key={routeKey}` to retrigger on route change.

#### `<ModalSheet>`
Full-bleed (or bottom-sheet) overlay. Backdrop is `rgba(0,0,0,0.55)` + 6px backdrop-blur. Tap backdrop to dismiss. Content inside has its own `PageHeader` (compact variant) with a close button.
Props: `full` (default true). When `full={false}`, anchors to bottom with rounded top corners (22px).

#### `<Field>`
Form input row. Mono uppercase label above, 44px input with `SURFACE` background and `FRAME` border. Focus state: border → `INK`. Optional `warn` prop shows an amber error message below.

#### `<Toggle>` / `<RowItem>` / `<SectionLabel>` (Settings)
Settings rows. `Toggle` = card with label/sub + `<Switch>`. `RowItem` = clickable row with caret. `SectionLabel` = mono uppercase eyebrow with 16px top spacing.

---

## 6. State Model

A single global state object, persisted to `localStorage` (or `AsyncStorage` in RN) under key `ts-proto-v1`.

```ts
type AppState = {
  // Navigation
  flow: 'splash' | 'login' | 'signup' | 'profile' | 'interests' | 'onboard' | 'app';
  onboardStep: 0 | 1 | 2 | 3;
  tab: 'today' | 'history' | 'social' | 'insights' | 'settings';
  modal: string | null; // namespaced — see below

  // User
  user: {
    name: string;
    handle: string;          // always starts with @
    interests: string[];     // exactly 3 after setup
    bio: string;
  };

  // Today
  draft: string;             // raw textarea value, used until submit

  // Entries (immutable after submit)
  entries: {
    [dateKey: string]: {     // 'YYYY-MM-DD'
      sentences: string[];   // length === 3
      submittedAt: string;   // 'h:mm AM/PM'
    }
  };

  // Social
  friends: Friend[];
  requests: Friend[];
  suggested: Friend[];
  chats: { [friendId: string]: ChatMessage[] };

  // Preferences
  prefs: {
    aiReflection: boolean;
    notifications: boolean;
    dailyPrompt: boolean;
    reminderTime: string;       // '8:00 PM'
    crisisDetection: boolean;
    online: boolean;            // for offline-state simulation
  };
}

type Friend = {
  id: string;
  name: string;
  handle: string;
  streak: number;
  lastMsg: string;
  unread: number;
  avatar: string;   // hex seed
  mutual?: string;  // for requests/suggested only
};

type ChatMessage = {
  from: 'me' | 'them';
  text: string;
  t: string;        // 'h:mm AM'
};
```

### 6.1 Modal namespacing

`state.modal` is a string with optional payload after a colon:
- `'reflect'` — AI reflection
- `'reflect-off'` — opt-in screen
- `'crisis'` — hotline resources
- `'conversations'` — message list
- `'profile'` — user profile
- `'invite'` — bottom-sheet invite form
- `'chat:<friendId>'` — chat with specific friend
- `'entry:<YYYY-MM-DD>'` — read-only entry view
- `'milestone:<count>'` — celebration overlay (7, 30, 100, or 363)

### 6.2 Derived values

Computed in the context provider (`useApp`):
- `streak` — walk backwards from today through consecutive entries; if today not written, start from yesterday.
- `todayEntry` — `entries[TODAY_KEY]` or null.
- `totalEntries` — `Object.keys(entries).length`.

### 6.3 Sentence parsing

```js
// Counts a sentence as any non-empty trimmed segment ending in . ! ? or newline.
function countSentences(text) {
  const parts = text.match(/[^.!?\n]+[.!?]+|[^.!?\n]+\n/g) || [];
  return parts.filter(s => s.trim()).length;
}
```

**Crucial.** Pressing Enter without a period still counts a line as a sentence — accommodates poetic / lowercase entries.

---

## 7. Navigation & Routing

Three layers, in priority order:

1. **Flow** — what high-level screen is showing. Drives the top-level switch in `App`. `'app'` means the main tabbed UI; everything else is a full-screen pre-app state.
2. **Tab** — when `flow === 'app'`, which bottom tab. The body of the phone is determined by `state.tab`.
3. **Modal** — overlays anything when set. Rendered above the current screen with a backdrop.

### 7.1 Transitions

- Within `flow !== 'app'`: simple `ScreenFade` keyed by route.
- Within app tabs: `ScreenFade` keyed by `${flow}-${tab}`.
- Modal in: backdrop fades in 180ms, sheet slides up if `full={false}`, otherwise replaces full body.
- Modal out: instant on backdrop tap or close button (no exit animation — reduces complexity, feels snappy).

### 7.2 Back behavior

There is no global back stack. Every screen has explicit `back` handlers:
- Auth screens go back to splash.
- Tabs do not have back arrows.
- Modals have both a back arrow (in compact header) and a close × in the top-right.

In React Native, use the same model — don't rely on the system back stack except as a fallback that mirrors the close button.

---

## 8. Screen Specifications

For each screen: **purpose, structure, key interactions, edge cases.**

### 8.1 Splash

**Purpose.** Brand intro on launch.

**Structure.**
- Radial vignette glow at 50%/40%.
- Three 22px ivory dots, centered, with the "juggle" entrance: each lands sequentially (0ms, 140ms, 280ms delays) with `cubic-bezier(.34,1.5,.64,1)` easing and an overshoot bounce.
- Italic serif wordmark "Three Sentences" — fades up at 950ms (translateY 12→0, opacity 0→1).
- Mono tagline "BE BETTER. DO BETTER." — fades up at 1350ms.
- After 2400ms, two CTAs appear: `Sign in` (fill) and `Create an account` (ghost).

**Interactions.**
- `Sign in` → `flow: 'login'`
- `Create an account` → `flow: 'signup'`

### 8.2 Login

**Purpose.** Auth entry for returning users.

**Structure.**
- Back arrow top-left → splash.
- MarkDot 44px, italic "Welcome back.", mono "SIGN IN TO CONTINUE".
- Email field, password field.
- Primary CTA: `Sign in` (enabled when email passes `/\S+@\S+\.\S+/` and password ≥ 4 chars).
- Divider with "OR" centered.
- Ghost: `Continue with Apple`.
- Footer: "No account? Create one" inline link.

**Validation.**
- Email regex: `/\S+@\S+\.\S+/`
- Password: minimum 4 chars (production: stronger).

### 8.3 Signup

**Purpose.** Create account.

**Structure.**
- Back arrow → splash.
- MarkDot 40px, italic "Begin the practice."
- Email, Password (6+ chars), Confirm Password fields.
- Confirm shows amber warning "PASSWORDS DO NOT MATCH" inline if mismatch.
- `Create account` disabled until all valid.
- Footer disclaimer: terms & private journal policy.

**On success.** → `flow: 'profile'`.

### 8.4 Profile setup (Step 1/3)

**Structure.**
- Compact `PageHeader` with `Step 1 of 3` mono sub.
- Centered 92px circle photo placeholder with `+` icon and "photo" label. Dashed `INK_FADE` border.
- Field: Display name (≥ 2 chars).
- Field: Username — auto-prefix with `@` if user doesn't include it. Regex: `/^@?[\w.]{3,}$/`.
- Continue CTA enabled when both valid.

### 8.5 Interests (Step 2/3)

**Structure.**
- Header with `Step 2 of 3 — pick three`.
- Italic serif body: "Used to nudge gently. Never to advertise."
- 15 interest chips (mindfulness, fitness, work, family, art, music, reading, learning, travel, cooking, nature, craft, writing, parenting, spirituality).
- Multi-select chips with **hard cap of 3**: clicking a fourth does nothing.
- Mono counter "N / 3 selected".
- Continue disabled until exactly 3 selected.

### 8.6 Onboarding (Step 3/3, 4 slides)

**Structure.**
- Top row: `01 / 04` mono progress + `Skip` (mono, right-aligned, omitted on last slide).
- Center: slide content (see below).
- Bottom: animated page indicator (active dot expands to 22×6 pill, inactive 6×6).
- CTA: `Continue` (last slide: `Begin practice`).

**Slides.**

1. **Philosophy** — MarkDot 54px, "Three Sentences" italic display, body "A journaling practice on a single truth. You cannot be perfect, but you can be relentless.", mono tagline.
2. **Three. No more, no less.** — italic display, body, sample card with `SURFACE` background showing three sentences (last one dimmed to demonstrate counting), `CountDots filled={3}`.
3. **Permanence** — 56px square padlock tile, italic "Presence over perfection.", body "Once submitted, your entry cannot be edited. Your words stand."
4. **363/365** — large italic display number, body "Miss a day, return without shame. Empty days are not failures.", 28-cell mini calendar grid (4 random cells dashed/empty, rest solid).

### 8.7 Today (Tab)

**Two states** based on whether today has been submitted.

#### 8.7.1 Today — empty / writing

**Structure.**
- Large header: italic "Today" + mono "TUE · JUN 18".
- Right: `<StreakPill>` with current streak.
- Optional prompt strip: left-border `INK_FADE`, italic serif quote (only if `prefs.dailyPrompt` is on).
- **Writing surface.** A flex-grow textarea, transparent background, italic-friendly serif at 18px, 1.6 line height. Placeholder: "Three sentences. What happened?"
- Floating ghost button bottom-right of the textarea **only when empty**: `Try an example` — inserts demo text.
- Counter strip (above CTA, separated by top border): left = `<CountDots>`, right = mono status text.
- Counter states:
  - 0/3 → "0 / 3 · 3 more"
  - 1/3 → "1 / 3 · 2 more"
  - 2/3 → "2 / 3 · 1 more"
  - 3/3 → "3 / 3 · ready" (bright white)
  - 4+/3 → "N / 3 · too many" in `WARN`, italic serif advisory underneath: "The constraint is the point. Cut one."
- Submit CTA: `ghost+disabled` until exactly 3; `fill` and enabled at 3.

**Interactions.**
- Typing updates `state.draft` live.
- Submit:
  1. Save `entries[TODAY_KEY] = { sentences: splitSentences(draft).slice(0,3), submittedAt: '9:14 PM' }`.
  2. Clear draft.
  3. Recompute streak.
  4. If new streak is 7, 30, 100, or 363 → open `milestone:N` modal.
  5. Show toast: "STREAK +1 · LOCKED".
  6. Transition to submitted state on next render.

#### 8.7.2 Today — submitted (locked)

**Structure.**
- Large header: italic "Done." + date.
- Streak pill in **bright** variant.
- Locked entry card: `SURFACE` background, 2px `INK_BRIGHT` left border, italic serif body at 17px joining sentences with spaces.
- "SUBMITTED 9:14 PM · LOCKED" mono line with check icon.
- Tappable card: "This week's reflection" → opens reflect modal.
- Streak ladder card: italic 40px streak number, progress bar (current vs 30 days), "TODAY" / "30 DAYS UNBROKEN" labels.
- Footer italic quote: "Done is better than perfect."

### 8.8 History (Tab)

**Structure.**
- Large header: "History" + "184 entries" sub, search icon right.
- Month navigation: caret left, italic "June 2026", caret right.
- Weekday header row (S M T W T F S, mono small caps).
- 7-column 6-row calendar grid (42 cells):
  - **Written** day: solid ink fill, dark text, no border.
  - **Empty** day (past, no entry): transparent, `FRAME` border, dim text.
  - **Today**: 1.5px `INK_BRIGHT` border, transparent.
  - **Future**: transparent border, no text.
  - **Out-of-month padding**: empty.
- Legend row: three swatches with mono labels (WRITTEN / EMPTY / TODAY).
- Bottom stats strip (after divider): three italic numbers — written/total this month, %, all-time entries.

**Interactions.**
- Tap month caret → previous/next month.
- Tap written day → open `entry:<dateKey>` modal.
- Tap today (if not written) → switch to today tab.
- Empty/future days are disabled.

**Empty state.** When zero entries exist: replace body with centered "Begin." headline, body copy, and "Write today" CTA.

### 8.9 Insights (Tab)

**Structure.**
- Large header: italic "Your practice" + "Insights" sub.
- **Streak hero card**: italic 64px number left, "Current streak" mono label + contextual body ("Five more days and you tie your personal best.") on right. `SURFACE` background, `FRAME` border.
- **Three stat tiles** in a grid: Longest / Entries / Goal (363). Each is italic serif number above mono uppercase label.
- **Daily prompt card**: `SURFACE`, 2px `INK_BRIGHT` left border. Mono "TODAY'S PROMPT" eyebrow + italic serif quote. Only shown if `prefs.dailyPrompt`.
- **AI reflection card**: spark icon + "AI reflection" + mono sub ("7 entries this week" or "Off — opt in to enable"). Caret. Tap → reflect modal (or reflect-off if disabled).
- **Principle card**: dashed border, mono "PRINCIPLE" eyebrow + italic quote "Show up. Do the work. Let go of perfection."
- Bottom link: "In distress? See resources" → crisis modal.

### 8.10 Social — The Circle (Tab)

**Structure.**
- Large header: italic "The Circle". Right actions: chat icon (→ conversations modal) + plus icon (→ invite modal).
- Search input row: search icon + text input "Find by @handle". Live-filters friends list.
- Two chips: `Friends · N` / `Requests · N`.
- **Friends list** (when chip = friends): each row = avatar + name + handle + last message preview + streak count + unread dot.
- **Requests list** (when chip = requests): two sections.
  - **Incoming**: `SURFACE`-filled rows with avatar, name/handle, mutual count, accept (white fill) and reject (ghost) buttons.
  - **Suggested**: hairline divider rows with avatar, name, mutual, and "Add" button → moves into incoming.

**Interactions.**
- Tap friend row → opens `chat:<friendId>` modal.
- Accept → moves request into friends array.
- Reject → removes from requests.
- Add (suggested) → moves into requests as "Pending".

**Empty state.** "A private circle." headline + invite CTA.

### 8.11 Settings (Tab)

**Structure.**
- Large header "Settings" (no sub).
- **Profile card** (top, tappable): avatar + name + handle + caret. Opens profile modal.
- **Practice** section — `Daily prompts` toggle, `AI reflection` toggle.
- **Notifications** section — `Daily reminder` toggle (sub shows `prefs.reminderTime`).
- **Safety** section — `Crisis detection` toggle.
- **Account** section — list items:
  - Export my journal (caret, decorative)
  - Privacy & encryption (caret, decorative)
  - Toggle offline mode (inline `<Switch>` — flips `prefs.online`)
  - Reset prototype (amber, opens confirm modal)
  - Sign out (amber, calls `reset()`)
- Footer: "Three Sentences · v1.0.0 / Be better. Do better." mono uppercase, centered.

---

## 9. Modals

### 9.1 Entry detail (`entry:<dateKey>`)

Full-bleed sheet. Compact header with date title + close. Body:
- Locked entry card (same style as today-submitted).
- Mono meta row: time · word count · LOCKED.
- "Reflect on this week" tappable card.
- Footer: "Entries are permanent. No edits, no deletions."

### 9.2 Reflect (`reflect`)

Full-bleed sheet. Header "Reflect / AI WEEKLY READ".
- Three timeframe chips (`7d`, `30d`, `90d`) — single-select.
- On range change: 800ms simulated loading state with pulsing spark icon and three skeleton blocks.
- Then renders three cards:
  - **Theme**: mono eyebrow + 26px italic display title.
  - **Observation** (`SURFACE` card): mono eyebrow + 14px body paragraph.
  - **A question to sit with** (`SURFACE` + 2px white left border): mono `INK_BRIGHT` eyebrow + 18px italic question.
- Footer: AI disclaimer + crisis link.

Three reads are hard-coded for 7/30/90.

### 9.3 Reflect-off (`reflect-off`)

Sheet. Centered:
- Scaled-up spark icon at 50% opacity.
- Italic display "Reflection is off."
- Body explaining device-only privacy promise.
- Inline card with "Enable AI reflection / Encrypted in transit" + off-state switch.
- `Turn it on` fill CTA → sets `prefs.aiReflection = true` and opens reflect modal.

### 9.4 Crisis (`crisis`)

Sheet. Header "Resources".
- Top alert card: `SURFACE`, 2px `WARN` left border. Mono `WARN` eyebrow "YOU ARE NOT ALONE" + italic body "You don't have to be alone in this. Help is available, free, and confidential."
- Eyebrow "SPEAK TO SOMEONE NOW".
- Three resource rows: label (large) + sub (mono small caps). Caret. Decorative — no real linking in prototype.
  - 988 — Suicide & Crisis Lifeline · 24/7
  - Text HOME to 741741 — Crisis Text Line
  - findahelpline.com — International — by country
- Footer disclaimer.

### 9.5 Conversations (`conversations`)

Sheet. Header "Messages / END-TO-END ENCRYPTED". Body = scroll list of friend rows (same component as in social tab).

### 9.6 Chat (`chat:<friendId>`)

Sheet. Custom compact header: back arrow + avatar + `@handle` + mono "ACTIVE NOW" sub + more icon.
- Scrollable message list:
  - `from: 'them'` — small avatar + bubble with `SURFACE` background, `FRAME` border, asymmetric radius `16 16 16 4`.
  - `from: 'me'` — right-aligned bubble with `INK_BRIGHT` background, dark text, radius `16 16 4 16`.
- **Failed message UI**: if `prefs.online` is false on send, the input value is rendered as a `WARN`-bordered transparent bubble with a "× Failed · tap to retry" link below.
- Input row at bottom: 38px pill input + send button (38px circle). Send button is `INK_BRIGHT` when input is non-empty, `SURFACE`+`INK_DIM` when empty.
- On send: append user message, then 1400ms later auto-append a random short reply from a fixed list. Mark conversation as read.

### 9.7 Milestone (`milestone:<N>`)

Centered card overlay (not full-bleed). Backdrop is darker (`rgba(0,0,0,0.7)`).
- `PAPER` background card, 24px radius, `INK_BRIGHT` 1px border, glow shadow.
- MarkDot 40px.
- Huge italic serif number (84px, -3px tracking).
- Mono uppercase "DAYS UNBROKEN".
- Italic serif headline by milestone:
  - 7 → "A first week."
  - 30 → "Days unbroken."
  - 100 → "A hundred days."
  - 363 → "Three hundred sixty-three."
- Body copy per milestone (see source).
- Two CTAs side-by-side: `Share` (ghost), `Keep going` (fill).

### 9.8 Profile (`profile`)

Sheet. Header "Profile" with edit icon + close.
- Centered avatar 92px + italic serif name + mono handle.
- Stat row (top + bottom borders): Entries / Streak / Circle.
- "BIO" eyebrow + italic serif bio paragraph.
- "INTERESTS" eyebrow + chip row.

### 9.9 Invite (`invite`)

**Bottom sheet** (`full={false}`). Rounded top corners. Inside:
- Italic title "Invite to your circle" + close.
- Body explaining invite-only model.
- Field "Username" with auto-`@` prefixing.
- `Send request` CTA, disabled until handle ≥ 4 chars.
- On send → swaps to a confirmation state (check icon, "Request sent to @handle.", Done button).

### 9.10 Reset (in-app dev affordance)

Centered modal card. "Reset prototype? / Clears all entries, friends, and settings…". Two buttons: Cancel (ghost), Reset (fill, destructive).

---

## 10. Interactions & Motion

### 10.1 Keyframes

All animations are defined in the root `<style>` block.

| Name | Duration | Easing | Use |
|---|---|---|---|
| `pt-juggle-l/c/r` | 1200ms | `cubic-bezier(.34,1.5,.64,1)` | Splash dot entrance with overshoot |
| `pt-fade-up` | 700–800ms | ease-out | Wordmark, tagline, footer in sequence |
| `pt-pulse` | 900–2200ms | ease-in-out infinite | Cursor blink, loading spark, footer "Loading" |
| `pt-fade-in` | 180–220ms | ease-out | Modal backdrop |
| `pt-screen-in` | 280ms | ease-out | Per-route content swap |
| `pt-cursor` | — | step-based | (Used for blinking cursor in onboarding sample) |
| `pt-skel` | 1400ms | ease-in-out infinite | Skeleton blocks during AI reflection load |
| `pt-toast-in` | 240ms | ease-out | Top toast slide-down |

### 10.2 Interaction patterns

- **Tap feedback.** No ripples or scale-down. Underlying color shifts (e.g. chip flip from outline to fill) are the affordance.
- **Hover (web only).** None — design assumes touch. Buttons may set `cursor: pointer`, nothing else.
- **Focus.** Form inputs darken their border to `INK` on focus. No outer ring.
- **Disabled.** Reduced to `INK_DIM` text and `INK_FADE` border, 0.5 opacity, `cursor: not-allowed`.
- **Selection (web only).** Custom `::selection` rule: `rgba(255,255,255,0.25)` background.

### 10.3 Live behaviors

- **Sentence counter** updates on every `onChange` of the textarea. Recompute via `countSentences(draft)`.
- **Submit gate** strictly equals 3 — not "at least 3".
- **Streak** recomputes from `entries` on every state change via `useMemo`.
- **Offline mode** affects three things:
  - Status bar wifi icon swaps to crossed-out.
  - Yellow offline banner appears above status bar.
  - Sending a chat message fails into the WARN bubble + retry UI.

---

## 11. Edge Cases & States

| Surface | Edge case | Treatment |
|---|---|---|
| Today | Already submitted | Lock the screen — show submitted view with permanent entry, no retry. |
| Today | Over count (4+) | Counter switches to `WARN`, italic advisory appears, submit stays disabled. |
| Today | Loading from cache | Skeleton blocks for date pill, body, counter, button (`<Skel>`). |
| History | No entries yet | Empty state with mark, "Begin.", and "Write today" CTA. |
| History | Future day tapped | No-op (button disabled). |
| Social | Zero friends | "A private circle." empty state with invite CTA. |
| Social | Search no-match | "No one by that name." italic message. |
| Chat | Send while offline | WARN-bordered transparent bubble + retry tap target. |
| Chat | Conversation not found | Tiny error card with Close. |
| Reflect | AI is off | Redirect to reflect-off opt-in instead of reflect modal. |
| Reflect | Loading | 800ms simulated skeleton. |
| Milestone | New streak hits 7/30/100/363 | Auto-opens milestone modal after submit. |
| Offline | Anywhere | Status bar wifi crossed out, banner above status bar. |
| Crisis | Manual entry from Insights | Opens crisis modal (no automatic triggers in prototype). |

---

## 12. Persistence & Data

### 12.1 Storage

Single key, single JSON blob. On every state change, full write. Read on mount, merged with defaults to absorb new fields safely.

```js
function loadState() {
  try {
    const raw = localStorage.getItem('ts-proto-v1');
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    return {
      ...defaultState(),
      ...s,
      prefs: { ...defaultState().prefs, ...(s.prefs || {}) },
    };
  } catch { return defaultState(); }
}
```

**For React Native**, swap to `AsyncStorage.getItem/setItem` (async — wrap the provider in a loading screen until the read resolves on mount).

### 12.2 Seed data

The prototype ships with seed data so empty-state design isn't forced:
- 17 days of June 2026 pre-written (days 7 and 13 intentionally missing to demonstrate streak resets).
- 6 friends, 2 incoming requests, 2 suggested.
- 5-message Maya chat history.
- 5 daily prompts.

For production, all seed data should be omitted; new accounts start fully empty.

### 12.3 "Today"

The prototype freezes `TODAY = 2026-06-18` (Tuesday). In production, replace with `new Date()` and adjust the seed strategy accordingly.

---

## 13. Accessibility

- **Color contrast.** All ink-on-paper combos exceed WCAG AA (4.5:1). Dim text on paper is ~7:1.
- **Tap targets.** All interactive elements ≥ 44×44 (buttons 50px, tabs ~48 total with padding).
- **Font scaling.** All sizes in `px` (web) or unitless (RN). Consider switching to `rem` on web and `useFontScale()` in RN for accessibility.
- **Reduced motion.** Honor `prefers-reduced-motion` by disabling the splash juggle and screen-fade keyframes. Replace with instant transitions.
- **Screen readers.** Inputs need explicit labels. Buttons need `aria-label` for icon-only triggers (search, plus, more, close, back, send).
- **Focus rings.** Add a visible focus indicator (e.g. `outline: 2px solid INK_BRIGHT` with `outline-offset: 2px`) for keyboard navigation on web.

---

## 14. Implementation Checklist

When rebuilding from scratch, work in this order. Each step should be a runnable artifact before moving on.

### Phase 1 — Foundation
1. Set up project (Expo + React Native, or React + Vite for web).
2. Load fonts.
3. Define all design tokens as a single `theme.ts` module.
4. Build the layout primitives: `Row`, `Col`, `PhoneFrame` (web only — RN renders to device), `StatusBar`, `HomeIndicator`.

### Phase 2 — Component library
5. Atoms: `Btn`, `Chip`, `Avatar`, `Switch`, `CountDots`, `StreakPill`, `MarkDot`, `Skel`, `Toast`.
6. Composites: `PageHeader`, `TabBar`, `Field`, `Toggle`, `RowItem`, `SectionLabel`, `ModalSheet`, `ScreenFade`.

### Phase 3 — State
7. Define `AppState` type and `defaultState()`.
8. Build `AppProvider` with `useApp()` hook.
9. Persist to storage; rehydrate on mount.
10. Add derived selectors: `streak`, `todayEntry`, `totalEntries`.

### Phase 4 — Pre-app flow
11. Splash with juggle entrance + auto-revealing CTAs.
12. Login, Signup, Profile setup, Interests, 4-step onboarding.
13. Wire flow transitions.

### Phase 5 — Tabs
14. Today (empty/writing + submitted variants). Wire sentence parser.
15. History (calendar + entry modal). Wire month nav.
16. Insights (hero + cards).
17. Social (friends + requests + chat). Wire accept/reject/add.
18. Settings (toggles + sections).

### Phase 6 — Modals
19. Reflect, Reflect-off, Crisis, Conversations, Chat, Milestone, Profile, Invite, Reset.

### Phase 7 — Polish
20. Add all keyframe animations.
21. Implement offline mode banner + wifi icon swap + chat failure path.
22. Audit accessibility: labels, contrast, reduced-motion.
23. Strip seed data for production builds.

---

## Appendix A — File Layout Suggestion

```
src/
  theme/
    tokens.ts          // INK, PAPER, FRAME, SANS, SERIF, MONO, PHONE_W, …
    icons.tsx          // I.* and TAB_ICONS exports
  primitives/
    Row.tsx, Col.tsx, ScreenFade.tsx, ModalSheet.tsx
    PhoneFrame.tsx, StatusBar.tsx, HomeIndicator.tsx, TabBar.tsx, PageHeader.tsx
  atoms/
    Btn.tsx, Chip.tsx, Avatar.tsx, Switch.tsx
    CountDots.tsx, StreakPill.tsx, MarkDot.tsx, Skel.tsx, Toast.tsx
  state/
    types.ts, defaults.ts, AppProvider.tsx, useApp.ts
    sentences.ts       // countSentences, splitSentences
    streak.ts          // computeStreak
    storage.ts         // load/save
  screens/
    Splash.tsx
    auth/Login.tsx, Signup.tsx
    onboarding/Profile.tsx, Interests.tsx, Onboard.tsx
    today/Today.tsx, TodayWriting.tsx, TodaySubmitted.tsx
    history/History.tsx, HistoryEmpty.tsx, EntryModal.tsx
    insights/Insights.tsx, ReflectModal.tsx, ReflectOffModal.tsx, CrisisModal.tsx
    social/Social.tsx, FriendRow.tsx, Requests.tsx, ConversationsModal.tsx, ChatModal.tsx, InviteModal.tsx
    settings/Settings.tsx, ProfileModal.tsx, ResetModal.tsx, MilestoneModal.tsx
  App.tsx              // top-level router
```

---

## Appendix B — Reference Implementation Files

The web prototype source lives in this repo:

- `Three Sentences Prototype.html` — entry point, font loading, keyframes, script tags.
- `proto-shell.jsx` — tokens, icons, layout primitives, `AppProvider`, `useApp`, sentence parser, streak calc.
- `proto-auth.jsx` — splash, login, signup, profile setup, interests, onboarding.
- `proto-today.jsx` — `ScreenToday` and `TodaySubmitted`.
- `proto-history.jsx` — calendar, entry modal, empty state.
- `proto-insights.jsx` — insights tab, reflect modal, reflect-off modal, crisis modal.
- `proto-social.jsx` — circle, friend row, requests, conversations modal, chat modal, invite modal.
- `proto-account.jsx` — settings, profile modal, milestone modal, reset modal.
- `proto-app.jsx` — top-level router, dev panel, viewport scaling.

When rebuilding for React Native, **don't translate the HTML literally**. Use the same component split, but:
- Replace `<div>` → `<View>`, `<span>`/`<p>` → `<Text>`, `<button>` → `<Pressable>`.
- Inline SVGs via `react-native-svg`.
- Animations via `react-native-reanimated` (the keyframes here map cleanly to `withSequence` + `withTiming`).
- ModalSheet → `react-native-modal` or a custom `Modal` with `BlurView` backdrop.
- Replace `localStorage` with `AsyncStorage` (async).
- Replace `textarea` with a `TextInput multiline={true}`.

---

*End of specification.*
