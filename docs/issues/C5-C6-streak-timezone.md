# C5/C6: Streak Calculation Timezone Bug

## Current State

### The bug
`store/entries.ts:303-310` — streak calculation:

```ts
const today = new Date();
const checkDate = new Date(today);
while (dates.has(checkDate.toISOString().split('T')[0])) {
  currentStreak++;
  checkDate.setDate(checkDate.getDate() - 1);
}
```

`.toISOString()` converts to UTC. A user in UTC-8 (PST) writing at 11 PM local time gets `toISOString()` returning the *next day* in UTC.

### The mismatch
- **Entry save** (`store/entries.ts:139`): Uses `getTodayDateString()` which uses `date.getFullYear()`, `date.getMonth()`, `date.getDate()` — these are **local** time
- **Streak check** (`store/entries.ts:307`): Uses `.toISOString().split('T')[0]` — this is **UTC** time
- **`getEntriesForReflection`** (`store/entries.ts:520`): Also uses `.toISOString().split('T')[0]` — UTC bug

Entries are saved under local date, but streak compares against UTC date. In any timezone west of UTC, these diverge after local noon.

### Existing helpers that already do it right
`types/entry.ts:71-84` has `getTodayDateString()` and `formatDateString()` that use local date components. These are correct.

## Target State

All date comparisons use local dates via `formatDateString()`. No `.toISOString().split('T')[0]` anywhere in the codebase.

## Files to Modify

| File | Change |
|------|--------|
| `store/entries.ts` | Fix streak calc + reflection date range to use local dates |

## Step-by-Step Implementation

### Step 1: Fix `getEntryStats` streak calculation

In `store/entries.ts`, replace lines 303-310:

**Before:**
```ts
const today = new Date();
const checkDate = new Date(today);
while (dates.has(checkDate.toISOString().split('T')[0])) {
```

**After:**
```ts
const today = new Date();
const checkDate = new Date(today);
while (dates.has(formatDateString(checkDate))) {
```

`formatDateString` (imported from `@/types/entry`) uses `getFullYear/getMonth/getDate` which are local-time methods. Already imported at the top of the file — confirm `formatDateString` is in the import list, add if missing.

### Step 2: Fix longest streak calculation

Lines 318-320 also create `Date` objects from date strings and compare with `getTime()`. This works because `new Date('2026-03-23')` is parsed as UTC midnight, and the diff calculation only cares about relative difference between consecutive dates (always exactly 86400000ms). So the longest streak calc is actually fine — no change needed.

### Step 3: Fix `getEntriesForReflection`

Lines 518-520:
```ts
const startDate = new Date();
startDate.setDate(startDate.getDate() - days);
const startDateStr = startDate.toISOString().split('T')[0];  // BUG: UTC
```

Replace with:
```ts
const startDate = new Date();
startDate.setDate(startDate.getDate() - days);
const startDateStr = formatDateString(startDate);  // FIX: local
```

### Step 4: Ensure `formatDateString` is imported

Check the imports at top of `store/entries.ts`. Currently imports:
```ts
import { Entry, Draft, getTodayDateString, getCurrentTimezone, generateId } from '@/types/entry';
```

Add `formatDateString`:
```ts
import { Entry, Draft, getTodayDateString, formatDateString, getCurrentTimezone, generateId } from '@/types/entry';
```

### Step 5: Audit for any other `.toISOString().split('T')[0]`

Search the entire codebase:
```bash
grep -rn "toISOString.*split.*T" --include="*.ts" --include="*.tsx"
```

Fix any other occurrences with `formatDateString()`.

## Edge Cases

- **User crosses timezone boundary mid-day**: Entry saved at 11 PM PST (2026-03-23 local), then user flies to EST and checks streak. `formatDateString(new Date())` returns 2026-03-24 EST. The entry was saved as 2026-03-23. Streak still works because we check consecutive days, and the entry date is stored as a string.
- **User changes device timezone**: Same principle — entry dates are stored as local dates at time of writing. Streak counts backward from current local "today". If "today" shifts, streak may gain/lose a day, which is acceptable.

## Testing

1. **Unit test**: Mock `Date` to return 11:30 PM PST (2026-03-24T07:30:00Z). Verify `formatDateString()` returns `2026-03-24`, not `2026-03-25`.
2. **Streak test**: Create entries for 2026-03-22, 2026-03-23, 2026-03-24. Set system time to 2026-03-24 11 PM PST. Verify `currentStreak === 3`.
3. **Reflection date range test**: Set time to 2026-03-24 11 PM PST, request 7-day reflection. Verify startDate is `2026-03-17`, not `2026-03-18`.
