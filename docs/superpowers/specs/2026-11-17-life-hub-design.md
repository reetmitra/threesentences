# Three Sentences → Life Hub — Design Spec
**Date:** 2026-11-17
**Status:** Approved by owner 2026-11-17 (§17 decisions 1–3 still open; Phase 1 plan assumes the proposals and gates decision 1)
**Scope:** Nightly check-in (three habits, mood, 4am day rollover), Patterns tab (graphs + AI patterns), Sunday review, Apple Health sync, workout logger, food & calorie log.

---

## 1. Intent

The owner is the first user. In their words: they want to "get back on track" — sleep has drifted to 6:30–8am bedtimes, weekends are partying, drinking and smoking, and a job/relationship transition is coming. They want one place to **see** their life, **take control** of it, and get **advice on what to do and what not to do**. They like the app as it is and want to keep it simple.

So the app grows from "three sentences a day" into a small personal hub, without losing what makes it work: a calm, short, nightly ritual with no guilt mechanics.

**Success looks like:** within a month of use, the owner can open Patterns and see, on one screen, how sleep, habits, mood, training and food moved together, and the AI can point at one honest pattern ("the nights you went out, you missed your bedtime habit and wrote about feeling flat the next day") and suggest one small experiment.

## 2. Goals, non-goals, anti-goals

**Goals**
- A nightly check-in that takes about 60 seconds: three sentences, a mood tap, up to three habits.
- Log workouts and meals during the day, quickly, even with bad gym signal.
- Pull sleep, steps and Apple Watch workouts from Apple Health automatically.
- One Patterns screen that connects everything, with graphs and AI observations plus one suggested experiment.
- A weekly Sunday review in the app's own format (three sentences).
- Every tracker is optional. A user who only journals sees today's app.

**Non-goals (this spec)**
- Android Health Connect, Apple Watch app, widgets.
- Body weight / measurements tracking.
- Sharing trackers with The Circle (habits, workouts, food stay private).
- A conversational AI coach (chat). AI stays reflective, on request.
- Paid food databases.

**Anti-goals — failure even if it technically works**
- The nightly ritual takes longer than ~90 seconds or the three sentences get buried under trackers.
- Streak-breaking, shame, red Xs, "you failed" language. The app's promise is "grace without guilt"; missed days are empty, not failures.
- The AI lectures, moralizes, diagnoses, or gives medical advice (especially about alcohol, smoking, food or sleep).
- Calorie features that push restriction or praise under-eating.
- Health data leaving the device without the user knowing, or being used for anything but the features they turned on.
- AI or API costs that can run away.

## 3. Constraints

- **Stack (unchanged):** Expo SDK 54 / React Native 0.81 (new architecture), expo-router, Supabase (Postgres + auth + RLS + edge functions), `react-native-svg` (already installed — charts use it, no chart library). Native project is checked in (`ios/`), dev builds via `npx expo run:ios`, distribution via TestFlight.
- **Tab bar:** maximum 5 tabs (iOS shows "More" beyond that).
- **Repo conventions (CLAUDE.md):** theme tokens only, `StyleSheet.create`, reduced motion respected, 44pt touch targets, strict TypeScript, `maybeSingle()` for optional rows, every schema change updates `supabase/schema.sql` **and** `types/supabase.ts`, new tables need schema review, **all date logic needs review**.
- **Security pattern established 2026-11-17:** every new table has owner-only RLS; every RPC that acts for a user checks `auth.uid()`; anon has no EXECUTE; **every new user table must be added to `delete_my_account()`** and to Export.
- **AI cost pattern:** AI calls go through edge functions that verify the user (`auth.getUser()`), cap input size, and count against a per-user daily cap (`bump_ai_usage`).
- **App Store:** HealthKit apps get extra review (guideline 5.1.3: health data can't be used for ads, must be disclosed, purpose strings required). Health/fitness claims must not be medical (1.4.1). Privacy policy (`landing/app/privacy/page.tsx`) and App Store privacy labels must be updated in the same release as each new data type.
- **Web is secondary.** Apple Health and barcode scanning are iOS-only; their UI hides on web.

## 4. Approaches considered

| | Structure | Trade-off |
|---|---|---|
| **1. Check-in + Log (chosen)** | `Today · Log · Circle · Patterns · Settings`. Today = nightly ritual. Log = daytime logging (workouts, meals). Patterns = History + Insights + graphs + AI. | Two places to go, but each matches *when* the thing happens (gym, meals, bedtime). Keeps the ritual short. |
| 2. Today dashboard | Today becomes a scrolling stack of cards (entry, mood, habits, workout, food, sleep). | One place, but the three sentences get buried and the calm, minimal Today screen is lost. |
| 3. Separate Track tab | Journal untouched; all trackers in one Track tab; History folds into Today. | Least disruption, but journaling and tracking never meet day to day, so the "hub" never forms. |

**Chosen: 1**, picked by the owner on 2026-11-17. It matches how the day actually runs (log at the gym or at meals, reflect at night) and protects the ritual.

## 5. Information architecture

```
Tabs:  [ Today ]  [ Log ]  [ Circle ]  [ Patterns ]  [ Settings ]
          ritual    daytime   friends+DMs   history+graphs+AI
```

- **Today** — the nightly check-in (§7). Also shows this week's Sunday-review focus as a one-line banner.
- **Log** — workouts (§12) and food (§13). *My call:* the Log tab is hidden (`href: null`) when both Workouts and Food are switched off, so a journal-only user sees 4 tabs.
- **Circle** — unchanged.
- **Patterns** — replaces **History** and **Insights** (§9). The current History calendar and Insights cards (363 progress, "The 363 Way", AI reflection card) move here.
- **Settings** — adds a **Trackers** section (switches per module) and **Day ends at** (§6).

**Trackers defaults (my call):** Habits on, Mood on, Workouts off, Food off, Apple Health off. Food stays off until the user turns it on and reads the explainer (§13.6).

**Private settings live in their own table, never on `profiles`.** `profiles` is readable by every user (`profiles_select USING (true)`, needed for search and the Circle), so anything personal — rollover hour, tracker switches, food goal, calorie target — goes in an owner-only table, cached in AsyncStorage on sign-in so it's available synchronously:

```sql
CREATE TABLE public.user_settings (
  user_id           TEXT PRIMARY KEY DEFAULT (auth.uid())::text,
  day_rollover_hour SMALLINT NOT NULL DEFAULT 4 CHECK (day_rollover_hour BETWEEN 0 AND 6),
  trackers          JSONB NOT NULL DEFAULT '{"habits":true,"mood":true,"workouts":false,"food":false,"health":false}',
  units             TEXT NOT NULL DEFAULT 'kg' CHECK (units IN ('kg', 'lb')),
  food_goal         TEXT NOT NULL DEFAULT 'track' CHECK (food_goal IN ('track', 'maintain', 'lose', 'gain')),
  kcal_target       INTEGER,
  hide_food_numbers BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
Owner-only RLS; row created on first read (upsert); added to `delete_my_account()`. Device-only preferences that already live in AsyncStorage (haptics, reminder time) stay there.

**Migration of existing screens:** `app/(tabs)/history.tsx` and `app/(tabs)/guide.tsx` are merged into a new `app/(tabs)/patterns.tsx`; `reflect.tsx` stays a hidden route opened from Patterns. Onboarding slide copy that says "locks at midnight" is updated to the user's rollover time (§6).

## 6. Logical day ("Day ends at 4am")

**Why:** today an entry written at 2am counts toward the next calendar day. For a night owl, that splits one night into two days and breaks the ritual.

**Rule:** the user's *logical date* is the calendar date of `now − rolloverHours`, in the device's local timezone.
- Setting: **Day ends at** = 12:00am, 1am, 2am, 3am, 4am, 5am or 6am. **Default 4am (my call)** for new and existing users.
- Stored server-side so all devices agree: `user_settings.day_rollover_hour` (§5).
- One function replaces every use of `getTodayDateString()` for "which day am I writing/checking in for": `getLogicalDateString(now: Date, rolloverHour: number): string`. Known callers: `store/entries.ts` (`getTodayEntry`, `saveEntry`, draft date check, `getEntryStats` streak walk, `getEntriesForReflection` range start), `app/(tabs)/index.tsx`, `components/Calendar.tsx`, `app/(tabs)/history.tsx`, and `app/(tabs)/guide.tsx` — which today uses `new Date().toISOString().split('T')[0]`, a **UTC** date (an existing bug: in UTC+8 it shows yesterday until 8am). All new trackers use it too.
- Travel across timezones: dates are whatever the device's local logical date was when written; a gap or a double day after a flight is accepted, not corrected.
- DST-safe implementation: copy `now`, call `setHours(getHours() − rolloverHour)` in local time (not `now − hours*3600000`), then format.
- **Locking:** an entry, its mood and its habit answers become read-only when the logical day ends (e.g. 4am the next morning). Copy changes from "Locks at midnight" to "Locks at 4am".
- **Changing the setting:** takes effect immediately. Rows already saved keep their date; nothing is re-dated. If the change makes "today" jump back a day, the user just sees that day's (possibly already written) check-in.
- **Server enforcement:** today the lock is client-side only (`entries_update` RLS allows updating any own row). This spec keeps it client-side. Hardening it server-side is listed in §18.
- **Review:** CLAUDE.md requires review of new date logic. Unit tests are mandatory (§16), including DST spring-forward and fall-back nights and rollover 0.

## 7. Nightly check-in (Today)

```
┌───────────────────────────────────────────┐
│ TUESDAY, NOVEMBER 17            locks 4am │
│ Today                                     │
│ ┌───────────────────────────────────────┐ │
│ │ Three sentences. What happened?       │ │
│ │                                       │ │
│ └───────────────────────────────────────┘ │
│                 3 / 3 · ready             │
│                                           │
│ HOW WAS TODAY                             │
│ ( rough ) ( low ) ( okay ) ( good ) (great)│
│                                           │
│ YOUR THREE                                │
│ In bed by 1am            [ ✓ ]  [ — ]     │
│ No drinks                [ ✓ ]  [ — ]     │
│ Moved 20 min             [ ✓ ]  [ — ]  ⌁  │  ⌁ = auto from a logged workout
│                                           │
│ [              Submit                   ] │
│ Focus this week: one alcohol-free night   │
└───────────────────────────────────────────┘
```

- Order: sentences first (the core), then mood, then habits. Mood and habits save on tap (no submit needed); the existing Submit/confirm flow still governs the sentences.
- After submit, the screen shows the existing "Done." state plus a compact summary of mood and habits, still tappable until the day locks.
- Total target: ~60 seconds. No extra screens.
- If Habits and Mood are both switched off, Today looks exactly like it does now.

## 8. Habits ("Your three") and Mood

### 8.1 Habits
- Up to **3 active habits** (a brand constraint, not a technical one). Archiving one frees a slot; history is kept.
- **v1 answer type: done / not done** (✓ or —). Unanswered = empty, never "failed". *My call:* yes/no only in v1; count habits ("≤ 2 drinks") and time habits ("asleep by 1:00") are listed in §18.
- **Where habits are set up (my call):** not in onboarding (keeps signup short). With Habits on and no habits yet, Today's "Your three" area shows one line — "Choose up to three things to check in on" — opening a setup sheet. Editing later: tap the "Your three" header, or Settings → Trackers → Habits.
- Name: free text, 1–40 chars. The setup sheet offers suggestions, the user can type their own: *In bed by 1am · No alcohol · No smoking · Moved 20 min · Read 10 pages · 2L water · No phone in bed*. Suggestions lean on the user's onboarding interests (e.g. Sleep Optimization → bedtime habits).
- Editable until the logical day locks; no backfilling older days (same rule as entries).
- **Progress language:** "5 of 7 this week", "18 of 30". **No streak counters per habit** and no broken-streak messaging.
- **Auto-answers (later phases, always confirmable/undoable):** a logged workout ticks a habit the user has linked to "workout" (§12.6); Apple Health sleep start can *suggest* an answer for a bedtime habit (§11.5). Auto never marks a habit as missed.

### 8.2 Mood
- One tap, 5 points, word chips (no faces — matches the type-led aesthetic, *my call*): **rough · low · okay · good · great** → stored 1–5.
- Optional; can be changed until the day locks.
- **Low-mood support (business rule, needs owner decision — §17):** proposal — if mood is *rough* on 3 consecutive logged days, show the existing `CrisisResourcesCard` styling with a calm "It's been a heavy few days" note and support links, dismissible, at most once per 7 days. Never a modal, never blocks the app.

### 8.3 Data

```sql
CREATE TABLE public.habits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL DEFAULT (auth.uid())::text,
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  position    SMALLINT NOT NULL CHECK (position BETWEEN 0 AND 2),
  link        TEXT CHECK (link IN ('workout', 'sleep')),   -- optional auto-answer source
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);
-- At most 3 active habits, one per slot:
CREATE UNIQUE INDEX habits_active_slot ON public.habits (user_id, position) WHERE archived_at IS NULL;

CREATE TABLE public.habit_logs (
  habit_id   UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL DEFAULT (auth.uid())::text,
  date       DATE NOT NULL,                 -- logical date
  done       BOOLEAN NOT NULL,
  source     TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'workout', 'health')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (habit_id, date)
);

CREATE TABLE public.checkins (               -- one row per user per logical day; room for more daily scalars later
  user_id    TEXT NOT NULL DEFAULT (auth.uid())::text,
  date       DATE NOT NULL,
  mood       SMALLINT CHECK (mood BETWEEN 1 AND 5),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);
```
- RLS on all three: select/insert/update/delete only where `user_id = auth.uid()::text`. `habit_logs` insert also checks the habit belongs to the caller.
- Upserts on `(habit_id, date)` and `(user_id, date)`.
- Add all three to `delete_my_account()` and to Export (JSON includes them; TXT adds a "Habits / Mood" line per day).
- The unused `mood_type` enum in `types/supabase.ts` is removed (mood is a 1–5 smallint).

## 9. Patterns tab (replaces History + Insights)

```
┌───────────────────────────────────────────┐
│ Patterns                     [7][30][90]  │
│ ┌ calendar (existing) — dot = entry,     ┐│
│ │ ring = all habits done                 ││
│ └────────────────────────────────────────┘│
│ MOOD            ·  ·─·    ·─·─·  ·        │  dots per day, line where consecutive
│ SLEEP   ▁▃▅▂▁▆▇▃  avg 6h10 · asleep 4:40am │  (Apple Health on)
│ HABITS  In bed by 1am   ■□■■□□■   4/7      │
│         No drinks       ■■■□■■■   6/7      │
│         Moved 20 min    □■□■□■□   3/7      │
│ TRAINING 3 sessions · 12,400 kg volume     │  (Workouts on)
│ FOOD    avg 2,150 kcal · 118 g protein     │  (Food on)
│ ┌ AI PATTERNS ──────────────────────────┐ │
│ │ observations… · One thing to try →    │ │
│ └───────────────────────────────────────┘ │
│ 363 PROGRESS  41/363                      │
└───────────────────────────────────────────┘
```

- Range selector 7 / 30 / 90 days (same ranges as AI reflections).
- Each section appears only if its tracker is on and has data; otherwise one quiet line ("Turn on Workouts in Settings").
- Tapping a calendar day opens that day: entry, mood, habit answers, workouts, meals, sleep.
- **Charts:** hand-built with `react-native-svg` and theme tokens. No animated draw-ins when reduced motion is on. Every chart has an `accessibilityLabel` text summary ("Mood over 30 days: mostly okay, two rough days, last 5 days good").
- Habit squares: filled = done, outline = not done, empty space = unanswered (never red).
- "The 363 Way" / "Presence over perfection" cards move to the bottom under "About the practice".
- Data loading: one RPC per range (`get_patterns(p_from DATE, p_to DATE)`, security invoker, returns per-day rows joined across checkins / habit_logs / health_daily / workout and food daily totals) to avoid N queries; cached in AsyncStorage per range for instant re-open.

## 10. AI patterns (Patterns' AI card)

Extends the existing reflection (`generate-reflection` edge function, opt-in, 10/day cap).

**Input (only for trackers the user has on):** per logical day — the three sentences, mood (1–5), each habit name + done/not done, and later sleep hours + bedtime, workouts (type, duration, volume), calories/protein totals. Summaries only; no raw Health samples.

**Where the data comes from (contract change):** today the client sends `{ entries, timeRange }`. In v2 the client sends only `{ timeRange }` and the function reads entries and tracker rows itself with the caller's JWT (RLS applies, so it can only see that user's data). The client keeps running the existing keyword crisis check on its local entries *before* calling. Keep accepting the old body shape for one release so older app builds don't break.

**Stored result:** `reflections.content` stays plain text (observations + questions, so old rows still render); add `reflections.experiment JSONB NULL` for the suggestion.

**Output (same tone rules as today — observational, question-based, no diagnosis):**
1. 2–3 observations that connect trackers ("On the 3 days you logged a workout, your mood was *good* or *great*").
2. 1–2 reflective questions.
3. **One thing to try** — a single small, reversible experiment framed as an invitation, e.g. "Try one alcohol-free Friday this week and see how Saturday feels." With a **Make it a habit** button (fills a free slot, or asks which habit to replace).

**Guardrails (added to the system prompt and tested):**
- Never moralize about alcohol, smoking, food or sleep; never shame; no body-weight or appearance comments.
- Never give medical, dietary-clinical or addiction treatment advice; if entries suggest dependence, withdrawal, disordered eating or crisis, skip suggestions and show support resources (the existing client-side crisis check runs first and still short-circuits).
- Suggestions must be about behaviour the user already tracks or wrote about.
- Return structured JSON (`{ observations: string[], questions: string[], experiment: { text, habitName } | null }`) so the app can render the button; the function validates it and falls back to plain text.

**Privacy:** the AI opt-in sheet and privacy policy are updated to say which tracker summaries are included. A per-tracker "Include in AI" switch is listed in §18, not v1.
**Cost:** input stays small (90 days × ~1 line). Same 10/day cap; `max_tokens` ~800.
**Model:** the function currently uses `claude-haiku-4-5-20251001`; the builder should confirm the current recommended small model at build time.

## 11. Apple Health (sleep, steps, workouts)

### 11.1 Scope (v1)
- **Read:** sleep analysis (asleep stages + in-bed), step count, active energy, workouts.
- **Write (optional, Phase 6):** workouts logged in the app, so they count toward Apple's activity rings.
- iOS only. Switch in Settings → Trackers → Apple Health; turning it on triggers the HealthKit permission sheet.

### 11.2 Native setup
- Library: the builder picks between maintained React Native HealthKit bindings. **Criteria:** works with Expo SDK 54 + new architecture via prebuild; actively maintained; supports sleep stages, workouts and anchored queries. **Warning:** a past dependency failed because it required the NitroModules pod (see `react-native-quick-crypto` history); test the pod install early.
- Entitlement `com.apple.developer.healthkit`; Info.plist `NSHealthShareUsageDescription` ("Three Sentences reads your sleep, steps and workouts to show them next to your journal.") and, for writes, `NSHealthUpdateUsageDescription`. Set both in `app.json` (config plugin) **and** the checked-in `ios/` project.
- No background delivery in v1: sync on app open and on pull-to-refresh, using anchored queries since the last sync.

### 11.3 What is stored
Raw samples stay on the device. The app uploads **daily summaries** (needed for Patterns across devices and for AI):

```sql
CREATE TABLE public.health_daily (
  user_id        TEXT NOT NULL DEFAULT (auth.uid())::text,
  date           DATE NOT NULL,          -- logical/sleep date, see 11.4
  sleep_minutes  INTEGER,
  sleep_start    TIMESTAMPTZ,
  sleep_end      TIMESTAMPTZ,
  steps          INTEGER,
  active_kcal    INTEGER,
  synced_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);
```
Steps and active energy are summed per **logical day** (HealthKit statistics query anchored at the rollover hour), so 2am steps count toward the night they belong to. Sleep uses its own window (§11.4).
Imported workouts go into `workouts` (§12.4) with `source = 'healthkit'` and the HealthKit UUID in `external_id` for de-duplication. Owner-only RLS; added to `delete_my_account()` and Export. Turning Apple Health off offers "Also delete synced Health data".

### 11.4 Sleep → which day (date logic, needs review)
Sleep uses a **noon-to-noon window**: a sleep session that *starts* between 12:00pm on day D and 11:59am on day D+1 belongs to **the night of D**. Example: asleep 6:40am Wednesday → "Tuesday night". This is independent of the 4am rollover so late sleepers aren't split across days. Multiple sessions in a window are summed (naps included); `sleep_start` = earliest start, `sleep_end` = latest end. Unit tests required.

### 11.5 Bedtime habit suggestion
If a habit is linked to `sleep` and Health shows a sleep start, Today shows a suggestion on that habit ("Health: asleep 4:40am") with one-tap accept. Never auto-marks "not done". The user sets the target time when linking ("bed by 1:00am"); this is the one place a habit carries a time.

### 11.6 Compliance
- Privacy policy: new "Health data" section (what's read, that summaries are stored, never used for ads or sold, deletable).
- App Store privacy labels: add *Health & Fitness*.
- App Review notes: explain why HealthKit is used and that it's optional.

## 12. Workout logger (Log tab)

### 12.1 What it covers
- **Strength:** exercise → sets (reps × weight), optional RPE.
- **Cardio:** type, duration, distance.
- **Other:** duration + notes (yoga, sports, class).
- **Templates:** save any workout as a template; start a new workout from it (pre-filled with last time's numbers).
- **Rest timer:** in-app countdown between sets; optional local notification if the app is backgrounded.
- **Personal records:** best weight × reps per exercise and estimated 1RM (Epley: `w × (1 + reps/30)`), shown when beaten ("New best: Bench 80 kg × 6").
- **Units:** kg / lb preference in Settings (store everything in kg).

```
LOG ─ Workouts                    [ + Start ]
  Push day (template) · last: Thu
  ┌ Bench press        prev 75×8 ┐
  │ 1  [ 80 ] kg × [ 6 ]   ✓     │
  │ 2  [ 80 ] kg × [ 6 ]   ✓     │
  │ + set                rest 1:30│
  └──────────────────────────────┘
  + exercise        [ Finish ]
```

### 12.2 Exercise library
A built-in list of ~100 common exercises shipped as a static TypeScript file (`constants/exercises.ts`: key, name, category, equipment). No external API. Users can add custom exercises (stored server-side).

### 12.3 Offline first (gyms have bad signal)
The in-progress workout lives in AsyncStorage and is written to Supabase on **Finish** or when connectivity returns (existing `useNetworkStatus` hook). A finished-but-unsynced workout shows a quiet "Saved on this phone, syncing…" state. Writes use client-generated UUIDs so retries are idempotent.

### 12.4 Data
```sql
CREATE TABLE public.custom_exercises (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL DEFAULT (auth.uid())::text,
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  category   TEXT NOT NULL CHECK (category IN ('strength', 'cardio', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.workouts (
  id          UUID PRIMARY KEY,               -- client-generated for idempotent sync
  user_id     TEXT NOT NULL DEFAULT (auth.uid())::text,
  date        DATE NOT NULL,                  -- logical date of started_at
  started_at  TIMESTAMPTZ NOT NULL,
  ended_at    TIMESTAMPTZ,
  kind        TEXT NOT NULL CHECK (kind IN ('strength', 'cardio', 'other')),
  title       TEXT CHECK (char_length(title) <= 60),
  notes       TEXT CHECK (char_length(notes) <= 500),
  source      TEXT NOT NULL DEFAULT 'app' CHECK (source IN ('app', 'healthkit')),
  external_id TEXT,                           -- HealthKit UUID
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, external_id)
);

CREATE TABLE public.workout_sets (
  id           UUID PRIMARY KEY,              -- client-generated
  workout_id   UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL DEFAULT (auth.uid())::text,
  exercise_key TEXT NOT NULL,                 -- built-in key or custom_exercises.id
  set_index    SMALLINT NOT NULL,
  reps         SMALLINT,
  weight_kg    NUMERIC(6,2),
  duration_s   INTEGER,
  distance_m   INTEGER,
  rpe          SMALLINT CHECK (rpe BETWEEN 1 AND 10)
);

CREATE TABLE public.workout_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL DEFAULT (auth.uid())::text,
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  exercises  JSONB NOT NULL,                  -- [{ exercise_key, sets, reps, weight_kg }]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
Owner-only RLS on all four; all added to `delete_my_account()` and Export. Health-imported workouts are read-only in the app (edit in Apple Health).

### 12.5 Patterns
Sessions per week, weekly volume (Σ reps × weight), PR list, last 8 weeks bar chart.

### 12.6 Habit link
A habit linked to `workout` is auto-ticked when any workout (app or Health) is logged that logical day, with source `workout` and an undo.

## 13. Food & calories (Log tab)

### 13.1 Logging methods
1. **Describe it (default):** type "chicken rice and an iced coffee" → new edge function `estimate-meal` asks Claude for items with kcal, protein, carbs, fat → the user sees an editable breakdown and confirms. Cap: **20 estimates per user per day** (`ai_usage` gets a `kind` column, or a second counter function — builder's call).
2. **Barcode:** scan with the camera (`expo-camera` barcode scanning) → Open Food Facts API (free, no key) → pick serving size → confirm. Show "Data: Open Food Facts" attribution. Open Food Facts is weak on fresh and restaurant food; fall back to Describe it.
3. **Quick add:** type a kcal number (macros optional).
4. **Recent & favourites:** one tap to re-log.

```
LOG ─ Food                       today 1,640 kcal
  Breakfast  Kaya toast + kopi        420  ›
  Lunch      Chicken rice              610  ›
  Snack      Protein bar (scan)        210  ›
  [ Describe a meal… ]  [ ▢ Scan ]  [ + kcal ]
```

### 13.2 Goals
- On first enable, choose: **Just track** (default) · Maintain · Lose slowly · Gain. "Just track" shows no target at all.
- A numeric daily target is optional and user-entered; the app never calculates or suggests one. Target floor is a business rule (§17).
- **Hide numbers** option: log meals by description only; calories still stored for Patterns but not shown on Log.

### 13.3 Data
```sql
CREATE TABLE public.food_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL DEFAULT (auth.uid())::text,
  date        DATE NOT NULL,                 -- logical date
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meal        TEXT NOT NULL CHECK (meal IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 200),
  kcal        INTEGER NOT NULL CHECK (kcal BETWEEN 0 AND 5000),
  protein_g   NUMERIC(5,1), carbs_g NUMERIC(5,1), fat_g NUMERIC(5,1),
  source      TEXT NOT NULL CHECK (source IN ('ai', 'barcode', 'manual', 'favourite')),
  barcode     TEXT
);

CREATE TABLE public.food_favourites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL DEFAULT (auth.uid())::text,
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 200),
  kcal        INTEGER NOT NULL, protein_g NUMERIC(5,1), carbs_g NUMERIC(5,1), fat_g NUMERIC(5,1),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Goal, target and "hide numbers" live in user_settings (§5) — never on public profiles.
```
Owner-only RLS; added to `delete_my_account()` and Export. Meal default = by time of day (builder's call on boundaries).

### 13.4 `estimate-meal` edge function
Same hardening as `generate-reflection`: `auth.getUser()`, input ≤ 200 chars, daily cap, JSON output validated (numbers clamped to sane ranges), "estimates, not exact" note in UI. Prompt forbids judgement ("healthy", "bad").

### 13.5 Camera permission
The camera purpose string set on 2026-11-17 ("…only when you choose to take a profile photo") must change to cover barcode scanning, in both `app.json` and `ios/ThreeSentences/Info.plist`.

### 13.6 Safety
- Off by default; enabling shows a short explainer: estimates are approximate; you can hide numbers; support resources for disordered eating (link in Settings → Food).
- No praise for low intake, no red over-target colours, no "remaining calories" countdown in Just track mode.
- AI patterns never comment on weight or appearance (§10).

## 14. Sunday review

- A Sunday-evening local notification (default 7pm, configurable day/time, can be off): "Your week in three sentences."
- Screen shows the week's stats (entries x/7, habits per habit x/7, average mood, average sleep, workouts, average kcal — only for trackers that are on), then **three one-sentence prompts**:
  1. *What went well?*
  2. *What got in the way?*
  3. *One focus for next week.*
- The focus is pinned as a one-line banner on Today for the following week.
- Optional **Summarize my week** button reuses `generate-reflection` with a 7-day range (counts toward the cap).
- Week = Monday–Sunday in logical dates. **Grace window (my call):** the review for a week can be written or edited from its Sunday until the following Saturday, so missing Sunday night doesn't lose it. The focus banner shows from when the review is saved until the next review is saved.

```sql
CREATE TABLE public.weekly_reviews (
  user_id    TEXT NOT NULL DEFAULT (auth.uid())::text,
  week_start DATE NOT NULL,                 -- Monday, logical date
  went_well  TEXT CHECK (char_length(went_well) <= 280),
  got_in_way TEXT CHECK (char_length(got_in_way) <= 280),
  focus      TEXT CHECK (char_length(focus) <= 140),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, week_start)
);
```
Owner-only RLS; added to `delete_my_account()` and Export.

## 15. Notifications

All local (`expo-notifications`, existing `services/notifications.ts`):
- **Nightly check-in** — replaces today's daily reminder; default 10pm.
- **Bedtime nudge** (optional, only with a sleep-linked habit): 30 min before the habit's target time. Copy is calm ("Winding down? Bed by 1 is the plan.").
- **Sunday review** — §14.
- **Rest timer** — §12.1, only while a workout is open.
No push server, no marketing notifications.

## 16. Cross-cutting

- **Schema:** one migration per phase in `supabase/migrations/`, mirrored into `supabase/schema.sql` and `types/supabase.ts`. Each migration also re-creates `delete_my_account()` with the new tables. Every new table: RLS on, owner-only policies, `user_id DEFAULT auth.uid()::text`, never readable via `profiles`. Applying a migration to the live project needs the owner's go-ahead at build time (CLAUDE.md: new tables need review).
- **Verification pattern:** for each migration, a rolled-back SQL test (as used 2026-11-17) proving another user can't read/write the rows and that `delete_my_account()` removes them.
- **Export:** JSON export includes every tracker table; TXT export adds per-day lines.
- **Offline:** read caches in AsyncStorage per screen; write queue for workouts (required) and food (nice to have).
- **Tests (pragmatic, per CLAUDE.md):** logical date (DST nights, rollovers 0–6), sleep noon-to-noon attribution, weekly aggregation, PR / 1RM calc, AI JSON validation and fallback, offline workout sync idempotency.
- **Accessibility & motion:** 44pt targets on all chips and set inputs; charts have text summaries; reduced motion = no chart animation, no rest-timer pulsing.
- **Web:** Apple Health and barcode hidden; everything else works in the 560px column.
- **Privacy policy & App Store labels:** updated in the same release as each tracker (habits/mood → "Other user content"; Health → "Health & Fitness"; food → "Health & Fitness").

## 17. Decisions for the owner (open)

1. **Low-mood support rule (§8.2):** show support resources after 3 consecutive *rough* days, at most once a week? Or a different trigger, or none?
2. **Calorie target floor (§13.2):** if a user types a daily target, should the app refuse very low targets (e.g. under 1,200 kcal) with a gentle note, or allow any number?
3. **Default "Day ends at":** 4am for everyone (my call), or keep midnight for existing users and 4am only for new ones?

Everything else marked *my call* above can be changed on review.

## 18. Later (explicitly out of this spec)

Count and time habit types beyond the sleep link · per-tracker "Include in AI" switches · server-side enforcement of the day lock · Android Health Connect · body weight · sharing a habit or workout with The Circle · Apple Watch app / widgets · paid food database · conversational AI coach.

## 19. Build order

Each phase ships on its own (TestFlight) and gets its own implementation plan.

| Phase | What | Depends on |
|---|---|---|
| 1 | `user_settings` + logical day (4am, fixes the UTC "today" bug) + Settings → Trackers + Habits + Mood + new Today check-in | — |
| 2 | Patterns tab (merge History + Insights; calendar, mood chart, habit grid; `get_patterns` RPC) | 1 |
| 3 | AI patterns v2 (habits + mood + entries, JSON output, "One thing to try" → habit) | 1, 2 |
| 4 | Sunday review + notifications rework | 1 |
| 5 | Apple Health read (sleep, steps, workouts; `health_daily`; sleep chart; bedtime suggestion) | 1, 2 |
| 6 | Workout logger (Log tab appears; templates, PRs, offline sync, habit link, optional Health write) | 1, 5 for Health de-dupe |
| 7 | Food & calories (describe / barcode / quick add; `estimate-meal`; goals; hide numbers) | 1 |
| 8 | AI patterns v3 (adds sleep, workouts, food summaries) | 3, 5, 6, 7 |

## 20. Left to the builder

Component breakdown and file layout · chart drawing details · exact copy (within the tone rules above) · HealthKit library choice (criteria in §11.2) · exercise seed list contents · meal-time boundaries · whether `ai_usage` gets a `kind` column or a second counter · caching keys and invalidation.
