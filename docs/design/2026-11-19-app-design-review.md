# Three Sentences: app design review

2026-11-19 · tasteskill v2, app-screen method (`references/app-screens.md`, `critique.md`, `colour.md`) · review only, nothing in the app was changed.

## 0. How this was done, and its limits

- **No inspector.** This is a native React Native app, so `inspect.mjs` (a real-browser meter) cannot render it. This is the skill's "no Chrome" path: the critique is made from 22 iPhone 17 simulator screenshots (1206×2622). `lint.mjs --app` was run on `app/`, `components/` and `theme/` (results in §6).
- **Contrast is computed from token hexes** with the WCAG 2.x formula, not sampled from pixels.
- **The screenshots predate `textSecondary` #7f7c74 → #8a877f.** Every ratio below uses the new value. The change lifts secondary text from 4.37:1 to 5.07:1 on `surface`, so it now passes everywhere. On screen, secondary text is a little lighter than the screenshots show.
- **Not reviewed:** The Circle and DMs, Profile, the 560px web column, motion, and Dynamic Type at large sizes.

---

## 1. Critique

```
ROUND 1
Seen in one second:
  Today      — the empty writing box (correct), then the brightest marks on the screen:
               the white ✓ and — circles, which outshine the entry itself.
  Done       — "Done." and the entry card. Clear.
  Patterns   — the white "30" pill, then a calendar block in which nothing is marked.
  Settings   — four white toggle tracks.
Idea (one sentence): three sentences a night, open until 4am, counted toward 363. The
  constraint is the product. It shows in the counter ("0 / 3 · 3 more"), the lock copy and
  the entry set in serif after Submit. It does not show in the calendar, the habits or the
  363 figure, which look like any tracker.
Live thing: n/a (page-only cap). App equivalent: is the main job one tap away? Yes. Write, then Submit.
Layout words by screen:
  Today = field / counter / chips / list / button
  Done = card / note / link / list
  Patterns = segmented / calendar card / chart / list / card / KPI card / text card / text card
  Settings = profile card / grouped toggles / grouped toggles
Scores: design 6.5 · usability 6.5 · creativity 6.5 · content 7.5 → raw 6.6
Caps applied:
  - Words set in textTertiary #36363a at 1.41–1.68:1. The inspector fails anything under
    2.6:1, so this counts as a FAIL → overall ≤ 6.0.
  - Monospace uppercase eyebrows on every screen → overall ≤ 6.5 (house rule; see §5 for the
    brand exemption I recommend).
  → OVERALL 6.0
Top three problems: see §3 (readable text; one accent for "kept"; Patterns leads with the wrong figure).
```

### The fourteen passes, adapted to an app

| # | Pass | Finding |
|---|---|---|
| 1 | One second, then five | **Today** and **Login** pass: you know what the screen is and what to do. **Onboarding** fails the five-second test. In one glance it shows three names: the eyebrow "THREE SENTENCES", the headline "ThreeSixtyThree™", and a "…" app tile that reads as a typing indicator. |
| 2 | Squint | **Today** reduces to the field, a column of white circles and a white pill. The circles are the heaviest mass. **Patterns** reduces to the calendar card, then six medium masses of the same weight (chart, list, AI card, streak card and two text cards). Nothing leads below the calendar. |
| 3 | Cover the logo | A dark ground, ivory ink and a serif entry is a known journaling look. Day One's dark mode and Stoic both use it. What belongs only to Three is the three-sentence counter, the 4am lock, the 363 target and "Your three". Today they appear as words, never as form. The Patterns calendar is a stock calendar. |
| 4 | Edges | Good. Today, Patterns and Settings share one 24pt left edge. The Done state centres three things in a row (the lock line, the edit link and, above them, the counter on Today), which is one more centred item than it needs. |
| 5 | Space and frame | Today's rhythm is calm and deliberate. At 7 days, each habit row on Patterns is about 80% empty, because unanswered days are drawn as nothing. The 90-day rows show a single 2pt tick. |
| 6 | Type | Three faces, each with one job, is a good system: Schibsted for UI, Newsreader for entries, Plex Mono for meta. The problems: the entry is **written** in Schibsted 18 (`EntryInput.tsx:81`) but **read** in Newsreader, so one text has two voices. The `meta` (10pt) and `metaSm` (9pt) tokens sit under the 11pt floor. Uppercase mono appears 56 times. The largest type in the app (`streakHero`, 64pt) is a zero. |
| 7 | Colour | The ground covers about 85% and the ink is ivory. **White does five jobs:** the primary action, every selected answer (including "not today"), every ON toggle, the habit data and the mood dot. When white means everything, it means nothing in particular. The app's only hue, amber, appears only on errors and destructive actions. The faint tier, #36363a, carries words. |
| 8 | Images | n/a for app screens. The one graphic, the "…" tile, reads as "more" or "typing", not as three sentences. It is a brand asset, so leave it; noted for later. |
| 9 | Sameness | The lower half of Patterns is four rounded surface cards of the same shape in a row: AI, 363 progress, and two "about" cards. |
| 10 | Phone | It is native and touch targets hold 44pt (answer buttons 44×44, calendar cells minHeight 44). The tab bar is icon-only (`tabBarShowLabel: false`), and the speech bubble does not say "The Circle". |
| 11 | Fullness | Today is right for its job. **Patterns for a new account is thin:** an unmarked calendar, "No mood logged yet.", and a card of four zeros led by a 64pt "0". |
| 12 | Substance | "1/1" and "0/1" next to a habit don't say what they count (days answered in the chosen window). The AI card asks "Enable AI…" in the middle of a data screen. |
| 13 | Collisions | **Fail.** The "UPDATED · LOCKS AT 4AM" toast covers the dateline ("WEDNES…"). The two-line error toast runs from screen edge to screen edge over the dateline (`Toast.tsx`: `width: '100%'`, no margin, pill radius). |
| 14 | Competitor | Put Day One or Stoic on these screens and the visuals still fit; only the copy changes. That caps creativity at 7 on its own. |

### App-screen check (app-screens §2.7)

1. **Is the question answered by the biggest thing?**
   - **Today** ("Have I written tonight, and did I keep my three?"): yes, the field is biggest.
   - **Patterns** ("Am I showing up?"): no. The calendar marks are 4pt dots in ivory at 1:1 with the day numerals. The largest figure on the screen is the 64pt "0 day streak", which contradicts the screen's own copy: "Missed days are simply empty — not failures, not broken streaks."
2. **Shared edges, dead strips?** Edges hold. The dead strips are the habit rows at 7 and 90 days, which have no track.
3. **Colour only on data, status and the one action?** No colour is on the data at all. White carries action, state and data alike (`no-data-hue`, in inspector terms).
4. **Numbers add up?** On this account, yes: 0 / 363 / 0 / 0. "1/1" has no window named.
5. **Zeros look like zeros?** Yes, though the hero zero is too loud (see 1).
6. **Legends and labels?** The mood chart labels only "great" and "rough"; the middle three levels are unlabelled. With a single point, the 120pt plot is mostly empty.
7. **Phone?** It is phone-only. Navigation is folded but unlabelled.

---

## 2. The owner's question: keep monochrome, or add an accent?

**Verdict: keep the monochrome brand and add exactly one accent with one meaning: "kept".**

### Is the look too personal? Would users enjoy it?

The palette is not the barrier. A near-black ground with warm ivory ink and a serif entry suits writing at 11pm: low luminance, no blue-white glare, and it feels like paper in lamplight. Keep it.

What does read as insider or personal is something else:

- monospace uppercase on every label (a terminal or fashion-label register);
- icon-only tabs;
- three names for one product ("Three Sentences", "ThreeSixtyThree™", "363");
- jargon: "363 Progress", "The 363 Way".

Fix those before worrying about the palette.

The real cost of strict monochrome is a missing **reward moment**. The audience is young adults trying to build sleep and habit routines, and they are used to apps where a kept habit changes colour. Here:

- a habit marked "not today" lights up exactly as brightly as one you kept (`HabitCheckList.tsx`: `answerSelected` is `textBright` for both);
- a month of written nights looks almost the same as an empty month (4pt ivory dots);
- the all-three-kept day is the faintest mark in the app (a 1pt `textSecondary` ring).

### Should the existing amber #f6c177 become the accent? No.

Amber already means "careful" in about 20 places:

- Delete account, Sign out and the delete icons (`settings.tsx:89, 543, 564, 601`);
- field errors (`signup.tsx:101`, `profile-setup.tsx:262/292`, `HabitSetupSheet.tsx:178`);
- the over-limit sentence counter (`SentenceCounter.tsx:54, 75`);
- the destructive modal button (`ConfirmationModal.tsx:64–66`);
- error toasts (`Toast.tsx:53`).

Yellow-amber reads as caution almost everywhere. Making it the "kept" colour would paint a kept habit the same colour as Delete account. Keep amber as `warn`, and keep it rare.

### Candidates

| | Hex | HSL | On #060608 | On #15151a | #060608 text on it | vs ivory #ebe7dc | Deuteranopia sim.* | Verdict |
|---|---|---|---|---|---|---|---|---|
| **Moonlight** | **#a9c1d9** | 210° 39% 76% | **10.91:1** | **9.81:1** | 10.91:1 | 1.50:1 | #babad9 (stays clear of amber #d2d274 and ivory #e8e8dc) | **Recommended** |
| Moss | #a3c99a | 109° 30% 70% | 10.97:1 | 9.86:1 | 10.97:1 | 1.49:1 | #bfbf9b (drifts toward amber and ivory) | Second choice |
| Lamplight (existing warn) | #f6c177 | 35° 88% 72% | 12.35:1 | 11.10:1 | 12.35:1 | 1.33:1 | #d2d274 | Only if every warning goes neutral |

\* Viénot 1999 deuteranopia simulation. Red–green colour blindness affects about 1 in 12 men.

**Why moonlight:**

- Its cool temperature separates it from the warm ivory, so a 6pt dot reads as coloured, not grey.
- It pairs with amber as moonlight with lamplight. Both are night colours, and neither is screen blue.
- It stays distinct from amber for colour-blind users.
- At 210° it is a blue-grey, well clear of the banned indigo and violet (240°+).
- It is not the habit-tracker default. Moss green is the GitHub/Streaks contribution grid and fails the competitor test.
- It also merges toward amber under deuteranopia, which matters because amber marks danger here.

**Token:** add to `theme/colors.ts` (both `dark` and `light`, which mirror each other):

```ts
moon: '#a9c1d9',   // the one accent: nights and habits kept. Data only, never chrome.
```

Do not repoint the existing `accent: '#ffffff'`. It tints about 10 pieces of chrome (refresh controls, profile edit, spinners), and repointing it would put the hue on chrome.

### Where moonlight appears (three surfaces, one meaning)

1. **Today › Your three: the selected ✓.**
   - In `HabitCheckList.tsx`, split `answerSelected` into `answerYes: { backgroundColor: c.moon }` with the check glyph in `c.background` (10.9:1).
   - Add `answerNo: { backgroundColor: c.surfaceHi }` with the dash in `c.textPrimary` (13.7:1).
   - "Not today" stays clearly answered, but it is never celebrated and never red.
2. **Patterns › Calendar.**
   - The entry dot goes from a 4pt ivory dot to a **6pt `moon` dot**: every night you wrote is lit.
   - The all-habits ring (`fullHabitRing`) becomes `borderColor: c.moon, borderWidth: 1.5`.
   - The no-entry outline stays `frame`, and today keeps its 1pt ivory box.
3. **Patterns › Habit grid.**
   - `done` → `c.moon`.
   - `notDone` keeps its `textSecondary` outline.
   - Unanswered cells get `backgroundColor: c.surface`, so the 7/30/90 track is actually drawn.

*Optional fourth, same subject:* the 363 progress bar fill. One subject keeps one hue across screens.

**Moonlight must never appear on:**

- primary buttons (Sign in, Continue, Submit stay as the white pill, the inverted primary for dark screens);
- toggles, or the tab bar's active state;
- links, headings, eyebrows or any body text;
- the mood picker or mood chart;
- the streak or 363 numerals;
- toasts and errors (amber);
- the AI card, or the "…" logo tile;
- a missed day, or a "not today" answer.

Budget: under 3% of the pixels on any screen.

### Should mood words get a muted per-mood tint? Recommendation: no.

- **Valence colour is judgement.** A "rough" night shown in a "bad" colour is the opposite of "missed days are simply empty".
- **The app runs crisis detection.** The people most likely to log "rough" are the ones a punishing colour hurts most.
- **Five hues** break the four-hue ceiling and turn the Patterns month into a mood ring.
- **Any warm-to-cool ramp lands amber on "low",** and amber already means warning.
- **Colour blindness:** a red–green ramp is unreadable for about 1 in 12 men.

Mood already carries its meaning by **position** (the chart's y-axis) and by **word**. If mood should be more visible, make the chart honest instead of coloured: label all five levels at 12pt in sans, draw a 2pt ink line, and show a sentence instead of a plot when there are fewer than three points.

If a tint is ever tried anyway: one hue, varying in lightness only, on the chart dots only. Never on the chips or the calendar.

---

## 3. The three changes that would move the app most (ranked)

### 1. Put every word at 4.5:1 or better. *(Lifts the 6.0 cap; accessibility; low risk.)*

`textTertiary` #36363a measures 1.68:1 on `background`, 1.51:1 on `surface` and 1.41:1 on `surfaceHi`. It is for non-text marks only: empty dots, the no-entry outline, and inactive future-day numerals (inactive controls are exempt under WCAG 1.4.3).

- **Swap `textTertiary` → `textSecondary`** (5.64:1 on bg, 5.07:1 on surface) wherever it sets words:
  - Today: the lock line and the "Edit entry" link (`app/(tabs)/index.tsx:369, 391`);
  - the entry timestamp (`EntryCard.tsx:58`);
  - calendar weekday headers (`Calendar.tsx:184`);
  - "Progress to 363", "0/363" and the best-streak caption (`StreakCounter.tsx:56, 100, 103`);
  - "0 entries" and the footer lines (`settings.tsx:386, 615, 616`);
  - the interests hint (`interests.tsx:395`);
  - the retry link (`reflect.tsx:244`);
  - the Circle empty state (`social.tsx:255`);
  - the username hint (`profile-setup.tsx:311`).
- **The placeholder is content.** The daily prompt "What's beautiful about where you are right now?" currently sits at 1.51:1. In `EntryInput.tsx:60`, set `placeholderTextColor` → `textSecondary` (5.07:1). Typed text at 14.7:1 still reads clearly as different.
- **The disabled Submit is invisible.** In `Button.tsx:27–47`, `frame` fill, `textTertiary` label and `opacity: 0.5` together come to about 1.1:1.
  - Drop the opacity.
  - Disabled primary = `backgroundColor: c.surface`, label `c.textSecondary` (5.07:1).
  - On Today, pass the label "Write 3 sentences" while count < 3. The counter already computes "3 more".
- **Toasts** (`Toast.tsx`):
  - `marginHorizontal: edgePadding.content` (24), so a toast never touches the screen edges;
  - `borderRadius: componentRadius.card` (16), so a two-line message is not a stadium shape;
  - drop `uppercase` and `family="monoMedium"` in favour of sans 14 in sentence case;
  - place it below the header (`top: insets.top + 56`) or just above the tab bar, so it never covers the dateline or the title.

### 2. Moonlight for "kept"; stop using white for every state.

- Add `moon: '#a9c1d9'` to `theme/colors.ts` and apply it to the three surfaces in §2: the HabitCheckList yes/no split, the Calendar dot and ring, and the HabitGrid done and unanswered cells.
- **Toggles** (Settings Switch `trackColor` / `thumbColor`).
  - Today, ON is a white track with a cream thumb, so the thumb nearly disappears, and four white tracks are the loudest marks on the screen.
  - New ON: track `textPrimary` #ebe7dc, thumb `background` #060608.
  - New OFF: track `surfaceHi`, thumb `textSecondary`.
  - That is a clear inversion with no hue. On web, keep `activeThumbColor` in line with this per the project rule.
- **Result:** white means one thing, the action to take. Moonlight means one thing, something you kept. Everything else is ivory or grey.

### 3. Make Patterns answer "Am I showing up?" first.

- **Lead with nights written, not the streak.**
  - In `StreakCounter.tsx`, the hero becomes `totalEntries` with "nights written · 362 to go", set at `TypeStyle.streakLadder` (40pt; app figures stay at 40 or under).
  - The current streak drops to a small sibling figure, or goes.
  - Today the screen's own copy says missed days are "not broken streaks", while its largest figure is a 64pt "0 day streak".
  - Do the same on the Settings profile row ("0 day streak · 0 entries" → "1 night · 362 to go").
- **Add one line under the "Patterns" title,** computed from the month: "4 of 18 nights this month · all three kept on 2". This is the screen's finding.
- **Move `RangeSelector`** (`patterns.tsx:227`) from above the calendar, which it does not control, to directly above Mood and Habits, which it does. Show the options as "7 days · 30 days · 90 days" in sans, not as bare mono numerals.
- **`MoodChart`:** with fewer than three mood days in range, render a sentence ("1 night logged: good") instead of a 120pt plot holding one dot.
- **Move "About the practice"** (`patterns.tsx` ~370–390) to Settings › About. It is onboarding copy sitting on a data screen.

**Expected effect:** with 1–3 done and the §5 exemption adopted, a re-review should land around 7.0–7.5 overall. That is not measured; re-shoot the same screens to check.

---

## 4. Other findings (smaller, ranked)

1. **The left-border crescent.**
   - `EntryCard.tsx:37/70` and onboarding `index.tsx:239, 378, 516, 562` combine `borderLeftWidth: 2` in white with a 16pt corner radius. iOS draws this as a curved white crescent hugging the corner.
   - Drop the left border: the surface step already sets the card apart. If you want a mark, use a separate 3pt `View` bar inset inside the padding, with square ends.
2. **Label the tabs.** In `app/(tabs)/_layout.tsx:97`, set `tabBarShowLabel: true` and use 11–12pt sans labels "Today · Circle · Patterns · Settings". The speech-bubble icon alone does not say "The Circle".
   - Also, line 89 hardcodes `'#1e1e22'`; use `colors.dark.frame` (project rule).
3. **Write in the face you read in.**
   - In `EntryInput.tsx:81`, switch to `Newsreader_400Regular` 18/28.8 (`TypeStyle.readingLg`), with the placeholder in `Newsreader_400Regular_Italic`.
   - The entry then looks the same before and after Submit, and the act of writing feels like the journal.
   - This is the cheapest "face" this product can have.
4. **One name.** Login says "Three Sentences", onboarding says "ThreeSixtyThree™" under a "THREE SENTENCES" eyebrow, and the code headers say "Three™". Pick one product name; let "363" stay the name of the practice.
5. **Onboarding "01 / 04".** It is index numbering and duplicates the page dots below it. Delete the numerals.
6. **Interests copy.** "What defines you? … like-minded individuals" is generic. "3 of 3+ selected Ready to continue" mixes two styles on one line. Write it plainly: "Pick three or more. We use these to suggest people for your Circle."
7. **Edit mode turns Submit into a round grey ✓.** Keep the same pill and call it "Save changes".
8. **Day detail contradicts itself.** It shows "Mood good" while the section below says "Turn on Mood in Settings". When mood is off, hide that section, or say "Mood is off. Past moods still show on each day."
9. **Settings.** The flame glyph on the streak is a stock gamification icon; drop it with change 3.
10. **Type tokens under the floor.** Retire `TypeStyle.meta` (10pt) and `TypeStyle.metaSm` (9pt); the floor is 11pt.
11. **Sparkle on the AI card.** The ✦ sparkle is the stock "AI" mark. A plain title ("Reflections") does the job.

---

## 5. Where the house rules collide with the brand's mono-eyebrow voice

**The house rules for pages** ban three things: eyebrows, monospace outside code, and tiny uppercase letter-spaced labels. Any of them visible caps the overall score at 6.5. **The app rules relax this**: small sentence-case labels are fine, with "at most one tracked uppercase label on a screen", and monospace is allowed for IDs and figures.

**The brand** uses IBM Plex Mono, uppercase and tracked, 56 times: the dateline, every section label, form labels, toasts, links, buttons and the lock line. The lint run flags 14 mono uses and 5 eyebrows.

The collision is real but not all-or-nothing. The mono voice works when it says what **a clock or a counter** would say. It fails when it is asked to carry **a sentence or a heading**. The worst case is the two-line uppercase error toast: the hardest text in the app to read, at the moment the user most needs to read it.

**Recommendation: keep mono as "the clock", retire it as "the label".**

Keep in mono:

- Today's dateline, "WEDNESDAY, NOVEMBER 18". This is the screen's one tracked uppercase line, the header of the diary page.
- The sentence counter "0 / 3 · 3 more" (already lowercase).
- Ticking figures: "10:26 PM", "1/1", "0/363". Use mono digits with no tracking.

Retire, moving to Schibsted Grotesk in sentence case:

- **Section labels:** HOW WAS TODAY → "How was today?"; YOUR THREE → "Your three". Likewise Mood, Habits, Preferences, Trackers and Reflections. Set them at 14/600 in `textSecondary`, or 16/600 in `textPrimary` where the label is the section's heading. "Your three" keeps the brand phrase; it just stops shouting.
- **Form labels** (EMAIL, PASSWORD, NEW PASSWORD) → 14/500 sentence case.
- **Toasts and inline errors** → sans 14, sentence case.
- **Links and buttons set in mono** ("Forgot password?", "No account? Sign up", "EDIT ENTRY", "You can always update these later") → sans.
- **Subtitles under the display titles** ("WELCOME BACK", "CHOOSE SOMETHING MEMORABLE") → drop them, or set them in sentence-case Newsreader italic to match the title above.
- **"363 PROGRESS", "ABOUT THE PRACTICE"** → these go with change 3.

**A rule to add to CLAUDE.md:**

> Mono is for time and counts. One uppercase tracked line per screen: the dateline. Anything a person reads as a sentence or a heading is set in Schibsted or Newsreader.

If this is adopted, I would lift the 6.5 eyebrow cap for this app as a reasoned brand exemption, recorded here. It is not a waiver of the rule. The single dateline then reads as identity rather than costume, because it is the only one.

---

## 6. Measurements

**Token contrast (WCAG 2.x)**

| Token | Hex | background #060608 | paper #0e0e10 | surface #15151a | surfaceHi #1c1c22 |
|---|---|---|---|---|---|
| textPrimary | #ebe7dc | 16.39 | 15.61 | 14.73 | 13.72 |
| textBright | #ffffff | 20.24 | 19.28 | 18.20 | 16.95 |
| textSecondary (new) | #8a877f | 5.64 | 5.37 | 5.07 | 4.73 |
| textSecondary (old, in screenshots) | #7f7c74 | 4.86 | 4.63 | 4.37 ✗ | 4.07 ✗ |
| **textTertiary** | #36363a | **1.68 ✗** | **1.60 ✗** | **1.51 ✗** | **1.41 ✗** |
| frame | #1e1e22 | 1.22 | 1.16 | 1.10 | 1.02 |
| warn | #f6c177 | 12.35 | 11.77 | 11.10 | 10.34 |
| **moon (proposed)** | #a9c1d9 | **10.91** | 10.39 | **9.81** | 9.14 |

**`lint.mjs --app`** (62 files): 3 FAIL, 20 WARN.

- FAIL `placeholder-data`: `you@example.com` in `login.tsx:90` and `signup.tsx:106`. This is the conventional email hint in an input, so it is defensible as is.
- FAIL `emoji`: `✕` used as an icon in `components/social/MessageBubble.tsx:133`. Real: replace it with an `Icon`.
- WARN: `mono` ×14 and `eyebrow` ×5 (see §5), plus 17 em dashes in copy.

**Not run:** `inspect.mjs`, which needs a browser render that a native app cannot give it.
