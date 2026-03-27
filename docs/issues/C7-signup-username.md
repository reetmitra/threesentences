# C7: Signup Username Lost + Onboarding Flow Order

## Current State

### Username is captured but correctly passed to Clerk
Looking at `app/(auth)/signup.tsx:56-62`:
```ts
await signUp.create({
    emailAddress: email,
    password,
    username,                              // username IS passed to Clerk
    firstName: name.split(' ')[0],
    lastName: name.split(' ').slice(1).join(' ') || undefined,
});
```

The username IS passed to `signUp.create()`. However, the issue is that the **Supabase profile** may not receive the username. After signup verification succeeds (line 89-95):

```ts
if (signUpAttempt.status === 'complete') {
    await setActive({ session: signUpAttempt.createdSessionId });
    router.push({
        pathname: '/(auth)/interests',
        params: { name },                  // only name is passed, not username
    });
}
```

The `username` is not passed as a route param. The profile creation happens elsewhere and may not pull the username from Clerk.

### Onboarding flow order issue
After email verification, the flow goes:
1. `signup.tsx` → pushes to `/(auth)/interests` (with only `name` param)
2. After interests → presumably goes to `/(auth)/profile-setup`
3. `app/index.tsx:86-87`: If profile incomplete, redirects to `/(auth)/interests`

The profile needs to be created with the username before interests are set, because `saveInterests()` calls `updateProfile()` which requires an existing profile.

### Root redirect issue
`app/index.tsx:86-87`:
```ts
if (needsProfileSetup) {
    return <Redirect href="/(auth)/interests" />;
}
```
Should redirect to profile-setup, not interests, if profile doesn't exist yet.

## Target State

1. Username and name are passed through the entire signup → profile creation flow
2. Profile is created with the correct username from Clerk (or from signup params)
3. Flow order: signup → email verify → profile-setup (name/username) → interests → main app

## Files to Modify

| File | Change |
|------|--------|
| `app/(auth)/signup.tsx` | Pass both `name` and `username` as route params after verification |
| `app/(auth)/interests.tsx` | Ensure it receives and forwards username, or reorder to come after profile-setup |
| `app/index.tsx` | Fix redirect: incomplete profile → `/(auth)/profile-setup` |

## Step-by-Step Implementation

### Step 1: Pass username through signup verification

In `app/(auth)/signup.tsx`, update the post-verification redirect (line 92-95):

```ts
router.push({
    pathname: '/(auth)/interests',
    params: { name, username },  // add username
});
```

### Step 2: Check if profile-setup.tsx exists and what it does

Read `app/(auth)/profile-setup.tsx`. If it handles name/username entry, the flow should be:
- signup → verify → profile-setup → interests → main app

If profile-setup doesn't exist, the profile must be created during the interests step or in `_layout.tsx`.

### Step 3: Ensure profile is created with Clerk username

The profile creation should pull the username from either:
- Route params passed from signup
- Clerk user object (`user.username`) — since we passed `username` to `signUp.create()`

In whatever screen creates the Supabase profile (likely `_layout.tsx` or a profile sync function), ensure:
```ts
const clerkUsername = user.username;  // from useUser()
await createProfile(userId, name);
// Then set username if not set:
if (clerkUsername) {
    await setUsername(userId, clerkUsername);
}
```

### Step 4: Fix index.tsx redirect

In `app/index.tsx:86-87`, change:
```ts
if (needsProfileSetup) {
    return <Redirect href="/(auth)/interests" />;
}
```
To:
```ts
if (needsProfileSetup) {
    return <Redirect href="/(auth)/profile-setup" />;
}
```

This ensures returning users who never completed profile setup get sent to the right screen.

### Step 5: Handle OAuth (Apple Sign In) username gap

`handleAppleSignIn` (line 111-132) routes to `/` after SSO. Apple/Google users won't have a username set in Clerk. The `index.tsx` redirect logic should catch this via `needsProfileSetup` and send them to profile-setup where they pick a username.

Verify that `isProfileComplete()` returns `false` when username is the default/empty value from `createDefaultProfile()`.

## Testing

1. **Email signup flow**: Sign up with name + username + email → verify email → confirm username appears in Clerk dashboard → confirm Supabase profile has correct username
2. **Apple SSO flow**: Sign in with Apple → should redirect to profile-setup → set username → set interests → reach main app
3. **Returning incomplete user**: User who signed up but didn't finish profile → app launch → should go to profile-setup, not interests
4. **Username persistence**: After full signup flow, check both Clerk user object and Supabase profiles table for matching username
