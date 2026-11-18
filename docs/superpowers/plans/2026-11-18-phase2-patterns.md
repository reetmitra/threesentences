# Phase 2 — Patterns Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the History and Insights tabs with one Patterns tab — calendar (entries + full-habit days), a 7/30/90-day mood chart and habit grid, a tap-a-day detail panel, the AI reflection card and 363 progress — fed by one RPC per range.

**Architecture:** A security-invoker Postgres function `get_patterns(p_from, p_to)` returns one row per day (entry present, mood, habit answers) under the caller's RLS. `store/patterns.ts` wraps it with an AsyncStorage cache; pure helpers in `types/patterns.ts` do all range, stats and chart math (unit-tested). Dumb SVG chart components render the helpers' output; `app/(tabs)/patterns.tsx` composes them and absorbs the History calendar and Insights cards.

**Tech Stack:** Expo SDK 54 / React Native 0.81, expo-router, Supabase, `react-native-svg` (already installed — no chart library), AsyncStorage, Jest (node env; component tests disabled, so UI is verified in the simulator).

**Spec:** `docs/superpowers/specs/2026-11-17-life-hub-design.md` — §5 (tabs), §9 (Patterns), §16 (cross-cutting), §19 Phase 2. Builds on Phase 1 (`docs/superpowers/plans/2026-11-17-phase1-nightly-checkin.md`).

## Global Constraints

- **Branch:** `feat/phase2-patterns`, created from `feat/phase1-checkin` (PR #1 is not merged yet). Commit per task with the owner's standing OK; never push or merge without asking.
- TypeScript strict, no `any`. Theme tokens only (`theme/colors`, `theme/spacing`, `theme/typography`), `StyleSheet.create` at the bottom, touch targets ≥ 44×44pt. No `Alert.alert` — `useToast()` / `ConfirmationModal`.
- **Reduced motion:** charts never animate their draw when `useReducedMotion()` is true. *My call:* charts don't animate at all in Phase 2 (simplest correct option).
- **Accessibility:** every chart has an `accessibilityLabel` text summary (e.g. "Mood over 30 days: mostly okay, two rough days, last 5 days good").
- **Dates:** always `getTodayDateString()` / `parseDateString` / `formatDateString` from `types/entry.ts`; never `toISOString().split('T')[0]`. All ranges end on the **logical** today. New date math needs unit tests (CLAUDE.md: date logic is reviewed).
- **Habit squares:** filled = done, outline = not done, empty space = unanswered. **Never red**, no "failed"/streak-break copy.
- Mood words, exactly and in order: **rough · low · okay · good · great** (1–5) — reuse `MOOD_LABELS`.
- Range options exactly **7 / 30 / 90** days; default **30** (*my call*).
- Schema changes land in `supabase/migrations/`, `supabase/schema.sql` and `types/supabase.ts` together. **Applying to live Supabase needs the owner's go-ahead.** RPCs are `SECURITY INVOKER`, `SET search_path = public`, EXECUTE revoked from PUBLIC/anon, granted to authenticated.
- Commit format: `type(scope): description` + body explaining why, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Baseline: full jest suite green (16 suites, 360 tests) — no failures allowed.

## Decisions made in this plan (owner may override)

1. **Tabs become `Today · Circle · Patterns · Settings`** (spec §5's Log tab arrives hidden in Phase 6). `history.tsx` and `guide.tsx` are deleted, not hidden.
2. **Patterns tab icon:** lucide `ChartLine` (verified exported). Accessibility label "Patterns — your history and trends".
3. **Calendar ring = a day where every habit answer is done** (≥ 1 answer, all `true`). Using "all *currently active* habits" would rewrite history whenever habits change.
4. **Habit grid shows currently active habits only**; archived habits' history stays in export, not on Patterns.
5. **Day detail is an inline panel under the calendar** (as History does today), read-only. Tapping *today* shows the panel plus an "Open Today" link.
6. **The daily writing prompt moves to Today** as the input placeholder when the setting is on (it lived on Insights, which is going away). Settings subtitle becomes "Shown as today's prompt".
7. **Phase 1 parked item folded in:** Today's "edit entry" gets a stale-date guard (spec §6 locking), Task 6.
8. **Phase 1 deferred index folded in:** `habit_logs (user_id, date)` index, Task 1.

## Review Focus

1. **Range edges** — 7/30/90-day ranges ending on the logical today must cross month/year boundaries and DST nights with exactly N days, no gaps or duplicates. Pinned in Task 2 (`buildRange` tests under the suite's America/New_York TZ).
2. **A brand-new user (no data at all)** — every section renders a quiet empty state; no `NaN`/`Infinity` in chart geometry. Pinned in Task 2 (`moodPoints` / `habitStats` empty tests) and Task 3.
3. **Habits that changed** — answers for archived or unknown habit ids must not crash the grid or skew counts. Pinned in Task 2 (`habitStats ignores answers for other habits`).
4. **Opening Patterns offline** — with a cache for the same range on the same day, the cached data shows silently (no toast: `getPatterns` returns the cache when the RPC fails, Ruling 7). With no cache, one toast and the quiet empty states, never a blank screen or a stuck skeleton. The cache is per user (another account on the device never sees it). Pinned in Task 2 (`getPatterns returns cache when the RPC fails`, `never serves one user's cache to another`).
5. **Coming back from Today** — a mood/habit tap made on Today must show on Patterns when the tab regains focus. Pinned in Task 5 (refetch on focus) + simulator step.

---

## File Structure

| File | Responsibility |
|---|---|
| `supabase/migrations/20261118000000_phase2_patterns.sql` (create), `supabase/schema.sql`, `types/supabase.ts` | Index + `get_patterns` RPC |
| `types/patterns.ts` (create) | `PatternDay` types, row mapper, range + stats + chart-geometry helpers (pure) |
| `store/patterns.ts` (create) | `getPatterns` (RPC + cache), `getCachedPatterns` |
| `components/patterns/RangeSelector.tsx`, `MoodChart.tsx`, `HabitGrid.tsx`, `DayDetail.tsx` (create) | Dumb UI |
| `components/Calendar.tsx` (modify) | Optional ring for full-habit days |
| `app/(tabs)/patterns.tsx` (create); `app/(tabs)/history.tsx`, `app/(tabs)/guide.tsx` (delete); `app/(tabs)/_layout.tsx` (modify) | Screen + tabs |
| `app/(tabs)/index.tsx`, `app/(tabs)/settings.tsx` (modify) | Prompt placeholder, edit-entry stale guard, copy |
| `__tests__/types/patterns.test.ts`, `__tests__/store/patterns.test.ts` (create) | Tests |

---

### Task 1: Patterns RPC and index

**Files:**
- Create: `supabase/migrations/20261118000000_phase2_patterns.sql`
- Modify: `supabase/schema.sql` (append before `ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;`), `types/supabase.ts` (`Functions.get_patterns`)

**Interfaces:**
- Produces: `public.get_patterns(p_from DATE, p_to DATE) RETURNS TABLE (date DATE, has_entry BOOLEAN, mood SMALLINT, habit_answers JSONB)` — one row per date in `[p_from, p_to]` ascending; `habit_answers` is `{}` or `{"<habit_id>": true|false, …}`.

- [ ] **Step 1: Write the migration.**

```sql
CREATE INDEX IF NOT EXISTS habit_logs_user_date ON public.habit_logs (user_id, date);

CREATE OR REPLACE FUNCTION public.get_patterns(p_from DATE, p_to DATE)
RETURNS TABLE (date DATE, has_entry BOOLEAN, mood SMALLINT, habit_answers JSONB)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT d::date,
         EXISTS (SELECT 1 FROM public.entries e
                 WHERE e.user_id = (auth.uid())::text AND e.date = d::date),
         (SELECT c.mood FROM public.checkins c
          WHERE c.user_id = (auth.uid())::text AND c.date = d::date),
         COALESCE((SELECT jsonb_object_agg(l.habit_id::text, l.done) FROM public.habit_logs l
                   WHERE l.user_id = (auth.uid())::text AND l.date = d::date), '{}'::jsonb)
  FROM generate_series(p_from, p_to, interval '1 day') AS d
  WHERE p_from <= p_to AND p_to - p_from <= 370
  ORDER BY 1;
$$;
REVOKE EXECUTE ON FUNCTION public.get_patterns(DATE, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_patterns(DATE, DATE) TO authenticated;
```
(The explicit `auth.uid()` filters duplicate RLS on purpose so the plan is index-friendly; RLS still applies because the function is security invoker. A range longer than 370 days or reversed returns no rows.)

- [ ] **Step 2: Mirror** into `schema.sql` and add `get_patterns: { Args: { p_from: string; p_to: string }; Returns: { date: string; has_entry: boolean; mood: number | null; habit_answers: Json }[] }` to `types/supabase.ts`. `npx tsc --noEmit -p .` clean.
- [ ] **Step 3: Controller applies the migration** (owner go-ahead) and runs a rolled-back verification. Expected: `RESULT: 7 rows | entry true | mood 4 | answers {h:true} | empty day {} | other user sees mood null/answers {}/no entry | reversed 0 rows | 400-day 0 rows | anon denied`.
- [ ] **Step 4: Commit** — `feat(db): get_patterns RPC and habit_logs date index`

---

### Task 2: Pattern helpers and store

**Files:**
- Create: `types/patterns.ts`, `store/patterns.ts`
- Test: `__tests__/types/patterns.test.ts`, `__tests__/store/patterns.test.ts`

**Interfaces:**
- Consumes: `parseDateString`, `formatDateString`, `getTodayDateString` (types/entry.ts); `MoodValue`, `isMoodValue`, `MOOD_LABELS`, `HabitAnswers`, `Habit` (types/tracking.ts); `get_patterns` (Task 1).
- Produces (`types/patterns.ts`):
  - `type RangeDays = 7 | 30 | 90`; `RANGE_OPTIONS: readonly RangeDays[] = [7, 30, 90]`; `DEFAULT_RANGE: RangeDays = 30`.
  - `interface PatternDay { date: string; hasEntry: boolean; mood: MoodValue | null; answers: HabitAnswers }`; `interface DbPatternRow { date: string; has_entry: boolean; mood: number | null; habit_answers: unknown }`; `mapPatternRows(rows: DbPatternRow[]): PatternDay[]` (invalid mood → null; non-object or non-boolean answers dropped).
  - `buildRange(endDate: string, days: RangeDays): { from: string; to: string }` — inclusive, `to = endDate`, exactly `days` dates.
  - `monthRange(year: number, month: number): { from: string; to: string }` (month 1–12; first to last day).
  - `isFullHabitDay(day: PatternDay): boolean` — ≥ 1 answer and all true.
  - `habitStats(days: PatternDay[], habitId: string): { done: number; answered: number }`.
  - `moodPoints(days: PatternDay[], width: number, height: number): { x: number; y: number; mood: MoodValue; date: string }[]` — x spread evenly across `days.length` slots (single day → centred), y maps 1 (bottom) … 5 (top); skips null moods; never NaN.
  - `moodSegments(points): { x1; y1; x2; y2 }[]` — lines only between points on **consecutive** dates.
  - `summarizeMood(days: PatternDay[], range: RangeDays): string` — e.g. `"Mood over 30 days: mostly okay, 2 rough days."`; no moods → `"No mood logged in the last 30 days."`.
  - `summarizeHabit(name: string, stats: { done: number; answered: number }, range: RangeDays): string` — `"In bed by 1am: 4 of 7 days"` (denominator = days **answered**, matching the spec's "5 of 7 this week" without counting unanswered days against the user); no answers → `"In bed by 1am: not checked in yet"`.
- Produces (`store/patterns.ts`): `getPatterns(from: string, to: string): Promise<PatternDay[]>` — calls the RPC, writes `{ from, to, days }` under the per-user slot key `@threesentences/patterns/${userId}/${slot}` (slot `r7`|`r30`|`r90` or `mYYYY-MM`; no session → no cache), and a cached value counts only when its from/to match; on RPC error returns the cached value if any, else throws `Error("Couldn't load your patterns.")`. `getCachedPatterns(from: string, to: string): Promise<PatternDay[] | null>`.

- [ ] **Step 1: Write failing tests** (`patterns.test.ts`) — the suite runs in America/New_York (jest.config.js):
  - `buildRange('2026-03-10', 7)` → `{ from: '2026-03-04', to: '2026-03-10' }` (crosses US DST start 2026-03-08); `buildRange('2027-01-02', 7)` → from `'2026-12-27'`; for 30 and 90, the inclusive count of dates from→to equals N.
  - `monthRange(2028, 2)` → `{ from: '2028-02-01', to: '2028-02-29' }`; `monthRange(2026, 12)` → to `'2026-12-31'`.
  - `mapPatternRows` drops mood 0/6/'3' and non-boolean answers; keeps `{h1: true}`.
  - `isFullHabitDay`: `{}` → false; `{a:true,b:false}` → false; `{a:true}` → true.
  - `habitStats ignores answers for other habits`: answers on `x` don't count toward `h1`; empty days → `{0,0}`.
  - `moodPoints([], 300, 100)` → `[]`; one day with mood 3 → x = 150, y = 50; no NaN for any input.
  - `moodSegments`: moods on Mon, Tue, Thu → one segment (Mon–Tue).
  - `summarizeMood` exact strings above.
  And `__tests__/store/patterns.test.ts` (mock `@/config/supabase` `rpc`): `getPatterns returns cache when the RPC fails`; throws the message when no cache; writes the cache on success.
- [ ] **Step 2: Run → FAIL** — `npx jest __tests__/types/patterns.test.ts __tests__/store/patterns.test.ts`.
- [ ] **Step 3: Implement.** Date stepping with `setDate(getDate() ± n)` on `parseDateString` results (local, DST-safe), formatted with `formatDateString`. "Mostly X" = the most frequent mood (ties → the higher mood); the rough count is appended only when > 0.
- [ ] **Step 4: Run → PASS**, then full `npx jest` + `npx tsc --noEmit -p .`.
- [ ] **Step 5: Commit** — `feat(journal): pattern helpers and cached patterns store`

---

### Task 3: Chart and panel components

**Files:**
- Create: `components/patterns/RangeSelector.tsx`, `components/patterns/MoodChart.tsx`, `components/patterns/HabitGrid.tsx`, `components/patterns/DayDetail.tsx`
- Modify: `components/Calendar.tsx` (optional `fullHabitDates?: Set<string>` prop — a thin ring in `textSecondary` around those days; existing behaviour unchanged when absent)

**Interfaces:**
- Consumes: Task 2 helpers and types; `MOOD_LABELS`, `Habit`; `EntryCard` (`entry`, `showDate`).
- Produces:
  - `RangeSelector({ value, onChange }: { value: RangeDays; onChange: (r: RangeDays) => void })` — three 44pt chips `7 / 30 / 90`, `accessibilityRole="radio"` + selected state.
  - `MoodChart({ days, range }: { days: PatternDay[]; range: RangeDays })` — SVG, height 120; dots (`textBright`) + segments (`textSecondary`); left axis words *great* (top) and *rough* (bottom) only; `onLayout` width; `accessibilityLabel={summarizeMood(days, range)}`; no moods → one line "No mood logged yet." No animation.
  - `HabitGrid({ habits, days, range }: { habits: Habit[]; days: PatternDay[]; range: RangeDays })` — per habit: name, a row of cells (filled `textBright` = done, `frame` outline = not done, nothing = unanswered), and `"{done}/{answered}"`. Cell width = available width / `days.length` minus 2pt gap (90 days → thin bars). `accessibilityLabel={summarizeHabit(...)}` per row. No habits → "Add habits on Today to see them here."
  - `DayDetail({ date, entry, day, habits, isToday, onOpenToday }: { date: string; entry: Entry | null; day: PatternDay | null; habits: Habit[]; isToday: boolean; onOpenToday: () => void })` — `EntryCard` (or "No entry this day."), mood word, a line per answered habit (`✓` / `—`); "Open Today" link (44pt) only when `isToday`. Read-only.

- [ ] **Step 1: Build the components** to the interfaces (theme tokens, `StyleSheet.create`, no red, no animation).
- [ ] **Step 2: Calendar ring** — add the prop and style; check `history.tsx` still type-checks (it's deleted in Task 4, but keep the tree compiling per commit).
- [ ] **Step 3: Checks** — `npx tsc --noEmit -p .` clean; full `npx jest` green.
- [ ] **Step 4: Commit** — `feat(journal): mood chart, habit grid and day detail components`

---

### Task 4: Patterns screen and tabs

**Files:**
- Create: `app/(tabs)/patterns.tsx`
- Delete: `app/(tabs)/history.tsx`, `app/(tabs)/guide.tsx`
- Modify: `app/(tabs)/_layout.tsx` (remove the `history` and `guide` `Tabs.Screen`s; add `patterns` between `social` and `settings` with lucide `ChartLine`, title "Patterns", accessibility label "Patterns — your history and trends")

**Interfaces:**
- Consumes: Task 2 store/helpers, Task 3 components; existing `getEntryForDate(userId, date)` (store/entries.ts), `getEntryStats(userId)`, `StreakCounter({ currentStreak, longestStreak, totalEntries })`, `getActiveHabits()` (store/habits.ts), `getPreferences()` (`aiReflectionEnabled`), `getTodayDateString`.

- [ ] **Step 1: Screen layout (top → bottom)** per spec §9 sketch: header "Patterns" + `RangeSelector`; **calendar card** (month nav as in History; data from `getPatterns(monthRange(...))`; `entryDates` = days with `hasEntry`; `fullHabitDates` = `isFullHabitDay`) with `DayDetail` below when a date is selected; **MOOD** eyebrow + `MoodChart` (tracker off → the eyebrow stays with one quiet secondary line, "Turn on Mood in Settings", spec §9 / Ruling 11); **HABITS** eyebrow + `HabitGrid` (tracker off → "Turn on Habits in Settings"); the existing **AI Reflection** card from guide.tsx (same copy and `router.push('/(tabs)/reflect')`); **363 PROGRESS** (`StreakCounter`); **ABOUT THE PRACTICE** — the two cards from guide.tsx ("The 363 Way", "Presence Over Perfection") verbatim.
- [ ] **Step 2: Data flow.** Range data via `getPatterns(buildRange(getTodayDateString(), range))`; on mount and on `useFocusEffect`, first render `getCachedPatterns` (instant), then refresh; a failed refresh with a same-day cache keeps the cached data silently (Ruling 7); with no cache, `showToast('error', "Couldn't load your patterns.")` once per refresh cycle. Month data the same way for the calendar month on screen. Default month = the month of the **logical** today (fixes the Phase 1 parked `history.tsx:22` item). `trackers` from `getCachedSettings()` at render.
- [ ] **Step 3: Delete** `history.tsx` and `guide.tsx`; grep the repo for `(tabs)/history`, `(tabs)/guide`, `'history'`, `'guide'` route references and fix any.
- [ ] **Step 4: Checks** — `npx tsc --noEmit -p .`, full `npx jest`, and (since the web build is part of the product) `npx expo export --platform web --output-dir /tmp/three-web-check` must succeed.
- [ ] **Step 5: Commit** — `feat(journal): Patterns tab replaces History and Insights`

---

### Task 5: Prompt placeholder, copy, and focus refetch check

**Files:**
- Modify: `app/(tabs)/index.tsx` (writing-state `EntryInput` placeholder), `app/(tabs)/settings.tsx:436` (prompt subtitle)

**Interfaces:**
- Consumes: `getDailyPrompt(dateString: string): Prompt` (constants/prompts.ts; use its `.text`), `getPreferences()` (`dailyPromptEnabled`), `getTodayDateString()`.

- [ ] **Step 1:** When `dailyPromptEnabled`, Today's input placeholder is `getDailyPrompt(today).text`; otherwise the existing "Three sentences. What happened?". Load the preference in Today's existing `loadData`.
- [ ] **Step 2:** Settings subtitle: `promptEnabled ? "Shown as today's prompt" : 'Disabled'`.
- [ ] **Step 3: Checks** — `tsc`, full `jest`.
- [ ] **Step 4: Commit** — `feat(journal): daily prompt shows on Today`

---

### Task 6: Today edit-entry stale guard (Phase 1 parked item)

**Files:**
- Modify: `app/(tabs)/index.tsx` (the done-state "edit entry" `onPress`; `loadData`)

**Interfaces:**
- Consumes: `isStaleDate(date: string, now?: Date): boolean` (types/entry.ts, Phase 1).

- [ ] **Step 1:** In the "edit entry" `onPress`, if `isStaleDate(today)` → `loadData()` and return without prefilling. In `loadData`, when the date being loaded differs from the last date loaded (keep it in a ref), reset `content` to `''` and the `isEditingSubmitted` ref to `false` before applying the new day's entry/draft.
- [ ] **Step 2: Checks** — `tsc`, full `jest`.
- [ ] **Step 3: Commit** — `fix(journal): never prefill last night's entry into a new day`

---

## Simulator walkthrough (controller, after Task 6 — needs a signed-in account)

1. Tabs read Today · Circle · Patterns · Settings; History and Insights are gone.
2. New account: every Patterns section shows its quiet empty state; no crash.
3. Log mood + habits on Today → Patterns (focus) shows today's dot and squares; tap today on the calendar → panel + "Open Today".
4. Range 7 / 30 / 90 switches; 90 shows thin bars, no overflow at iPhone SE width.
5. Turn Mood off in Settings → Patterns keeps the MOOD eyebrow with one quiet line, "Turn on Mood in Settings" (same for Habits).
6. Airplane mode → reopen Patterns: with a cache from earlier today, the cached data shows and no toast; with no cache (e.g. a range not opened today), one toast and the empty states.
7. VoiceOver reads the chart summaries.
8. Daily prompt on → Today placeholder shows the prompt.
