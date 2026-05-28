---
name: three-design
description: Use this skill to generate well-branded interfaces and assets for THREE by 363™ (a dark-first, three-sentence daily journaling app), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of `assets/` and create static HTML files for the user to view. Reference `colors_and_type.css` (or copy its tokens) so the dark monochrome palette, Inter / Lora / JetBrains Mono type stack, and 4 px spacing scale stay consistent. The visual foundations and content fundamentals sections of `README.md` are the source of truth for tone, motion, and component patterns.

If working on production code, read the rules here to become an expert in designing with this brand — there is **no light mode**, the constraint is exactly **three sentences**, copy is **sparse and confrontational** (never cheerful, never emoji), and motion always uses `cubic-bezier(0.16, 1, 0.3, 1)`.

For interactive prototypes, the existing UI kits in `ui_kits/mobile/` and `ui_kits/landing/` are ready-made starting points — copy them and modify rather than rebuilding from scratch. They demonstrate the animated submit button, sentence counter, calendar, streak counter, AI reflection card, text-scramble, gradual-spacing, count-up, and the waitlist modal.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions (which surface? which screens? do they want the marketing voice or the in-app voice? what's the medium — slides, deck, prototype, production?), and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

**Brand non-negotiables to never violate:**
- Pure black `#000000` background. No light mode.
- White, gray, amber `#F0B429`, red `#EF4444`. That is the entire palette.
- No emoji. No unicode symbols. Lucide icons only (stroke 1.5).
- Eyebrow labels are UPPERCASE with `0.2 – 0.3em` tracking.
- The mono numeral `363` and counter `n/3` use JetBrains Mono / tabular-nums.
- Cards are flat with hairline borders or none — no drop shadows.
- The submit pattern is always: pill → 56 px circle → checkmark.
