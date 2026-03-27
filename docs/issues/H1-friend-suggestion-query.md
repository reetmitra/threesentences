# H1: Friend Suggestion Query Syntax Broken

## Current State

`store/friends.ts:588-592`:
```ts
const { data: profiles, error } = await getAuthenticatedSupabase()
    .from('profiles')
    .select('user_id, name, username, profile_image, interests')
    .not('user_id', 'in', `(${Array.from(excludeIds).join(',')})`)
    .limit(limit * 2);
```

### Why this breaks
The Supabase JS client `.not('column', 'in', value)` expects the value in a specific format. The parenthesized comma-separated string `(id1,id2,id3)` is the PostgREST filter syntax, and it actually **does** work with the Supabase JS client — this is valid PostgREST syntax.

**However**, there's a real bug: if any of the UUIDs contain special characters or if the set is empty, this breaks:
- Empty set: `.not('user_id', 'in', '()')` → PostgREST error
- Clerk user IDs (which are strings like `user_2abc...`) work fine with this syntax

### Actual confirmed issues in this function

1. **Empty excludeIds**: If the user has no friends, `excludeIds` contains only their own ID. This works. But if somehow it's empty, `()` syntax fails.
2. **No error handling for empty currentProfile**: Line 572 — if `currentProfile` is null (no profile yet), `userInterests` defaults to `[]` and all scores are 0. Suggestions work but aren't ranked.

## Target State

Use the correct, documented Supabase JS client syntax for `NOT IN` filtering. Handle edge cases.

## Files to Modify

| File | Change |
|------|--------|
| `store/friends.ts` | Fix `.not()` syntax, add edge case handling |

## Step-by-Step Implementation

### Step 1: Replace with proper Supabase filter syntax

The Supabase JS v2 docs confirm that for `not in`, you use the parenthesized string format. But a safer approach that avoids the empty-set edge case:

```ts
// Build the query
let query = getAuthenticatedSupabase()
    .from('profiles')
    .select('user_id, name, username, profile_image, interests')
    .limit(limit * 2);

// Only add the NOT IN filter if there are IDs to exclude
const excludeArray = Array.from(excludeIds);
if (excludeArray.length > 0) {
    query = query.not('user_id', 'in', `(${excludeArray.join(',')})`);
}

const { data: profiles, error } = await query;
```

### Step 2: Handle missing current profile

```ts
const { data: currentProfile } = await getAuthenticatedSupabase()
    .from('profiles')
    .select('interests')
    .eq('user_id', userId)
    .maybeSingle();  // was: .single() — use maybeSingle for safety

if (!currentProfile) return [];  // Can't suggest without knowing interests
```

### Step 3: Validate the fix works with Clerk user IDs

Clerk user IDs look like `user_2nF8x3kB...`. These don't contain commas or parentheses, so the string format is safe. No SQL injection risk because PostgREST parameterizes the filter values.

## Testing

1. **User with friends**: Call `getSuggestedFriends` → should return users NOT in friend list, sorted by shared interests
2. **User with no friends**: `excludeIds` = `{userId}` → should return all other users
3. **User with no profile**: Should return empty array, not crash
4. **User with no interests**: Should return users (unsorted, since all scores = 0)
5. **Verify Supabase query**: Check Supabase logs to confirm the query executes without error
