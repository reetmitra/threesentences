# M3-M6: Medium Severity Fixes

## M3: Profile Setup Flow Redirect Order

### Current State
`app/index.tsx:86-87`:
```ts
if (needsProfileSetup) {
    return <Redirect href="/(auth)/interests" />;
}
```

Sends users with incomplete profiles to interests selection. But profile-setup (name/username) should come first.

Also, after signup email verification (`app/(auth)/signup.tsx:92-95`), the flow goes directly to `/(auth)/interests` with only `name` as a param.

### Fix

**In `app/index.tsx`**: Change the redirect target:
```ts
if (needsProfileSetup) {
    return <Redirect href="/(auth)/profile-setup" />;
}
```

**In `app/(auth)/signup.tsx`**: After verification, route to profile-setup first:
```ts
router.push({
    pathname: '/(auth)/profile-setup',
    params: { name, username },
});
```

Then profile-setup should route to interests, and interests should route to the main app.

### Files
- `app/index.tsx` — line 87
- `app/(auth)/signup.tsx` — line 93

---

## M4: Haptics Preference Cache Never Refreshed

### Current State
`utils/haptics.ts:10`:
```ts
let cachedEnabled: boolean | null = null;
```

Set once on first call to `isEnabled()`, never invalidated. Changing the haptics setting in-app requires a restart.

### Fix

Invalidate cache when preferences change. Two options:

**Option A (simple)**: Call `refreshHapticsPreference()` from the settings screen after toggling.

In whatever screen/component handles the haptics toggle:
```ts
import { refreshHapticsPreference } from '@/utils/haptics';

// After saving preference:
await savePreferences({ hapticsEnabled: newValue });
await refreshHapticsPreference();  // invalidate cache
```

**Option B (reactive)**: Make the cache TTL-based — check every N seconds. Overkill for this use case.

Go with **Option A**. The function already exists, it just needs to be called.

### Files
- Whatever settings screen handles haptics toggle — add `refreshHapticsPreference()` call after save

---

## M5: Stale Supabase Auth Client After Logout

### Current State
`config/supabase.ts:20-21`:
```ts
let currentToken: string | null = null;
let cachedAuthClient: SupabaseClient | null = null;
```

`setSupabaseToken(null)` clears both (line 40-43). But this depends on the caller (layout/auth provider) calling `setSupabaseToken(null)` on logout.

### Potential Issue
If Clerk's `signOut()` fires but the token refresh interval (in `_layout.tsx`) continues running, it could set a stale token back. Or if `signOut` happens but `setSupabaseToken(null)` is never called.

### Fix

**In `app/_layout.tsx`** (or wherever the token refresh interval lives):

1. Ensure the interval is cleared on signout:
```ts
useEffect(() => {
    if (!isSignedIn) {
        setSupabaseToken(null);
        // Clear any running interval
        return;
    }

    // Set up token refresh interval
    const interval = setInterval(async () => {
        const token = await getToken({ template: 'supabase' });
        setSupabaseToken(token);
    }, 50000);

    // Initial token set
    getToken({ template: 'supabase' }).then(setSupabaseToken);

    return () => clearInterval(interval);
}, [isSignedIn]);
```

2. The key fix: when `isSignedIn` changes to `false`, the effect cleanup runs (clears interval) and the new effect body calls `setSupabaseToken(null)`.

### Files
- `app/_layout.tsx` — token refresh effect

---

## M6: Token Refresh Window Too Tight

### Current State
Token refreshed every 50 seconds. Clerk tokens expire at ~60 seconds. If the app is backgrounded for >10 seconds between refreshes, the next Supabase call uses an expired token.

### Fix

**Option A**: Refresh more aggressively — every 30 seconds instead of 50.

```ts
const TOKEN_REFRESH_INTERVAL = 30000; // 30s, was 50s
```

This gives a 30-second window instead of 10.

**Option B**: Refresh token on-demand before each authenticated Supabase call. This is more robust but requires changing `getAuthenticatedSupabase()` to be async.

**Option C** (recommended): Combine both. Shorten interval to 30s AND add a wrapper that checks token age:

```ts
let lastTokenRefresh = 0;
const TOKEN_MAX_AGE = 45000; // 45s

export async function getAuthenticatedSupabase(): Promise<SupabaseClient> {
    const age = Date.now() - lastTokenRefresh;
    if (age > TOKEN_MAX_AGE && getTokenFn) {
        const token = await getTokenFn();
        setSupabaseToken(token);
        lastTokenRefresh = Date.now();
    }
    // ... existing logic
}
```

**Tradeoff**: Option C makes `getAuthenticatedSupabase` async, which requires updating all callers. For MVP, **Option A** (30s interval) is the simplest fix with meaningful improvement.

### Files
- `app/_layout.tsx` — change interval from 50000 to 30000
- `config/supabase.ts` — (only if going with Option C)

---

## Implementation Order

1. **M3** — one-line redirect change
2. **M4** — add one function call in settings
3. **M5** — ensure cleanup in useEffect
4. **M6** — change interval constant

All four are small, independent changes. Can be done in a single commit.
