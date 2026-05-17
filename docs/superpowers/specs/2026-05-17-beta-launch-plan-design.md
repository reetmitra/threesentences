# Beta Launch Plan — Three Sentences

**Date:** 2026-05-17  
**Internal Beta Target:** 2026-05-21  
**Public Beta Target:** 2026-05-23  
**Scope:** Core journaling + AI reflection flow

---

## Overview

All 317 unit tests currently pass. The pre-launch window (May 17–20) is a focused 4-day sprint to resolve all 10 documented known issues and TypeScript errors before friends receive the internal beta. The May 21–23 window is reserved exclusively for hotfixes surfaced during internal testing, not for known bugs.

---

## Phase 1: Pre-Launch Fixes (May 17–20)

Fixes are ordered by blast radius — items that affect every user (auth, encryption, signup) come before items that affect specific flows.

### 1. AES-256-GCM Encryption (C1/C2) — Critical Security
**File:** `utils/encryption.ts`  
Replace the current XOR "encryption" with real AES-256-GCM. Encryption keys must be stored in `expo-secure-store`, not hardcoded or in AsyncStorage. All existing encrypted entries must be migrated on first launch after the update. Tests in `__tests__/utils/encryption.test.ts` must continue to pass and should be extended to cover the new implementation.

### 2. Real AI Reflections (M1/M2) — Core Feature
**Files:** `services/aiReflection.ts`, `store/reflections.ts`  
Wire AI reflection calls to the live API (currently returning mock responses). Sync generated reflections to Supabase so they persist across sessions. The existing mock-based tests in `__tests__/services/aiReflection.test.ts` should be updated to match the new interface.

### 3. `.single()` → `.maybeSingle()` Audit (H3) — Crash Risk
**Files:** All Supabase query sites across `store/`  
Any `.single()` call that can legitimately return 0 rows (e.g. fetching a profile for a brand-new user) throws a `PGRST116` error and crashes. Audit all stores and replace with `.maybeSingle()` where appropriate. New users hitting empty-data states are the primary risk vector.

### 4. App TypeScript Errors — Build Integrity
**Files:** `app/(tabs)/reflect.tsx`, `app/(tabs)/settings.tsx`  
- `reflect.tsx:106` — function called with 1 arg, expects 2
- `settings.tsx:317` — `emailAddresses` does not exist on `AuthUser` (likely a Clerk → Supabase auth migration leftover)
- `settings.tsx:339` — invalid `style` prop on a component that doesn't accept it

### 5. Schema ↔ Type Mismatch (C3/C4) — Silent Runtime Bugs
**Files:** `types/supabase.ts`, `store/entries.ts`  
The `entries` table schema and the app's TypeScript types are out of sync. Mismatched field names cause silent runtime failures when reading/writing entries. Regenerate types from Supabase or manually align them.

### 6. Streak Timezone Bug (C5/C6) — Bad First Impression
**File:** Streak calculation logic (identified in `C5-C6-streak-timezone.md`)  
Streak resets at UTC midnight instead of the user's local midnight. For users in non-UTC timezones this causes the streak to reset at the wrong time, creating a confusing first experience. Fix to use device local time.

### 7. Friend Suggestion Query Broken (H1)
**File:** `store/friends.ts:588-592`  
Query syntax is broken — fix so it doesn't cause unhandled errors even in non-social beta flows.

### 8. Username Race Condition (H2)
**File:** `store/profile.ts:218-232`  
Two users can claim the same username simultaneously. Add a DB-level unique constraint check or optimistic locking before the write.

### 9. Signup Username Flow (C7)
**Files:** `app/(auth)/signup.tsx`, onboarding flow  
Username captured at signup is not correctly persisted through the onboarding flow. Every beta user hits signup first — this must work cleanly.

### 10. Group Message RLS Policy (C8)
**File:** Supabase RLS policies  
Messages SELECT policy gap allows users to read messages from groups they're not members of. Fix the RLS policy.

### 11. Medium Fixes (M3–M6)
**Source:** `docs/issues/M3-M6-medium-fixes.md`  
Profile setup redirect order, and miscellaneous UX issues. Apply all fixes documented in that issue file.

### 12. Landing Page TypeScript Errors
**Directory:** `landing/`  
Multiple missing section components (`HeroSection`, `ProblemSection`, etc.) and a Button casing conflict (`button.tsx` vs `Button.tsx`). These are likely from a recent refactor. Restore or recreate missing components and resolve the casing conflict.

---

## Phase 2: Internal Beta (May 21)

Distribute build to internal testers (friends). Focus test areas:
- Signup → onboarding → first journal entry flow
- AI reflection generation and display
- Streak tracking across timezone
- Profile and settings screens

Monitor for: auth failures, crashes on empty data states, AI reflection errors, streak resets.

---

## Phase 3: Public Beta (May 23)

Apply hotfixes for any issues surfaced during internal testing. No new features. Open to selective public access once internal testers confirm the core flow is stable.

---

## Success Criteria

- All 317 existing tests pass (plus new tests for encryption and AI reflections)
- Zero TypeScript errors in the app (landing page errors resolved separately)
- All 10 documented known issues closed
- Internal testers can complete signup → entry → AI reflection without hitting any crash or broken flow
