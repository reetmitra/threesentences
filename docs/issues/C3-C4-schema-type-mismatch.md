# C3/C4: Database Schema ↔ App Type Mismatch

## Current State

### C3: `entries` table vs `types/supabase.ts`
- **DB** (`supabase/schema.sql:81-90`): Column is `encrypted_content TEXT` + `timezone TEXT`
- **App types** (`types/supabase.ts:113-120`): Defines `sentences: string[]` and `mood: 'great' | 'good' | ...`
- **Actual store usage** (`store/entries.ts:28-36`): Uses its own `DbEntry` interface with `encrypted_content` — correctly matches the DB
- **Impact**: The `types/supabase.ts` entries type is a lie. Any code importing `Tables<'entries'>` will get wrong types. The store works because it uses a local interface.

### C4: `mood` column doesn't exist
- **DB**: No `mood` column on `entries` table
- **App types** (`types/supabase.ts:118`): `mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible' | null`
- **Store**: Never reads or writes `mood`
- **Impact**: Mood feature is typed but nonfunctional

### C3 additional: `messages` type missing `group_id`
- **DB** (`schema.sql:67-79`): `messages` has `group_id UUID`, `receiver_id` is nullable
- **App types** (`types/supabase.ts:86-110`): `receiver_id: string` (not nullable), no `group_id` column
- **Impact**: Group messaging types are completely wrong

## Target State

`types/supabase.ts` matches the actual database schema exactly. The store's local `DbEntry` interface becomes unnecessary or is replaced by the generated type.

## Decision: Align types to match DB (not the other way around)

The DB schema is the source of truth. The store already works correctly against the real schema using local interfaces. The fix is to update `types/supabase.ts` to match reality.

If you want `mood` as a feature, add the column to the DB via migration. If not, remove it from types.

## Files to Modify

| File | Change |
|------|--------|
| `types/supabase.ts` | Fix entries, messages types to match DB |
| `supabase/schema.sql` | Add `mood` column if feature is desired |

## Step-by-Step Implementation

### Step 1: Fix `entries` type in `types/supabase.ts`

Replace the entries table types to match the actual DB:

```ts
entries: {
    Row: {
        id: string
        user_id: string
        date: string
        encrypted_content: string  // was: sentences: string[]
        timezone: string           // was: missing
        // mood removed — column doesn't exist
        created_at: string
        updated_at: string
    }
    Insert: {
        id?: string
        user_id: string
        date: string
        encrypted_content: string
        timezone?: string
        created_at?: string
        updated_at?: string
    }
    Update: {
        id?: string
        user_id?: string
        date?: string
        encrypted_content?: string
        timezone?: string
        created_at?: string
        updated_at?: string
    }
}
```

### Step 2: Fix `messages` type in `types/supabase.ts`

```ts
messages: {
    Row: {
        id: string
        sender_id: string
        receiver_id: string | null  // nullable for group messages
        group_id: string | null     // add this
        content: string
        is_read: boolean
        created_at: string
    }
    // ... same pattern for Insert and Update
}
```

### Step 3: Add `mood` column (if feature is wanted)

Run this migration in Supabase:

```sql
ALTER TABLE public.entries
ADD COLUMN mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible'));
```

Then add `mood` back to the types. If mood is NOT wanted for MVP, skip this and leave it out of types.

### Step 4: Remove `mood_type` enum from types

`types/supabase.ts:193` defines `mood_type` enum but no such enum exists in the DB. Remove it, or create it in DB if using mood.

### Step 5: Search for broken imports

Grep the codebase for any files importing `Tables<'entries'>` or `Tables<'messages'>` and verify they work with the corrected types. The stores use local interfaces so they should be unaffected.

```bash
grep -r "Tables<'entries'>" --include="*.ts" --include="*.tsx"
grep -r "Tables<'messages'>" --include="*.ts" --include="*.tsx"
```

### Step 6 (optional): Generate types automatically

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

This ensures types always match the live DB. Add to CI or pre-commit hook.

## Testing

1. Run `npx tsc --noEmit` — should have zero type errors related to entries/messages
2. Verify `store/entries.ts` still compiles (it uses local `DbEntry`, so should be fine)
3. Verify `store/chat.ts` still compiles
4. Test entry creation flow end-to-end (write entry → verify in Supabase → read back)
5. If mood column was added: verify it accepts valid values and rejects invalid ones via Supabase dashboard
