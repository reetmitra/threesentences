# H2: Username Availability Race Condition

## Current State

`store/profile.ts:218-232`:
```ts
export async function setUsername(userId: string, username: string): Promise<UserProfile> {
    const validation = validateUsername(username);
    if (!validation.valid) throw new Error(validation.error);

    const available = await isUsernameAvailable(username);  // CHECK
    if (!available) throw new Error('This username is not available');

    return updateProfile(userId, { username });              // SET
}
```

Classic TOCTOU (time-of-check-time-of-use). Between `isUsernameAvailable()` and `updateProfile()`, another user can claim the username.

### DB has UNIQUE constraint
`supabase/schema.sql:28`: `username TEXT NOT NULL UNIQUE` — the DB will reject duplicates. But the current code doesn't handle the constraint violation error; it would surface as a generic "Failed to update profile" error.

## Target State

1. Keep `isUsernameAvailable()` as optimistic UX check (for real-time feedback while typing)
2. Handle UNIQUE constraint violation on actual save — this is the authoritative check
3. Return clear error message when constraint violation occurs

## Files to Modify

| File | Change |
|------|--------|
| `store/profile.ts` | Handle UNIQUE constraint error in `setUsername` and `updateProfile` |

## Step-by-Step Implementation

### Step 1: Identify the Supabase error for UNIQUE violations

Supabase/PostgreSQL returns error code `23505` for unique constraint violations. The error object looks like:
```ts
{
    code: '23505',
    message: 'duplicate key value violates unique constraint "profiles_username_key"',
    details: 'Key (username)=(taken_name) already exists.'
}
```

### Step 2: Update `setUsername` to handle constraint errors

```ts
export async function setUsername(
    userId: string,
    username: string
): Promise<UserProfile> {
    const validation = validateUsername(username);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Optimistic check for UX (still useful for real-time feedback)
    const available = await isUsernameAvailable(username);
    if (!available) {
        throw new Error('This username is not available');
    }

    try {
        return await updateProfile(userId, { username });
    } catch (error: any) {
        // Handle race condition: username was taken between check and set
        if (error.message?.includes('23505') || error.message?.includes('unique constraint')) {
            throw new Error('This username was just taken. Please choose another.');
        }
        throw error;
    }
}
```

### Step 3: Surface constraint errors from `updateProfile`

In `updateProfile` (line 167-178), the error from Supabase is caught and re-thrown as a generic message. Update to preserve the error code:

```ts
if (error) {
    console.error('Failed to update profile:', error.message, error.code, error.details);
    if (error.code === '23505') {
        throw new Error(`23505: ${error.message}`);  // preserve code for upstream handling
    }
    throw new Error(`Failed to update profile: ${error.message}`);
}
```

Or cleaner — throw a typed error:

```ts
if (error) {
    if (error.code === '23505') {
        throw new Error('This username is not available');
    }
    throw new Error(`Failed to update profile: ${error.message}`);
}
```

### Step 4: Keep `isUsernameAvailable` for UX

The function is still useful for instant feedback in the UI (e.g., debounced check while user types). Don't remove it. Just don't rely on it as the sole guard.

## Testing

1. **Normal case**: Set username that's available → succeeds
2. **Already taken**: Set username that exists → returns "not available" from optimistic check
3. **Race condition simulation**:
   - Call `isUsernameAvailable('testuser')` → returns true
   - Manually insert a profile with username `testuser` in Supabase
   - Call `updateProfile(userId, { username: 'testuser' })` → should throw clear error about username being taken
4. **Invalid username**: Set username that fails validation → returns validation error
