# Phase 1 — Nightly Check-in Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Today into a ~60-second nightly check-in — three sentences, a mood tap, up to three yes/no habits — on a "logical day" that ends at 4am by default, with the settings to control it.

**Architecture:** The rollover lives inside `getTodayDateString()` (types/entry.ts), so every existing caller becomes rollover-aware in one place. Private settings, habits, habit answers and mood go in four new owner-only Supabase tables, read through thin stores (`store/settings.ts`, `store/habits.ts`, `store/checkins.ts`) with pure, tested helpers in `types/tracking.ts`. One hook (`hooks/useCheckIn.ts`) owns check-in state for a date; three dumb components render it on Today and Settings.

**Tech Stack:** Expo SDK 54 / React Native 0.81, expo-router, Supabase JS v2, AsyncStorage, Jest (node env; component tests are disabled in `jest.config.js`, so UI is verified in the iOS simulator).

**Spec:** `docs/superpowers/specs/2026-11-17-life-hub-design.md` (§5 settings table, §6 logical day, §7 check-in, §8 habits & mood, §16 cross-cutting).

## Global Constraints

- **Prerequisite:** the 2026-11-17 launch fixes are still uncommitted. Commit them (owner's OK) and create branch `feat/phase1-checkin` before Task 1. Commit only with the owner's OK; never push without it.
- TypeScript strict, no `any`. Theme tokens only (`theme/colors`, `theme/spacing`, `theme/typography`), `StyleSheet.create` at the bottom, touch targets ≥ 44×44pt, respect `useReducedMotion()`. No `Alert.alert` — use `useToast()` / `ConfirmationModal`.
- Every new user table: RLS on, owner-only, `user_id TEXT NOT NULL DEFAULT (auth.uid())::text`, added to `delete_my_account()`, never stored on `profiles` (it is world-readable).
- Every schema change lands in `supabase/migrations/`, `supabase/schema.sql` and `types/supabase.ts` in the same commit. **Applying a migration to the live project needs the owner's go-ahead.**
- Dates: always `getTodayDateString()` / `getLogicalDateString()`; never `toISOString().split('T')[0]`.
- "Day ends at" options are exactly 0–6, default **4**. Labels: `0 → "midnight"`, `n → "${n}am"`.
- Mood words, exactly and in order: **rough · low · okay · good · great** (stored 1–5).
- Habits: name 1–40 characters after trimming; at most **3** active; answers are done / not done / unanswered. No streak counters, no red, no "failed" copy — unanswered is empty.
- Habit suggestions, exactly: *In bed by 1am · No alcohol · No smoking · Moved 20 min · Read 10 pages · 2L water · No phone in bed*.
- Answers and mood are editable only for the current logical day (Today never shows another day in Phase 1).
- Commit format: `type(scope): description` + body explaining why, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Open owner decisions (spec §17):** #3 rollover default — this plan uses **4am for everyone**; #1 low-mood rule — Task 8 is **gated** and must not start until the owner confirms it.

## Review Focus

1. **Writing at 1–4am** — Today must show and save to *yesterday's* logical date (entry, mood, habits, streak). Pinned in Task 1 (`returns the previous day before the rollover hour`) and Task 5 manual step.
2. **DST nights** — spring-forward and fall-back must not shift the logical date. Pinned in Task 1 (`logicalDate.dst.test.ts`).
3. **Cold start offline / switching accounts on one device** — the rollover must come from the cached settings, and one user's cached settings must never apply to the next user. Pinned in Task 3 (`hydrates from cache`, `falls back to defaults on corrupt cache`, `reset clears cache and rollover`).
4. **A 4th habit, or two devices adding the third at once** — friendly "You already have three habits." instead of a crash. Pinned in Task 4 (`nextFreeHabitPosition returns null when full`, `maps 23505 to the three-habit message`) and Task 2 SQL (`4th active habit rejected`).
5. **A failed save on tap (offline)** — the chip must revert and a toast must say so; nothing silently lost. Pinned in Task 5 manual step (airplane mode).

---

## File Structure

| File | Responsibility |
|---|---|
| `types/entry.ts` (modify) | Logical-day math + current rollover hour (module state) |
| `types/tracking.ts` (create) | Settings / habit / mood types, defaults, mappers, validators, suggestions |
| `utils/exportFormat.ts` (create) | Pure TXT/JSON export builders including habits & mood |
| `store/settings.ts` (create) | `user_settings` read/write + AsyncStorage cache |
| `store/habits.ts` (create) | Habits + habit answers |
| `store/checkins.ts` (create) | Daily mood |
| `hooks/useCheckIn.ts` (create) | Check-in state for one date, optimistic saves |
| `components/MoodPicker.tsx`, `components/HabitCheckList.tsx`, `components/HabitSetupSheet.tsx` (create) | Dumb UI |
| `app/(tabs)/index.tsx`, `app/(tabs)/settings.tsx`, `app/index.tsx`, `app/(tabs)/guide.tsx`, `app/(onboarding)/index.tsx`, `store/entries.ts`, `store/profile.ts` (modify) | Wiring + copy |
| `supabase/migrations/20261117000200_phase1_checkin.sql` (create), `supabase/schema.sql`, `types/supabase.ts` (modify) | Schema |
| `landing/app/privacy/page.tsx` (modify) | Disclose habits & mood |

---

### Task 1: Logical day

**Files:**
- Modify: `types/entry.ts:66-91` (date helpers)
- Modify: `store/entries.ts:269-333` (`getEntryStats` streak start), `store/entries.ts:499-506` (`getEntriesForReflection` range start)
- Modify: `app/(tabs)/guide.tsx:32` (UTC bug)
- Test: `__tests__/types/entry.test.ts` (modify), `__tests__/types/logicalDate.dst.test.ts` (create)

**Interfaces:**
- Produces: `DEFAULT_DAY_ROLLOVER_HOUR = 4`, `DAY_ROLLOVER_OPTIONS = [0,1,2,3,4,5,6] as const`, `getLogicalDateString(now: Date, rolloverHour: number): string`, `setDayRolloverHour(hour: number): void` (ignores anything not an integer 0–6), `getDayRolloverHour(): number`, `getTodayDateString(now?: Date): string` (= logical date at the current rollover), `formatRolloverLabel(hour: number): string`.

- [ ] **Step 1: Write the failing tests** in `__tests__/types/entry.test.ts` (replace the old "returns correct current date" case, which assumed midnight):

```ts
describe('logical day', () => {
  afterEach(() => setDayRolloverHour(DEFAULT_DAY_ROLLOVER_HOUR));

  it('returns the previous day before the rollover hour', () => {
    expect(getLogicalDateString(new Date(2026, 10, 18, 2, 30), 4)).toBe('2026-11-17');
  });
  it('returns the same day at and after the rollover hour', () => {
    expect(getLogicalDateString(new Date(2026, 10, 18, 4, 0), 4)).toBe('2026-11-18');
    expect(getLogicalDateString(new Date(2026, 10, 18, 23, 59), 4)).toBe('2026-11-18');
  });
  it('rollover 0 is the calendar date', () => {
    expect(getLogicalDateString(new Date(2026, 10, 18, 0, 5), 0)).toBe('2026-11-18');
  });
  it('crosses month and year boundaries', () => {
    expect(getLogicalDateString(new Date(2027, 0, 1, 3, 0), 4)).toBe('2026-12-31');
  });
  it('getTodayDateString uses the configured rollover', () => {
    setDayRolloverHour(6);
    expect(getTodayDateString(new Date(2026, 10, 18, 5, 0))).toBe('2026-11-17');
  });
  it('ignores invalid rollover values', () => {
    setDayRolloverHour(7); setDayRolloverHour(-1); setDayRolloverHour(2.5);
    expect(getDayRolloverHour()).toBe(4);
  });
  it('formats rollover labels', () => {
    expect(formatRolloverLabel(0)).toBe('midnight');
    expect(formatRolloverLabel(4)).toBe('4am');
  });
});
```

And `__tests__/types/logicalDate.dst.test.ts` (Node honours runtime `TZ` changes):

```ts
const originalTz = process.env.TZ;
beforeAll(() => { process.env.TZ = 'America/New_York'; });
afterAll(() => { process.env.TZ = originalTz; });

it('spring-forward night stays on the previous logical day until 4am', () => {
  expect(getLogicalDateString(new Date(2026, 2, 8, 3, 30), 4)).toBe('2026-03-07');
  expect(getLogicalDateString(new Date(2026, 2, 8, 4, 30), 4)).toBe('2026-03-08');
});
it('fall-back night stays on the previous logical day', () => {
  expect(getLogicalDateString(new Date(2026, 10, 1, 1, 30), 4)).toBe('2026-10-31');
  expect(getLogicalDateString(new Date(2026, 10, 1, 3, 59), 4)).toBe('2026-10-31');
});
```

- [ ] **Step 2: Run to verify they fail**
Run: `npx jest __tests__/types/entry.test.ts __tests__/types/logicalDate.dst.test.ts`
Expected: FAIL — `getLogicalDateString is not a function` (and friends).

- [ ] **Step 3: Implement in `types/entry.ts`.** Subtract hours in local time with `setHours(getHours() - rolloverHour)` on a copy (not millisecond arithmetic), then `formatDateString`. Rollover state is a module-level `let` initialised to the default. `getTodayDateString(now = new Date())` delegates to `getLogicalDateString(now, getDayRolloverHour())`.

- [ ] **Step 4: Fix callers that build "today" themselves.**
  - `getEntryStats`: start the streak walk from `parseDateString(getTodayDateString())` instead of `new Date()`.
  - `getEntriesForReflection`: range start = `parseDateString(getTodayDateString())` minus `days`.
  - `guide.tsx:32`: `const today = getTodayDateString();`.
  (Today screen, `saveEntry`, drafts and `Calendar` already call `getTodayDateString()` and need no change.)

- [ ] **Step 5: Run to verify they pass**
Run: `npx jest __tests__/types && npx tsc --noEmit -p .`
Expected: PASS, no type errors.

- [ ] **Step 6: Commit** — `feat(journal): logical day with 4am rollover; fix UTC "today" in Insights`

---

### Task 2: Phase 1 schema

**Files:**
- Create: `supabase/migrations/20261117000200_phase1_checkin.sql`
- Modify: `supabase/schema.sql` (append before `ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;`), `types/supabase.ts` (add `user_settings`, `habits`, `habit_logs`, `checkins` Row/Insert/Update; remove unused `mood_type` enum)

**Interfaces:**
- Produces: tables below; `delete_my_account()` now also deletes them.

- [ ] **Step 1: Write the migration** (Phase 1 creates only the `user_settings` columns it uses; later phases `ALTER` in theirs):

```sql
CREATE TABLE public.user_settings (
  user_id           TEXT PRIMARY KEY DEFAULT (auth.uid())::text,
  day_rollover_hour SMALLINT NOT NULL DEFAULT 4 CHECK (day_rollover_hour BETWEEN 0 AND 6),
  trackers          JSONB NOT NULL DEFAULT '{"habits":true,"mood":true}',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.habits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL DEFAULT (auth.uid())::text,
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  position    SMALLINT NOT NULL CHECK (position BETWEEN 0 AND 2),
  link        TEXT CHECK (link IN ('workout', 'sleep')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX habits_active_slot ON public.habits (user_id, position) WHERE archived_at IS NULL;
CREATE TABLE public.habit_logs (
  habit_id   UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL DEFAULT (auth.uid())::text,
  date       DATE NOT NULL,
  done       BOOLEAN NOT NULL,
  source     TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'workout', 'health')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (habit_id, date)
);
CREATE TABLE public.checkins (
  user_id    TEXT NOT NULL DEFAULT (auth.uid())::text,
  date       DATE NOT NULL,
  mood       SMALLINT CHECK (mood BETWEEN 1 AND 5),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins      ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_settings_owner ON public.user_settings FOR ALL
  USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY habits_owner ON public.habits FOR ALL
  USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY checkins_owner ON public.checkins FOR ALL
  USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY habit_logs_owner ON public.habit_logs FOR ALL
  USING ((auth.uid())::text = user_id)
  WITH CHECK ((auth.uid())::text = user_id AND EXISTS (
    SELECT 1 FROM public.habits h WHERE h.id = habit_id AND h.user_id = (auth.uid())::text));
```

Then `CREATE OR REPLACE FUNCTION public.delete_my_account()` — the current body from `20261117000000_launch_safety.sql` plus, **before** the `profiles` delete:
`DELETE FROM public.habit_logs WHERE user_id = v_me; DELETE FROM public.habits WHERE user_id = v_me; DELETE FROM public.checkins WHERE user_id = v_me; DELETE FROM public.user_settings WHERE user_id = v_me;` (keep `SECURITY DEFINER SET search_path = public`, re-run the existing REVOKE/GRANT for it).

- [ ] **Step 2: Ask the owner to approve applying it**, then apply (Supabase MCP `apply_migration` name `phase1_checkin`, or `npx supabase migrations apply --remote`).

- [ ] **Step 3: Verify with a rolled-back SQL test** (run via MCP `execute_sql` / SQL editor; the final `RAISE` rolls everything back). Expected error text: `RESULT: own ok | other user sees 0 | foreign habit log rejected | 4th active habit rejected | deleted 0 left`.

```sql
DO $$
DECLARE a TEXT := '00000000-0000-0000-0000-0000000000a1'; b TEXT := '00000000-0000-0000-0000-0000000000b1';
  h UUID; n INT; r1 TEXT; r2 TEXT; r3 TEXT; r4 TEXT; r5 TEXT;
BEGIN
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  INSERT INTO public.user_settings DEFAULT VALUES;
  INSERT INTO public.habits (name, position) VALUES ('One', 0) RETURNING id INTO h;
  INSERT INTO public.habits (name, position) VALUES ('Two', 1), ('Three', 2);
  INSERT INTO public.habit_logs (habit_id, date, done) VALUES (h, '2026-11-17', true);
  INSERT INTO public.checkins (date, mood) VALUES ('2026-11-17', 4);
  r1 := 'own ok';
  BEGIN INSERT INTO public.habits (name, position) VALUES ('Four', 0); r4 := '4th ALLOWED (BAD)';
  EXCEPTION WHEN unique_violation THEN r4 := '4th active habit rejected'; END;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  SELECT (SELECT count(*) FROM public.habits) + (SELECT count(*) FROM public.habit_logs)
       + (SELECT count(*) FROM public.checkins) + (SELECT count(*) FROM public.user_settings) INTO n;
  r2 := 'other user sees ' || n;
  BEGIN INSERT INTO public.habit_logs (habit_id, date, done) VALUES (h, '2026-11-18', true); r3 := 'foreign log ALLOWED (BAD)';
  EXCEPTION WHEN insufficient_privilege THEN r3 := 'foreign habit log rejected'; END;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  PERFORM public.delete_my_account();
  SELECT (SELECT count(*) FROM public.habits WHERE user_id = a) + (SELECT count(*) FROM public.checkins WHERE user_id = a)
       + (SELECT count(*) FROM public.user_settings WHERE user_id = a) INTO n;
  r5 := 'deleted ' || n || ' left';
  RAISE EXCEPTION 'RESULT: % | % | % | % | %', r1, r2, r3, r4, r5;
END $$;
```
(`delete_my_account()`'s final `DELETE FROM auth.users` matches no row for these fake ids, which is fine.)

- [ ] **Step 4: Run security advisors** (MCP `get_advisors` security). Expected: no new ERROR/WARN beyond the known intentional ones.

- [ ] **Step 5: Commit** — `feat(db): phase 1 tables for settings, habits, habit logs, mood`

---

### Task 3: Settings store

**Files:**
- Create: `types/tracking.ts` (settings part), `store/settings.ts`
- Modify: `app/index.tsx` (boot), `app/(tabs)/settings.tsx` (`confirmSignOut`), `store/profile.ts` (`deleteAccount`)
- Test: `__tests__/types/tracking.test.ts` (create), `__tests__/store/settings.test.ts` (create; `jest.mock('@/config/supabase', () => ({ supabase: {} }))` — only cache paths are tested)

**Interfaces:**
- Consumes: `setDayRolloverHour`, `DEFAULT_DAY_ROLLOVER_HOUR` (Task 1).
- Produces:
  - `interface TrackerSettings { habits: boolean; mood: boolean }`, `interface UserSettings { dayRolloverHour: number; trackers: TrackerSettings }`, `DEFAULT_SETTINGS: UserSettings` (4, both true), `interface DbUserSettings { user_id: string; day_rollover_hour: number; trackers: unknown; updated_at: string }`, `mapToUserSettings(row: DbUserSettings | null | undefined): UserSettings` — fills any missing/invalid field from defaults.
  - `store/settings.ts`: `hydrateSettingsFromCache(): Promise<UserSettings>`, `loadSettings(): Promise<UserSettings>`, `getCachedSettings(): UserSettings`, `updateSettings(patch: Partial<UserSettings>): Promise<UserSettings>`, `resetSettingsCache(): Promise<void>`. Cache key `@threesentences/user_settings`. Every function that changes settings calls `setDayRolloverHour`.

- [ ] **Step 1: Write failing tests**
  - `tracking.test.ts`: `mapToUserSettings(null)` equals `DEFAULT_SETTINGS`; a row with `day_rollover_hour: 9` and `trackers: "garbage"` maps to rollover 4 and default trackers; a valid row `{ day_rollover_hour: 2, trackers: { habits: false, mood: true } }` maps through.
  - `settings.test.ts`:
    - `hydrates from cache` — AsyncStorage holds `{"dayRolloverHour":6,"trackers":{"habits":true,"mood":false}}` → result has rollover 6, and `getDayRolloverHour()` is 6.
    - `falls back to defaults on corrupt cache` — cache `"{not json"` → `DEFAULT_SETTINGS`, rollover 4.
    - `reset clears cache and rollover` — after hydrate(6), `resetSettingsCache()` → `getCachedSettings()` equals defaults, `getDayRolloverHour()` is 4, `AsyncStorage.removeItem` called with the key.

- [ ] **Step 2: Run to verify they fail** — `npx jest __tests__/types/tracking.test.ts __tests__/store/settings.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement.**
  - `loadSettings`: `getSession()` guard; `from('user_settings').select('*').maybeSingle()`; if no row, `upsert({ user_id: session.user.id }, { onConflict: 'user_id' }).select().single()` to create defaults; map, cache, apply. On any error, log and return `getCachedSettings()`.
  - `updateSettings`: merge into cached, apply + cache immediately, upsert `{ user_id, day_rollover_hour, trackers, updated_at: now }`; on error restore the previous value and throw `Error('Could not save your settings. Please try again.')`.

- [ ] **Step 4: Wire it.**
  - `app/index.tsx` `checkOnboarding`: `await hydrateSettingsFromCache()` first; when `isSignedIn && userId`, `await loadSettings()` before the onboarding checks.
  - `settings.tsx` `confirmSignOut`: `await resetSettingsCache()` after `signOut()`.
  - `store/profile.ts` `deleteAccount`: `await resetSettingsCache()` after `AsyncStorage.clear()`.

- [ ] **Step 5: Run to verify they pass** — `npx jest __tests__/types __tests__/store/settings.test.ts && npx tsc --noEmit -p .` → PASS.

- [ ] **Step 6: Commit** — `feat(settings): private user_settings with cached day rollover`

---

### Task 4: Habits & mood data layer

**Files:**
- Modify: `types/tracking.ts` (habit + mood part)
- Create: `store/habits.ts`, `store/checkins.ts`
- Test: `__tests__/types/tracking.test.ts`

**Interfaces:**
- Produces (`types/tracking.ts`):
  - `type HabitPosition = 0 | 1 | 2`; `interface Habit { id: string; name: string; position: HabitPosition; createdAt: string }`; `interface DbHabit { id: string; user_id: string; name: string; position: number; link: string | null; created_at: string; archived_at: string | null }`; `mapToHabit(row: DbHabit): Habit`.
  - `MAX_ACTIVE_HABITS = 3`, `HABIT_NAME_MAX = 40`, `HABIT_SUGGESTIONS` (Global Constraints list, in that order).
  - `validateHabitName(raw: string): { ok: true; name: string } | { ok: false; error: string }` — trims; empty → `"Give it a name."`; longer than 40 → `"Keep it to 40 characters."`.
  - `nextFreeHabitPosition(active: { position: HabitPosition }[]): HabitPosition | null` — lowest free slot.
  - `suggestHabits(interests: string[], activeNames: string[]): string[]` — removes suggestions already active (case-insensitive); if `interests` includes `'sleep-optimization'`, *In bed by 1am* and *No phone in bed* come first; if it includes any interest whose `group` is `'fitness'` in the interest list in `types/profile.ts`, *Moved 20 min* comes first among the rest.
  - `type MoodValue = 1 | 2 | 3 | 4 | 5`; `MOOD_LABELS: Record<MoodValue, string>` (rough…great); `isMoodValue(n: unknown): n is MoodValue`.
  - `type HabitAnswers = Record<string, boolean>` (habitId → done; missing key = unanswered).
  - `THREE_HABITS_ERROR = 'You already have three habits.'`
- Produces (stores):
  - `store/habits.ts`: `getActiveHabits(): Promise<Habit[]>`, `addHabit(rawName: string): Promise<Habit>` (validates; throws `THREE_HABITS_ERROR` when no slot or on Postgres `23505`), `archiveHabit(id: string): Promise<void>`, `getHabitAnswers(date: string): Promise<HabitAnswers>`, `setHabitAnswer(habitId: string, date: string, done: boolean | null): Promise<void>` (`null` deletes the row).
  - `store/checkins.ts`: `getMood(date: string): Promise<MoodValue | null>`, `setMood(date: string, mood: MoodValue | null): Promise<void>` (upsert on `user_id,date`).
  - Reads return `[]` / `{}` / `null` on error (logged); writes `getSession()`-guard and throw a readable `Error` on failure.

- [ ] **Step 1: Write failing tests** in `tracking.test.ts`:
  - `validateHabitName('   ')` → `{ ok: false, error: 'Give it a name.' }`; `'  No alcohol  '` → `{ ok: true, name: 'No alcohol' }`; 41 chars → `'Keep it to 40 characters.'`; exactly 40 → ok.
  - `nextFreeHabitPosition([])` → 0; `[{position:0},{position:2}]` → 1; `nextFreeHabitPosition returns null when full` (`[0,1,2]`).
  - `suggestHabits(['sleep-optimization'], ['no alcohol'])` starts with `'In bed by 1am', 'No phone in bed'` and excludes `'No alcohol'`.
  - `isMoodValue(3)` true; `isMoodValue(0)`, `isMoodValue(6)`, `isMoodValue('3')` false; `MOOD_LABELS[1] === 'rough'`, `MOOD_LABELS[5] === 'great'`.
  - `mapToHabit` maps `created_at` → `createdAt` and keeps `position`.
- [ ] **Step 2: Add the store error-mapping test** `maps 23505 to the three-habit message` in `__tests__/store/habits.test.ts`: mock `@/config/supabase` so `auth.getSession` resolves a session, the active-habits select resolves `[]`, and the insert resolves `{ error: { code: '23505' } }`; expect `addHabit('Read')` to reject with `THREE_HABITS_ERROR`.
- [ ] **Step 3: Run to verify they fail** — `npx jest __tests__/types/tracking.test.ts __tests__/store/habits.test.ts` → FAIL.
- [ ] **Step 4: Implement** the helpers and both stores (use `maybeSingle()` for `getMood`; `getHabitAnswers` selects `habit_id, done` for the date).
- [ ] **Step 5: Run to verify they pass** — same command + `npx tsc --noEmit -p .` → PASS.
- [ ] **Step 6: Commit** — `feat(journal): habits and mood data layer`

---

### Task 5: Today check-in

**Files:**
- Create: `hooks/useCheckIn.ts`, `components/MoodPicker.tsx`, `components/HabitCheckList.tsx`, `components/HabitSetupSheet.tsx`
- Modify: `app/(tabs)/index.tsx` (both the writing state, lines ~272-320, and the done state, lines ~232-269)

**Interfaces:**
- Consumes: Task 3 `getCachedSettings`; Task 4 stores and types; `getTodayDateString`, `getDayRolloverHour`, `formatRolloverLabel` (Task 1); existing `BottomSheet`, `ConfirmationModal`, `Input`, `useToast`.
- Produces:
  - `useCheckIn(date: string): { trackers: TrackerSettings; habits: Habit[]; answers: HabitAnswers; mood: MoodValue | null; isLoading: boolean; answerHabit(habitId: string, done: boolean | null): void; chooseMood(mood: MoodValue | null): void; addHabit(name: string): Promise<string | null>; removeHabit(id: string): Promise<void>; reload(): Promise<void> }` — `answerHabit`/`chooseMood` update state immediately, call the store, and on failure restore the previous value and `showToast('error', "Couldn't save — check your connection.")`. `addHabit` resolves to an error message or `null`.
  - `MoodPicker({ value, onChange }: { value: MoodValue | null; onChange: (m: MoodValue | null) => void })` — five chips in label order; tapping the selected chip clears; `accessibilityRole="radio"`, `accessibilityState={{ selected }}`.
  - `HabitCheckList({ habits, answers, onAnswer, onEdit }: { habits: Habit[]; answers: HabitAnswers; onAnswer: (habitId: string, done: boolean | null) => void; onEdit: () => void })` — eyebrow "YOUR THREE" (tappable → `onEdit`); per habit a ✓ and a — button (each ≥ 44pt); tapping the active one clears. No habits → one line *"Choose up to three things to check in on"* → `onEdit`.
  - `HabitSetupSheet({ visible, onClose, habits, suggestions, onAdd, onRemove }: { visible: boolean; onClose: () => void; habits: Habit[]; suggestions: string[]; onAdd: (name: string) => Promise<string | null>; onRemove: (id: string) => void })` — active list with Remove (confirm: *"Remove "{name}"? Its past check-ins stay in your history."*); text input + Add (shows returned error inline); suggestion chips; input and chips hidden when 3 are active.

- [ ] **Step 1: Build the four files** to the interfaces above (theme tokens; unselected chips `surface` + `textSecondary`, selected `textBright` fill; never red).
- [ ] **Step 2: Wire Today.** `const today = getTodayDateString()`; call `checkIn.reload()` inside the existing `loadData`. Render order in **both** states: sentences (input + counter, or `EntryCard`) → `MoodPicker` (if `trackers.mood`) under eyebrow *"HOW WAS TODAY"* → `HabitCheckList` (if `trackers.habits`) → Submit (writing state only). The writing state becomes a `ScrollView` (`keyboardShouldPersistTaps="handled"`) with the input at a `minHeight` of 160 instead of `flex: 1`. Suggestions passed to the sheet: `suggestHabits(profile?.interests ?? [], habits.map(h => h.name))`, where `profile` comes from the existing `getProfile(userId)` (`store/profile.ts`), loaded once in `loadData` (Today doesn't load the profile today).
- [ ] **Step 3: Copy.** Done state: `` `Locks at ${formatRolloverLabel(getDayRolloverHour())} · edit until then` ``; pass `ConfirmationModal` `message={`You can refine your three sentences until ${label}. After that, they stand as written.`}`.
- [ ] **Step 4: Type-check and test** — `npx tsc --noEmit -p . && npx jest` → no new failures (the 13 pre-existing stale failures may remain).
- [ ] **Step 5: Verify in the iOS simulator** (`LANG=en_US.UTF-8 npx expo run:ios`), on a test account:
  1. No habits → the "Choose up to three…" line opens the sheet; add *In bed by 1am* from a suggestion and *Read* by typing; a 4th add is impossible (input hidden).
  2. Tap ✓ / — / tap again to clear; pick and clear a mood; pull to refresh and kill/reopen the app — answers persist (also check rows in `habit_logs` / `checkins`).
  3. **Airplane mode:** tap a habit → chip reverts and the toast shows; back online → tap works.
  4. **Late night:** set the simulator clock to 02:30 (or set Day ends at 6am in Task 6 and test at 05:00) → header shows the previous date and answers save to that date.
  5. Turn Mood and Habits off (Task 6) → Today looks exactly like before Phase 1.
  6. Reduce Motion on → no animation on chip changes.
- [ ] **Step 6: Commit** — `feat(journal): nightly check-in with mood and three habits on Today`

---

### Task 6: Settings → Trackers and Day ends at

**Files:**
- Modify: `app/(tabs)/settings.tsx` (new "Trackers" section between Preferences and Your Data), `app/(tabs)/guide.tsx:172`, `app/(onboarding)/index.tsx:77,263`, `components/ConfirmationModal.tsx:27`

**Interfaces:**
- Consumes: `getCachedSettings`, `updateSettings` (Task 3); `useCheckIn` + `HabitSetupSheet` (Task 5); `DAY_ROLLOVER_OPTIONS`, `formatRolloverLabel` (Task 1).

- [ ] **Step 1: Trackers section** with rows: *Habits* (switch), *Mood* (switch), *Edit habits* (only when Habits is on; opens `HabitSetupSheet` driven by `useCheckIn(getTodayDateString())`, suggestions built the same way as Today from the profile Settings already loads — widen its `userProfile` state to keep `interests`), *Day ends at* (subtitle = current label; opens a `BottomSheet` listing the 7 options with a check on the current one). Switch and rollover changes call `updateSettings`; on success toast *"Your day now ends at {label}."* for the rollover; on failure toast the thrown message and leave the control unchanged.
- [ ] **Step 2: Copy that says "midnight"** → `guide.tsx:172`: *"Three sentences, locked when your day ends. No deletions. Your words stand as written, capturing how you felt in the moment."*; onboarding line 77: *"When your day ends, your entry locks for good. Refine it until then — after that, your words stand as written."*; onboarding line 263: *"Entries lock for good when your day ends"*; `ConfirmationModal` default message: *"You can refine your three sentences until your day ends. After that, they stand as written."*
- [ ] **Step 3: Type-check** — `npx tsc --noEmit -p .` → clean.
- [ ] **Step 4: Verify in the simulator:** change Day ends at to 6am → Today's lock line reads "Locks at 6am"; sign out and sign in as a second test account → its own default (4am) applies, not 6am; toggles hide/show the Today sections immediately on return to Today.
- [ ] **Step 5: Commit** — `feat(settings): trackers switches and day-ends-at setting`

---

### Task 7: Export and privacy policy

**Files:**
- Create: `utils/exportFormat.ts`
- Modify: `store/entries.ts:530-560` (`exportEntries`), `landing/app/privacy/page.tsx`
- Test: `__tests__/utils/exportFormat.test.ts`

**Interfaces:**
- Consumes: `Entry` (types/entry.ts), `Habit`, `HabitAnswers`, `MoodValue`, `MOOD_LABELS` (Task 4).
- Produces: `interface DayTracking { mood: MoodValue | null; answers: HabitAnswers }`; `buildJsonExport(entries: Entry[], habits: Habit[], days: Record<string, DayTracking>): string` → pretty JSON object `{ entries, habits, days }`; `buildTxtExport(entries: Entry[], habits: Habit[], days: Record<string, DayTracking>): string`.
- Store side: add `getAllHabits(): Promise<Habit[]>` (including archived) to `store/habits.ts` and `getAllTracking(): Promise<Record<string, DayTracking>>` (all `habit_logs` + `checkins` for the user) to `store/checkins.ts`.

- [ ] **Step 1: Write failing tests:**
  - TXT: an entry on `2026-11-17` with mood 4 and answers `{ h1: true, h2: false }` for habits *In bed by 1am* (h1) and *No alcohol* (h2) renders
    ```
    --- 2026-11-17 ---
    <content>
    Mood: good · In bed by 1am ✓ · No alcohol —
    ```
    A day with no mood and no answers renders no tracking line. Unanswered habits are omitted from the line.
  - JSON: parsed result has keys `entries`, `habits`, `days`, and `days['2026-11-17'].mood === 4`.
- [ ] **Step 2: Run to verify they fail** — `npx jest __tests__/utils/exportFormat.test.ts` → FAIL.
- [ ] **Step 3: Implement** the builders; switch `exportEntries` `json`/`txt` cases to them (CSV unchanged).
- [ ] **Step 4: Privacy policy:** in "What we collect" → *Your content*, add "daily mood and habit check-ins"; in "Who can see your entries", say mood and habits are private to you like entries.
- [ ] **Step 5: Run everything** — `npx jest && npx tsc --noEmit -p . && (cd landing && npx next build)` → no new test failures, clean types, landing builds.
- [ ] **Step 6: Commit** — `feat(journal): export includes mood and habits; privacy policy update`

---

### Task 8 (GATED — do not start until the owner confirms spec §17 decision 1): Low-mood support card

**Files:**
- Create: `components/LowMoodCard.tsx`
- Modify: `store/checkins.ts`, `types/tracking.ts`, `app/(tabs)/index.tsx`
- Test: `__tests__/types/tracking.test.ts`

**Interfaces (assuming the owner confirms the spec's proposal; adjust to their answer):**
- `getRecentMoods(limit: number): Promise<{ date: string; mood: MoodValue }[]>` (most recent first, rows with a mood only).
- `shouldShowLowMoodSupport(recent: { date: string; mood: MoodValue }[], lastShownAt: string | null, now: Date): boolean` — true when the 3 most recent logged moods are all `1` (*rough*) and `lastShownAt` is null or ≥ 7 days before `now`.
- `LowMoodCard({ onDismiss }: { onDismiss: () => void })` — calm heading *"It's been a heavy few days."*, the `CRISIS_RESOURCES` list from `services/aiReflection.ts`, a Dismiss button; dismissal stores now in AsyncStorage `@threesentences/low_mood_shown_at`. Inline card on Today under the check-in; never a modal.

- [ ] **Step 1: Failing tests** for `shouldShowLowMoodSupport`: three 1s & never shown → true; `[1,1,2]` → false; only two logged → false; three 1s but shown 3 days ago → false; shown 8 days ago → true.
- [ ] **Step 2: Run → FAIL. Step 3: Implement. Step 4: Run → PASS + `tsc`.**
- [ ] **Step 5: Simulator check** — set mood *rough* on three test days (rows can be inserted for the test account) → card shows once; dismiss → hidden for 7 days.
- [ ] **Step 6: Commit** — `feat(journal): gentle support card after three rough days`
