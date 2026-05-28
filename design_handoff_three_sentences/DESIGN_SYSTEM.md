# THREE by 363™ — Design System

> *"be better, do better"* — a daily journaling app where you write **exactly three sentences**. No more. No less. The constraint *is* the product.

This folder is a self-contained design system for **THREE by 363™** (legal name *ThreeSixtyThree™*), built by reverse-engineering the product's React Native / Expo mobile app and Next.js landing page. Use it to generate on-brand UIs, mocks, throwaway prototypes, slides, and production code.

---

## Sources used to build this system

| Source | What it gave us |
|---|---|
| **GitHub:** [`reetmitra/threesentences`](https://github.com/reetmitra/threesentences) | Both the mobile app (`/app`, `/components`, `/theme`) and the marketing site (`/landing`) |
| **Local codebase:** `threesentences/` (mounted) | Read directly via the file system — same content as the GitHub repo |
| Brief from the user | Strategic context: target user, brand voice, motion principles, the "363 not 365" philosophy |

If you want to reproduce or extend this design system from scratch, **explore the GitHub repo above** — particularly `threesentences/theme/`, `threesentences/components/`, and `threesentences/landing/components/` — to see the patterns this system was distilled from.

---

## Product context

THREE is a dark-first daily journaling app for **high achievers who want accountability without friction**. The premise: most journaling apps fail because the blank page is too big. THREE shrinks the surface area to exactly three sentences — enforced at the input level — so the friction of starting disappears and the discipline of finishing becomes the whole experience.

**The "363" idea.** Not 365. Two days of grace per year, because life happens. Miss a day, forgive yourself, show up tomorrow. The brand wordmark "by 363™" is the trademark stamp on every screen.

**Two surfaces:**

1. **Mobile app** (React Native + Expo) — the actual journaling product. Five tabs: Today, History, Social, Insights, Settings.
2. **Marketing site / landing page** (Next.js + Tailwind + Framer Motion) — heavily animated, scroll-driven storytelling that "sells the constraint."

**The constraint is non-negotiable.** Submit is disabled until you have *exactly* 3 sentences — the counter goes red the moment you hit 4. Once submitted, entries can't be edited or deleted. "Presence over perfection."

---

## Index of this folder

```
THREE Design System/
├── README.md                  ← you are here
├── SKILL.md                   ← skill manifest (cross-compatible with Claude Code)
├── colors_and_type.css        ← CSS variables + semantic styles
│
├── assets/                    ← logos, app icons
│   ├── three-logo.png         ← stylized cursive "3" mark (transparent PNG)
│   ├── app-icon.png           ← iOS app icon (1024×1024)
│   ├── adaptive-icon.png      ← Android adaptive icon
│   ├── splash-icon.png        ← launch splash mark
│   └── favicon.png            ← web favicon
│
├── preview/                   ← Design System tab cards (registered as assets)
│
└── ui_kits/
    ├── mobile/                ← React-native-flavored web recreation of the app
    │   ├── README.md
    │   ├── index.html         ← interactive 5-tab phone preview
    │   └── *.jsx              ← screen + component files
    └── landing/               ← marketing-page recreation
        ├── README.md
        ├── index.html
        └── *.jsx
```

There are **no slide templates** in this folder — the source codebase shipped no decks, so per the brief none were synthesized.

---

## Content fundamentals

The voice is **sparse, confrontational, confident**. It reads like a coach who has decided you're worth telling the truth.

### Tone
- **Direct, not cheerful.** No exclamation points outside true celebration ("Perfect week!"). No "✨" or "Welcome back!" softness.
- **Second-person, accusatory in the right moments.** "You were writing too much." "You bought the notebook. You wrote for three days. Then you stopped."
- **Constraints stated as facts, not features.** "Three sentences. No more. No less." not "Try to keep it short!"
- **Confidence > caveats.** "You cannot be perfect. But you can be relentless." (a two-line poem, not a feature description)
- **No filler.** If a sentence can be cut, cut it. The product is about cutting; the copy must match.

### Person
- **You / your.** Always second-person, addressing the reader as the person who's about to journal.
- The brand itself is **"Three"** in copy, **"THREE"** in display, **"by 363™"** as the trademark stamp.

### Casing
- **UPPERCASE WITH WIDE TRACKING** for section labels, eyebrows, metadata: `THE FIVE PRINCIPLES`, `Q4 2026`, `TODAY'S PROMPT`, `30-DAY ANALYSIS`.
- **Sentence case** for headings: "Three sentences.", "Start today.", "Patterns you can't see yourself."
- **Title Case** only in nav / button labels: "Join the waitlist", "Get early access".

### Emoji
- **None.** The system has zero emoji. Use Lucide icons or nothing.

### Concrete examples from the product

> **Hero:** "Three sentences. Every day."
> **Tagline:** "be better, do better"
> **Problem statement:** "You bought the notebook. You wrote for three days. Then you stopped." → "You were writing too much."
> **The constraint:** "Three sentences. No more. No less."
> **The 363 idea:** "Not 365. … You cannot be perfect. But you can be relentless."
> **Confirmation modal:** "Once submitted, this entry cannot be edited or deleted. Your words will stand as written, capturing how you felt in this moment." → *Presence over perfection.*
> **Empty calendar day:** "Rest day. Empty days are part of the journey. The 363 philosophy embraces grace."
> **AI section:** "Your AI mirror. Patterns you can't see yourself. Not advice. Not therapy. Just a mirror."
> **Submit button:** the word **"Done"** — not "Save", not "Submit", not "Post".
> **CTA:** "Get early access" / "Join the waitlist"

### Things never to write
- ❌ "Welcome back, [Name]! 👋"
- ❌ "Awesome job! Keep it up! 🎉"
- ❌ "Don't forget to journal today!"
- ❌ "Tips & tricks for better journaling"
- ❌ Anything with "your wellness journey"

---

## Visual foundations

### Palette
A **strict monochromatic** system. The entire product is shades of black, gray, and white. Two semantic colors — amber and red — are the *only* chromatic exceptions.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#000000` | True black background. Every screen. |
| `--surface` | `#121212` | Cards, inputs, modals, sheets |
| `--surface-hover` | `#1E1E1E` | Hover / pressed surface |
| `--border` | `#2A2A2A` | Hairline dividers, input borders, watermark "363" |
| `--fg` | `#FFFFFF` | Primary text + the accent itself |
| `--fg-2` | `#A0A0A0` | Secondary text |
| `--fg-3` | `#666666` | Tertiary / disabled / placeholder |
| `--accent-subtle` | `#333333` | Active chip backgrounds, tags |
| `--warning` | `#F0B429` | Streak flame, confirmation states, "ready to submit" |
| `--error` | `#EF4444` | Over-limit ("Too many sentences"), validation |

On the landing page, white is used *through translucency*: `rgba(255,255,255,0.05 → 0.90)` — `--w-05` through `--w-90` in the CSS. Dim text is `text-white/30`; an accent line is `bg-white/[0.06]`. This translucent-white pattern is signature to the brand and how the landing page achieves its atmospheric feel without ever introducing color.

**There is no light mode.** The codebase wires `colors.light` to the same values as `colors.dark`. Don't invent one.

### Type
- **Sans:** Inter on web, SF Pro / Roboto on device (system fonts). Used for 95% of the UI.
- **Serif:** Lora on web → matches Charter (iOS) / serif fallback (Android). Used **only** in the EntryCard reading view, to create a tactile shift between *writing mode* (sans) and *reading the past* (serif).
- **Mono:** JetBrains Mono on web → Courier New / monospace on device. Used for the **sentence counter "2/3"**, the **"363"** watermark, **release dates** ("Q4 2026"), and any tabular numeral so layout never shifts.

Tracking is heavy on labels: section headers and eyebrows use `0.2em – 0.3em` letter-spacing in UPPERCASE. Display text uses tight negative tracking. Body sits at default.

Sizes follow a 12 / 14 / 16 / 18 / 20 / 24 / 30 px scale on mobile (matches `typography.ts`). The landing page extends this up to 144px+ for the hero "THREE" wordmark.

### Spacing & shape
- **4px base unit.** The scale runs `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80`.
- **Card radius: 12px.** EntryCard, ReflectionCard, the calendar container.
- **Modal radius: 16px** (or 24px for atmospheric cards like AI reflection on landing).
- **Input radius: 8px** for short fields, **12px** for the EntryInput text area.
- **Buttons: 12px** for inline buttons; the **Today screen's "Done" button is a full 28px pill** that animates into a 56px circle on submit.
- **Hit targets ≥ 44px** everywhere — calendar cells, nav buttons, chips.

Layouts breathe. Spacing between major sections on the landing page is `80 – 128px`. The Today screen has only three things on it: a date, an input, and a button.

### Backgrounds & atmosphere
- **No images as backgrounds.** No illustrations. No textures. No patterns.
- The landing page uses three subtle ambient effects, all *additive* on pure black:
  1. **`<FloatingParticles>`** — a thin scatter of moving white pixels at 1-3% opacity
  2. **`<GlowOrb>`** — large soft radial gradients positioned at section breaks (~500px, very low opacity)
  3. **`<DottedSurface>`** — dot-grid that reveals on modal open
- **Watermarks.** Giant `363` numerals at `rgba(255,255,255,0.03)` sit behind hero sections.
- **Section dividers** are 60% width gradient hairlines: `bg-gradient-to-r from-transparent via-white/[0.05] to-transparent`.
- **No gradients in components.** The only gradients in the system are these atmospheric ones.

### Motion
Every transition uses one of two easings:

```css
--ease-brand: cubic-bezier(0.16, 1, 0.3, 1);  /* spring-like, slow-out */
/* OR Framer-style spring */
{ type: 'spring', stiffness: 150, damping: 18, mass: 1 }
```

Default duration is `0.9s` on the landing page (long, languid), `200–400ms` in the app (snappy, functional). The brand's motion vocabulary:

- **Text scramble** — letters cycle randomly before settling on the final character. Used on hero text and labels (`Q4 2026`, `Not 365.`).
- **Gradual spacing** — letters fade in from 0 with stagger, accompanied by a tight-to-normal letter-spacing animation. Used on the hero `THREE` wordmark.
- **Typewriter** — character-by-character reveal with a blinking cursor. Used for AI reflection text.
- **3D tilt entrance** — cards enter with `rotateX: 15deg → 0deg` + `y: 60 → 0` (perspective 800). Used on AI reflection card.
- **Clip reveal** — `clipPath: inset(0 100% 0 0 → 0 0% 0 0)` for left-to-right text wipes.
- **Blur in** — `filter: blur(10px) → blur(0)` paired with opacity + slight y-translate.
- **Count-up** — numbers animate from 0 to target over ~1.8s. Used on the "363" counter.
- **Submit-button morph** — the full-width pill shrinks to a 56px circle, a spinner spins inside, then a checkmark rotates in. Mandatory on every commit-style action.
- **Streak progress bar** — width animates from 0 → target after a 400ms delay.

The landing page is heavy with motion; the app is restrained. Use restraint inside the app, exuberance on the marketing surface.

### Hover, press, focus
- **Hover (web only):** raise opacity (e.g. `white/30 → white/60`) OR shift `bg-white/5 → bg-white/10`. **Never** introduce a new color.
- **Press / active:** scale to `0.92` with the brand spring; for chips, `interpolateColor` from `surface` → `accent` so the chip fills with white.
- **Focus:** thin `1.5px` border in `var(--accent)` or a 2px ring at `--w-30`. No glow.
- **Haptics on mobile:** `Haptics.impactAsync(Light)` on every interactive press; `Success` haptic on submit; `Error` haptic on rejection.

### Borders, shadows, elevation
- **Borders are hairlines** — 1px or `StyleSheet.hairlineWidth`, almost always `var(--border)` or `var(--w-08)` on the landing page.
- **No drop shadows.** Elevation is communicated through surface color (`surface` rests on `bg`, `surface-hover` rests on `surface`). The closest thing to a shadow is the GlowOrb, which is decorative, not functional.
- **Cards are flat, bordered, or borderless.** Pick one per surface and don't mix.
- **No inner shadows. No outer shadows. No protection gradients.** The black background does the work.

### Transparency & blur
- Translucent whites (`rgba(255,255,255,0.05)`–`0.90`) carry hierarchy without introducing new colors.
- **No `backdrop-filter: blur()`** in the source product. The DottedSurface and GlowOrbs achieve atmosphere without needing it.
- Animated `filter: blur(10px → 0px)` is used as a *reveal effect* only, not as a persistent style.

### Imagery & illustration
- **There is no illustration system.** Icons (Lucide) and typography do all the work.
- **No stock photos.** The product never shows people or scenes.
- **The only "image" is the logo** — a hand-drawn cursive `3` (see `assets/three-logo.png`).
- If a future surface absolutely requires imagery, it should be **black-and-white, high-contrast, with grain** — never warm, never saturated, never AI-rendered painterly.

### Layout rules
- Centered, generous, single-column on the landing page. Max content width ~`max-w-3xl` (768px) for prose, `max-w-7xl` for nav.
- The mobile app uses **full-width cards with 16px padding** inside a SafeArea.
- **Fixed nav** on the landing page (`fixed top-0`); nothing else is fixed.
- **No sidebars.** Five-tab bottom nav on mobile, single-column scroll on web.

---

## Iconography

The product uses **[Lucide](https://lucide.dev/) icons exclusively**, at `strokeWidth: 1.5` for ambient/nav and `strokeWidth: 2` for emphasis. Common icons in use (verified from source):

| Icon | Where it's used |
|---|---|
| `PenTool` | Today tab, "Write Now" CTA |
| `Calendar` | History tab, "Every day" rule |
| `Users` | Social tab |
| `BarChart3` | Insights tab |
| `Settings` | Settings tab |
| `ChevronLeft` / `ChevronRight` | Month nav in History |
| `Flame` | Streak counter (warning amber) |
| `Trophy` | Longest streak |
| `Target` | Total entries, default category |
| `Check` | Submit-button success state |
| `Sparkles` | AI Reflection card |
| `Lightbulb` | Daily prompt card |
| `ArrowRight` | "Start Writing" CTA chevron |
| `Lock` / `EyeOff` / `Download` | Trust badges (landing) |
| `CheckCircle` | Waitlist success state |
| `Loader2` | Loading spinner (animate-spin) |
| `X` | Modal close, dismiss chips |
| `Search` | Social search bar |
| `MessageCircle` | Conversations entry |
| `UserPlus` / `Bell` | Friend requests |
| `Brain / Dumbbell / Palette / Heart / Briefcase / TrendingUp / Activity / BookOpen / Sun / Compass` | Onboarding category chips |
| `PenLine` | "3 Sentences" daily rule |

**How to use Lucide in this design system:** load from the CDN — no local copy is needed.

```html
<!-- Lucide via CDN -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<i data-lucide="pen-tool"></i>
<script>lucide.createIcons();</script>
```

For React/JSX, prefer the inline-SVG pattern used in the UI kits (`ui_kits/mobile/Icons.jsx`).

**No icon font.** **No custom SVG illustrations.** **No emoji.** **No unicode symbol icons** (✓, ➡, etc.) — always use the matching Lucide glyph (`Check`, `ArrowRight`).

The **brand logo** is a hand-drawn cursive `3` (`assets/three-logo.png`, 500×500 transparent PNG). The wordmark is the word `THREE` in bold Inter, sometimes paired with `by 363™` as a small uppercase trademark stamp in `0.2em` tracking at 30% opacity white.

---

## Font availability — heads up

The mobile app declares **Charter** (iOS-only) and **Courier New** as its serif/mono fallbacks. For the web/HTML side, this design system substitutes:

| Original (mobile) | Substituted (web)     | Source |
|---|---|---|
| SF Pro / Roboto   | **Inter**             | Google Fonts |
| Charter           | **Lora**              | Google Fonts |
| Courier New       | **JetBrains Mono**    | Google Fonts |

These are close-spirit matches (humanist sans, transitional serif, geometric mono). **If you'd like the real fonts shipped to the cards / UI kits**, please drop the `.ttf` / `.woff2` files into a `fonts/` directory and I'll wire them up — otherwise the Google Fonts substitutes are loaded in `ui_kits/*/index.html`.

---

## Notes & caveats

- The repo contains a `BUSINESS_MODEL_AND_INVESTOR_PITCH.md` and a `.pptx` deck. They are private/business-context docs, not visual references; they were not used to build this system.
- The mobile app uses **React Native** primitives (`<View>`, `<Text>`, `<TouchableOpacity>`); the UI kit here recreates those as semantic HTML/CSS for browser preview. Behavior is cosmetic-only — there's no real persistence.
- The codebase mixes two brand spellings: **"Three"**, **"THREE"**, **"3hree"** (a stylized wordmark), and **"ThreeSixtyThree™"** (the legal entity). The canonical product name in user-facing copy is **THREE by 363™**.
