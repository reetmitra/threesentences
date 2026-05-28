# Landing UI Kit — THREE by 363™

Port of the Next.js marketing page (`threesentences/landing/`) to a single self-contained React + Babel HTML page. Every section, the waitlist modal, and the brand motion vocabulary are recreated — no Framer Motion, no Tailwind, no Next.js. Animations use the brand's spring-like `cubic-bezier(0.16, 1, 0.3, 1)` throughout.

## Files

| File | What it is |
|---|---|
| `index.html`            | The page — composes everything top to bottom and owns the waitlist-open state |
| `LandingIcons.jsx`      | Inline Lucide subset used by Trust / Modal |
| `LandingAnims.jsx`      | Motion primitives: `TextScramble`, `GradualSpacing`, `Typewriter`, `CountUp`, `FadeUp`, `FloatingParticles`, `GlowOrb`, `useInView` |
| `LandingSections.jsx`   | All 9 sections — Nav, Hero, Problem, Constraint, The 363, Principles, AI Reflection, Trust, Final CTA, Footer |
| `WaitlistModal.jsx`     | Full-screen modal with dotted-surface background, form, success state |

## What's faithful

- **Hero**: `THREE` wordmark with letter-stagger reveal + tracking animation; "by 363™" stamp; "Q4 2026" text-scramble; scroll-pulse indicator.
- **Problem**: 4-line stagger ending on a blur-in "You were writing too much."
- **Constraint**: hairline scale-in divider, scramble effect on "Three sentences."
- **The 363**: giant ghosted `363` watermark behind a count-up to 363; "You cannot be perfect. But you can be relentless." stagger.
- **Principles**: 5 stagger-in rows with `01`–`05` ordinals, dividing hairlines.
- **AI Reflection**: 3D-tilt entrance on the card; typewriter reveal of the reflection text; 10-30-90 caption.
- **Trust**: 3-up row with Lucide icons, faded-white text.
- **Final CTA + Footer**: blur-in headline, mirror of hero CTA, lightweight footer.
- **Modal**: dotted-surface mask, name/email form, spinner, success state with `CheckCircle`.

## What's simplified

- `<FloatingParticles>` here uses CSS `@keyframes` rather than canvas; the visual density matches but motion is uniform.
- The original uses Framer Motion's `useInView` w/ `amount` — this kit uses native `IntersectionObserver`.
- No Supabase — the waitlist form fakes a 900ms latency then shows the success state.
- DemoSlides (the source page also embeds a clickable phone preview between Constraint and The 363) is **not** recreated here — see `ui_kits/mobile/` for that surface instead.

## Adding sections

Each section is a self-contained React component in `LandingSections.jsx`, exposed via `Object.assign(window, ...)`. Add a new one alongside and drop it into `<App>` in `index.html`. Wrap any new content in `<FadeUp>` (or `<TextScramble>`, `<GradualSpacing>`, etc.) so it inherits brand motion automatically.

## Known gotchas

- Babel-transformed scripts don't share scope — every component must be attached to `window` via `Object.assign` at the bottom of its file.
- Use inline `style={{}}` props instead of a shared `styles` constant; identically-named module-globals collide across files.
- `useInView` triggers **once** by design — re-entering a section doesn't replay the reveal.
