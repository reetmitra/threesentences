# H3: `.single()` → `.maybeSingle()` Audit

## Current State

The Supabase JS client `.single()` throws a `PGRST116` error when 0 rows are returned, and `PGRST118` when multiple rows are returned. `.maybeSingle()` returns `null` for 0 rows (no error) and still throws for multiple rows.

**Rule**: Use `.single()` only when you are certain exactly 1 row exists (e.g., after an INSERT...RETURNING). Use `.maybeSingle()` when 0 rows is a valid outcome.

## Every `.single()` call in the codebase

### `store/chat.ts`

| Line | Code | Verdict |
|------|------|---------|
| 121 | `.eq('user_id', userId).single()` | **CHANGE** → `.maybeSingle()`. User might not have a profile yet. Currently falls back gracefully (line 123-125) but the `.single()` throws before reaching that code. |
| 250 | `.insert({...}).select().single()` | **KEEP**. After INSERT, exactly 1 row is returned. |
| 344 | `.insert({...}).select().single()` | **KEEP**. After INSERT. |

### `store/friends.ts`

| Line | Code | Verdict |
|------|------|---------|
| 227 | `.or(and(...),and(...)).single()` | **CHANGE** → `.maybeSingle()`. Checking if friendship exists — 0 rows means no existing friendship, which is valid. |
| 248 | `.insert({...}).select().single()` | **KEEP**. After INSERT. |
| 299 | `.eq('id', requestId).single()` | **KEEP or CHANGE**. Fetching a specific request by ID — if it doesn't exist, we want an error. But `.single()` throws a Supabase error, not the "Friend request not found" error on line 302. **CHANGE** → `.maybeSingle()` so the `!request` check on line 301 works. |
| 353 | `.eq('id', requestId).single()` | **CHANGE** → `.maybeSingle()` for same reason. |
| 385 | `.eq('id', requestId).single()` | **CHANGE** → `.maybeSingle()` for same reason. |
| 415 | `.eq('id', friendshipId).single()` | **CHANGE** → `.maybeSingle()` for same reason. |
| 572 | `.eq('user_id', userId).single()` | **CHANGE** → `.maybeSingle()`. User might not have a profile (new user). |

### `store/profile.ts`

| Line | Code | Verdict |
|------|------|---------|
| 63 | `.eq('user_id', userId).single()` | **KEEP**. Already handles `PGRST116` explicitly on line 66. Works correctly. |
| 113 | `.insert(insertData).select().single()` | **KEEP**. After INSERT. |
| 172 | `.update(updateData).eq('user_id', userId).select().single()` | **KEEP**. After UPDATE, 1 row expected. |
| 205 | `.eq('username', username).maybeSingle()` | Already correct. |

### `store/entries.ts`

| Line | Code | Verdict |
|------|------|---------|
| 102 | `.eq('date', date).maybeSingle()` | Already correct. |
| 151 | `.eq('date', today).maybeSingle()` | Already correct. |
| 167 | `.update({...}).select().single()` | **KEEP**. After UPDATE. |
| 187 | `.insert({...}).select().single()` | **KEEP**. After INSERT. |

## Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `store/chat.ts` | 121 | `.single()` → `.maybeSingle()` |
| `store/friends.ts` | 227, 299, 353, 385, 415, 572 | `.single()` → `.maybeSingle()` |

## Step-by-Step Implementation

### Step 1: Fix `store/chat.ts` line 121

```ts
// Before
const { data: currentProfile } = await supabase
    .from('profiles')
    .select('user_id, name, username, profile_image')
    .eq('user_id', userId)
    .single();

// After
const { data: currentProfile } = await supabase
    .from('profiles')
    .select('user_id, name, username, profile_image')
    .eq('user_id', userId)
    .maybeSingle();
```

The fallback on line 123-125 already handles `null`.

### Step 2: Fix `store/friends.ts` line 227

```ts
// Before
.or(`and(user_id.eq.${fromUserId},friend_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_id.eq.${fromUserId})`)
.single();

// After
.or(`and(user_id.eq.${fromUserId},friend_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_id.eq.${fromUserId})`)
.maybeSingle();
```

### Step 3: Fix `store/friends.ts` lines 299, 353, 385, 415

All four follow the same pattern — fetch by ID, check if null, throw custom error:

```ts
// Before
const { data: request, error: fetchError } = await getAuthenticatedSupabase()
    .from('friends')
    .select('*')
    .eq('id', requestId)
    .single();

// After
const { data: request, error: fetchError } = await getAuthenticatedSupabase()
    .from('friends')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();
```

The `if (fetchError || !request)` check on the next line then works correctly instead of being preempted by the PGRST116 throw.

### Step 4: Fix `store/friends.ts` line 572

```ts
// Before
const { data: currentProfile } = await getAuthenticatedSupabase()
    .from('profiles')
    .select('interests')
    .eq('user_id', userId)
    .single();

// After
const { data: currentProfile } = await getAuthenticatedSupabase()
    .from('profiles')
    .select('interests')
    .eq('user_id', userId)
    .maybeSingle();
```

## Testing

1. **No profile exists**: Call `getConversations` for a new user with no profile → should return empty conversations (not crash)
2. **No existing friendship**: Call `sendFriendRequest` between two users with no prior friendship → should proceed to insert (not throw PGRST116)
3. **Invalid friendship ID**: Call `acceptFriendRequest` with non-existent ID → should throw "Friend request not found" (not PGRST116)
4. **No existing friend suggestions profile**: Call `getSuggestedFriends` for user without profile → should return empty array (not crash)
