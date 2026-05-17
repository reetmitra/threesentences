# Beta Launch Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all pre-beta known issues so the app is ready for internal beta on May 21 and public beta on May 23.

**Architecture:** Fixes are ordered by blast radius — crash prevention first, then auth/signup flow, then data layer (reflections schema + AI), then security (encryption), and finally the landing page. Each task is independent and commits separately.

**Tech Stack:** React Native (Expo SDK 54), Supabase (auth + DB + Edge Functions), TypeScript, Jest/jest-expo, react-native-quick-crypto (new), expo-secure-store (already installed)

---

## Pre-flight

Before starting, verify tests still pass:
```bash
cd /Users/reetmitra/Desktop/363/threesentences
npm test
# Expected: 317 passed, 317 total
```

---

## Task 1: H3 — Fix remaining `.single()` crash risks in `store/friends.ts`

**Files:**
- Modify: `store/friends.ts` (lines 328 and 520)

**Context:** `.single()` throws `PGRST116` when 0 rows returned. These two calls can legitimately return 0 rows and currently crash instead of returning null.

- [ ] **Step 1: Fix line 328 — friend profile fetch after accepting request**

Open `store/friends.ts`. Find the block around line 324–328:
```ts
  const { data: friendProfile } = await supabase
    .from('profiles')
    .select('user_id, name, username, profile_image, interests')
    .eq('user_id', (request as DbFriend).user_id)
    .single();
```
Change `.single()` to `.maybeSingle()`:
```ts
  const { data: friendProfile } = await supabase
    .from('profiles')
    .select('user_id, name, username, profile_image, interests')
    .eq('user_id', (request as DbFriend).user_id)
    .maybeSingle();
```

- [ ] **Step 2: Fix line 520 — friendship existence check**

Find the block around line 515–520:
```ts
    .or(
      `and(user_id.eq.${currentUserId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${currentUserId})`
    )
    .single();
```
Change `.single()` to `.maybeSingle()`:
```ts
    .or(
      `and(user_id.eq.${currentUserId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${currentUserId})`
    )
    .maybeSingle();
```

- [ ] **Step 3: Run tests**
```bash
npm test
# Expected: 317 passed, 317 total
```

- [ ] **Step 4: Commit**
```bash
git add store/friends.ts
git commit -m "fix: replace .single() with .maybeSingle() for nullable friend queries"
```

---

## Task 2: Fix App TypeScript errors

**Files:**
- Modify: `app/(tabs)/reflect.tsx` (line 106)
- Modify: `app/(tabs)/settings.tsx` (line 339)

### 2a: reflect.tsx — `saveReflection` missing `userId` argument

`saveReflection` requires `(userId: string, reflection: Reflection)` but line 106 only passes 1 argument. `userId` is already available from `useAuth()` at line 50.

- [ ] **Step 1: Fix the call**

In `app/(tabs)/reflect.tsx`, find line 106:
```ts
        await saveReflection(result.reflection);
```
Replace with:
```ts
        await saveReflection(userId!, result.reflection);
```

### 2b: settings.tsx — `SkeletonStatsCard` doesn't accept `style` prop

`SkeletonStatsCard` (defined in `components/ui/Skeleton.tsx:189`) takes no props. The call passes a `style` prop which fails type-check.

- [ ] **Step 2: Fix the call**

In `app/(tabs)/settings.tsx`, find line 339:
```tsx
          <SkeletonStatsCard style={{ marginBottom: spacing[5] }} />
```
Replace with a View wrapper:
```tsx
          <View style={{ marginBottom: spacing[5] }}>
            <SkeletonStatsCard />
          </View>
```

Ensure `View` is imported from `react-native` at the top of the file (it already is).

- [ ] **Step 3: Verify TypeScript errors are gone**
```bash
npx tsc --noEmit 2>&1 | grep -E "reflect\.tsx|settings\.tsx"
# Expected: no output (no errors)
```

- [ ] **Step 4: Run tests**
```bash
npm test
# Expected: 317 passed, 317 total
```

- [ ] **Step 5: Commit**
```bash
git add "app/(tabs)/reflect.tsx" "app/(tabs)/settings.tsx"
git commit -m "fix: correct saveReflection call signature and SkeletonStatsCard style prop"
```

---

## Task 3: C7 + M3 — Fix signup flow routing

**Files:**
- Modify: `app/index.tsx` (line 86)
- Modify: `app/(auth)/profile-setup.tsx` (useEffect block ~line 64–73)

**Context:** Two issues:
1. `index.tsx` redirects incomplete-profile users to `/(auth)/interests` — should be `/(auth)/profile-setup`
2. `profile-setup.tsx` only pre-fills username from route `params.name` (which may not be passed), ignoring `user.username` from Supabase user_metadata set during signup

- [ ] **Step 1: Fix index.tsx redirect**

In `app/index.tsx`, find line 86:
```tsx
    return <Redirect href="/(auth)/interests" />;
```
Replace with:
```tsx
    return <Redirect href="/(auth)/profile-setup" />;
```

- [ ] **Step 2: Pre-fill username from user metadata in profile-setup.tsx**

In `app/(auth)/profile-setup.tsx`, find the `useEffect` block (around line 64–74):
```ts
  useEffect(() => {
    // Animate form entrance
    formOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));

    // Generate username suggestion
    if (params.name) {
      const suggested = suggestUsername(params.name);
      setUsername(suggested);
      validateUsernameInput(suggested);
    }
  }, [formOpacity, params.name]);
```
Replace with:
```ts
  useEffect(() => {
    formOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));

    // Prefer username from signup metadata, fall back to suggestion from name
    if (user?.username) {
      setUsername(user.username);
      validateUsernameInput(user.username);
    } else if (params.name) {
      const suggested = suggestUsername(params.name);
      setUsername(suggested);
      validateUsernameInput(suggested);
    }
  }, [formOpacity, params.name, user]);
```

- [ ] **Step 3: Verify TypeScript**
```bash
npx tsc --noEmit 2>&1 | grep -E "index\.tsx|profile-setup\.tsx"
# Expected: no output
```

- [ ] **Step 4: Run tests**
```bash
npm test
# Expected: 317 passed, 317 total
```

- [ ] **Step 5: Commit**
```bash
git add app/index.tsx "app/(auth)/profile-setup.tsx"
git commit -m "fix: redirect incomplete profiles to profile-setup, pre-fill username from auth metadata"
```

---

## Task 4: M1/M2 — Wire AI reflections (schema migration + deploy edge function)

**Files:**
- Modify: `supabase/schema.sql` (reflections table definition)
- Modify: `types/supabase.ts` (reflections type)
- Deploy: `supabase/functions/generate-reflection/index.ts` (already written, needs deployment)

**Context:** The `generate-reflection` edge function and client-side service are already correctly implemented. Two blockers remain:
1. The `reflections` DB table is missing `time_range`, `entries_analyzed`, `has_crisis_indicators` columns — inserts from the store silently fail
2. The Supabase `types/supabase.ts` reflections type is out of sync
3. The edge function hasn't been deployed + `ANTHROPIC_API_KEY` hasn't been set

- [ ] **Step 1: Run the schema migration in Supabase**

Go to the Supabase dashboard SQL editor for your project, or use the CLI:
```bash
supabase db push
```

If using the dashboard directly, run this SQL:
```sql
ALTER TABLE public.reflections
  DROP COLUMN IF EXISTS entry_id,
  ADD COLUMN IF NOT EXISTS time_range INTEGER NOT NULL DEFAULT 7 CHECK (time_range IN (7, 30, 90)),
  ADD COLUMN IF NOT EXISTS entries_analyzed INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_crisis_indicators BOOLEAN DEFAULT FALSE;
```

Verify in the Supabase table editor that the `reflections` table now has these columns.

- [ ] **Step 2: Update schema.sql to match**

In `supabase/schema.sql`, find the reflections table definition (around line 92–98):
```sql
CREATE TABLE public.reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
Replace with:
```sql
CREATE TABLE public.reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  time_range INTEGER NOT NULL CHECK (time_range IN (7, 30, 90)),
  entries_analyzed INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  has_crisis_indicators BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- [ ] **Step 3: Update `types/supabase.ts` reflections type**

In `types/supabase.ts`, find the reflections type (around line 144–166):
```ts
            reflections: {
                Row: {
                    id: string
                    user_id: string
                    entry_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    entry_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    entry_id?: string
                    content?: string
                    created_at?: string
                }
            }
```
Replace with:
```ts
            reflections: {
                Row: {
                    id: string
                    user_id: string
                    time_range: 7 | 30 | 90
                    entries_analyzed: number
                    content: string
                    has_crisis_indicators: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    time_range: 7 | 30 | 90
                    entries_analyzed?: number
                    content: string
                    has_crisis_indicators?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    time_range?: 7 | 30 | 90
                    entries_analyzed?: number
                    content?: string
                    has_crisis_indicators?: boolean
                    created_at?: string
                }
            }
```

- [ ] **Step 4: Deploy the edge function**

```bash
npx supabase functions deploy generate-reflection --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual Supabase project ref (found in the dashboard URL or project settings).

- [ ] **Step 5: Set the ANTHROPIC_API_KEY secret**

```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE --project-ref YOUR_PROJECT_REF
```

- [ ] **Step 6: Verify edge function works**

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-reflection \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"entries":[{"date":"2026-05-17","content":"Had a good day today"}],"timeRange":7}'
```

Expected response: `{"content":"..."}` with a reflection paragraph (not an error).

- [ ] **Step 7: Verify TypeScript**
```bash
npx tsc --noEmit 2>&1 | grep -v "landing/"
# Expected: no app-level errors
```

- [ ] **Step 8: Run tests**
```bash
npm test
# Expected: 317 passed, 317 total
```

- [ ] **Step 9: Commit**
```bash
git add supabase/schema.sql types/supabase.ts
git commit -m "fix: update reflections schema and types for AI reflection columns, deploy edge function"
```

---

## Task 5: Fix Landing Page TypeScript Errors

**Files:**
- Modify: `tsconfig.json` (root)

**Context:** The root `tsconfig.json` has `@/*` → `./*` (resolving relative to project root). The `landing/` subdirectory has its own `tsconfig.json` with `@/*` → `./*` (resolving relative to `landing/`). When `tsc` runs from the root, it picks up `landing/` files, but resolves their `@/` imports against the project root instead of the `landing/` directory — causing all the "Cannot find module" errors. The fix is to exclude `landing/` and `video/` from the root tsconfig.

- [ ] **Step 1: Add exclude to root tsconfig.json**

Current `tsconfig.json`:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./*"
      ]
    }
  }
}
```

Replace with:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./*"
      ]
    }
  },
  "exclude": [
    "landing",
    "video",
    "node_modules"
  ]
}
```

- [ ] **Step 2: Verify no landing errors appear in root tsc**
```bash
npx tsc --noEmit 2>&1 | grep "landing/"
# Expected: no output
```

- [ ] **Step 3: Verify landing page still type-checks on its own**
```bash
cd landing && npx tsc --noEmit && cd ..
# Expected: exits 0 or only pre-existing errors within landing/
```

- [ ] **Step 4: Verify total app TS error count**
```bash
npx tsc --noEmit 2>&1 | grep "error TS"
# Expected: no output (0 errors)
```

- [ ] **Step 5: Run tests**
```bash
npm test
# Expected: 317 passed, 317 total
```

- [ ] **Step 6: Commit**
```bash
git add tsconfig.json
git commit -m "fix: exclude landing and video dirs from root tsconfig to resolve path alias conflicts"
```

---

## Task 6: C8 — Verify RLS policies are applied to live Supabase DB

**Context:** The `supabase/schema.sql` already contains correct group message RLS policies (messages_select and messages_update with group_members subquery). This task verifies the live DB matches. The policies in schema.sql are the reference — run the SQL if the live DB is behind.

- [ ] **Step 1: Check current live policies**

In Supabase dashboard → Authentication → Policies → `messages` table, confirm the SELECT policy includes:
```sql
auth.uid()::text IN (sender_id, receiver_id)
OR (
    group_id IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_members.group_id = messages.group_id
        AND group_members.user_id = auth.uid()::text
    )
)
```

If the live policy is the old one-liner (`auth.uid()::text IN (sender_id, receiver_id)` only), run this SQL in the dashboard:

```sql
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_update" ON public.messages;

CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
    auth.uid()::text IN (sender_id, receiver_id)
    OR (
        group_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = messages.group_id
            AND group_members.user_id = auth.uid()::text
        )
    )
);

CREATE POLICY "messages_update" ON public.messages FOR UPDATE USING (
    auth.uid()::text = receiver_id
    OR (
        group_id IS NOT NULL
        AND auth.uid()::text != sender_id
        AND EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = messages.group_id
            AND group_members.user_id = auth.uid()::text
        )
    )
);
```

- [ ] **Step 2: Confirm policies in dashboard**

After applying (or if already correct), confirm the policy definitions in the Supabase dashboard match the above.

---

## Task 7: C1/C2 — AES-256-GCM Encryption Overhaul

**Files:**
- Modify: `utils/encryption.ts` (full replacement)
- Modify: `package.json` (add react-native-quick-crypto)
- Modify: `app.json` (add config plugin)
- Modify: `__tests__/utils/encryption.test.ts` (update mocks + add new tests)

**Context:** Current implementation uses XOR cipher (not real encryption) and stores the key in AsyncStorage (unencrypted). Replace with AES-256-GCM via `react-native-quick-crypto` and store the key in `expo-secure-store` (already a dependency). Maintain backward-compatible v1 decryption so existing entries are not lost.

### Format convention:
- **v1 (current, legacy):** `<iv_hex>:<cipher_hex>:<checksum_8char>` — no version prefix, exactly 3 segments
- **v2 (new):** `v2:<iv_hex>:<cipher_hex+tag_hex>` — "v2" prefix, exactly 3 segments

- [ ] **Step 1: Install react-native-quick-crypto**
```bash
npx expo install react-native-quick-crypto
```

- [ ] **Step 2: Add config plugin to app.json**

In `app.json`, add `react-native-quick-crypto` to the plugins array. If no plugins array exists, add one:
```json
{
  "expo": {
    "plugins": [
      "react-native-quick-crypto"
    ]
  }
}
```

- [ ] **Step 3: Replace the encryption test file**

The existing tests check for AsyncStorage key storage and v1 format — both change. Replace the entire `__tests__/utils/encryption.test.ts` with:

```ts
/**
 * Tests for Encryption Utility (v2: AES-256-GCM)
 */

import {
  encryptContent,
  decryptContent,
  isEncrypted,
  hashContent,
} from '@/utils/encryption';
import * as SecureStore from 'expo-secure-store';

// Use Node's built-in crypto as a drop-in for react-native-quick-crypto in tests
jest.mock('react-native-quick-crypto', () => require('crypto'));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  WHEN_UNLOCKED: 'WHEN_UNLOCKED',
}));

describe('encryption', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).clearMockStorage?.();
    // Default: no key in SecureStore → will generate new one
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe('encryptContent', () => {
    it('encrypts plaintext successfully', async () => {
      const encrypted = await encryptContent('Hello, World!');
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe('Hello, World!');
    });

    it('produces v2 format: v2:<iv>:<payload>', async () => {
      const encrypted = await encryptContent('Test message');
      const parts = encrypted.split(':');
      expect(parts[0]).toBe('v2');
      expect(parts).toHaveLength(3);
      expect(parts[1]).toHaveLength(24); // 12-byte IV = 24 hex chars
      expect(parts[2].length).toBeGreaterThan(32); // ciphertext + 16-byte tag
    });

    it('generates different IVs for same plaintext', async () => {
      const a = await encryptContent('Same content');
      const b = await encryptContent('Same content');
      expect(a.split(':')[1]).not.toBe(b.split(':')[1]);
    });

    it('handles empty string', async () => {
      const encrypted = await encryptContent('');
      expect(encrypted).toBeDefined();
      expect(encrypted.startsWith('v2:')).toBe(true);
    });

    it('handles long content', async () => {
      const encrypted = await encryptContent('A'.repeat(10000));
      expect(encrypted).toBeDefined();
    });

    it('handles special characters', async () => {
      const encrypted = await encryptContent('!@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./');
      expect(encrypted).toBeDefined();
    });

    it('handles unicode characters', async () => {
      const encrypted = await encryptContent('你好世界 🌍 مرحبا');
      expect(encrypted).toBeDefined();
    });

    it('creates key in SecureStore on first use', async () => {
      await encryptContent('Test');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'threesentences_encryption_key',
        expect.any(String),
        expect.objectContaining({ keychainAccessible: 'WHEN_UNLOCKED' })
      );
    });

    it('reuses existing key from SecureStore', async () => {
      const existingKey = 'a'.repeat(64);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(existingKey);
      await encryptContent('First');
      await encryptContent('Second');
      // setItemAsync should NOT be called (key already exists)
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('migrates key from AsyncStorage to SecureStore', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const legacyKey = 'a'.repeat(64);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      AsyncStorage.getItem.mockResolvedValue(legacyKey);

      await encryptContent('test');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'threesentences_encryption_key',
        legacyKey,
        expect.objectContaining({ keychainAccessible: 'WHEN_UNLOCKED' })
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@threesentences/encryption_key');
    });
  });

  describe('decryptContent', () => {
    it('decrypts encrypted content correctly', async () => {
      const plaintext = 'Hello, World!';
      const encrypted = await encryptContent(plaintext);
      expect(await decryptContent(encrypted)).toBe(plaintext);
    });

    it('handles round-trip for various content types', async () => {
      const cases = [
        'Simple text',
        'Text with numbers 123',
        'Special chars: !@#$%',
        'Multi\nline\ntext',
        'Emoji: 🎉🔐',
        '',
      ];
      for (const text of cases) {
        expect(await decryptContent(await encryptContent(text))).toBe(text);
      }
    });

    it('throws on tampered ciphertext (GCM auth tag fails)', async () => {
      const encrypted = await encryptContent('original text');
      const parts = encrypted.split(':');
      const payload = parts[2];
      // Flip last two hex chars
      const tampered = payload.slice(0, -2) + (payload.slice(-2) === 'ff' ? '00' : 'ff');
      await expect(decryptContent(`v2:${parts[1]}:${tampered}`)).rejects.toThrow();
    });

    it('throws error for invalid format', async () => {
      await expect(decryptContent('invalid')).rejects.toThrow();
    });

    it('throws error for missing parts', async () => {
      await expect(decryptContent('only:two')).rejects.toThrow();
    });

    it('recognizes v1 format for legacy fallback path', () => {
      // v1 format: <24-char iv hex>:<cipher hex>:<8-char checksum>
      const v1Format = '123456789012345678901234:aabbcc:abcd1234';
      expect(isEncrypted(v1Format)).toBe(true);
    });
  });

  describe('isEncrypted', () => {
    it('returns true for v2 encrypted content', async () => {
      const encrypted = await encryptContent('Test');
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('returns true for valid v1 format', () => {
      expect(isEncrypted('123456789012345678901234:abcdef1234567890:12345678')).toBe(true);
    });

    it('returns false for plain text', () => {
      expect(isEncrypted('Just some plain text')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isEncrypted('')).toBe(false);
    });

    it('returns false for wrong number of parts', () => {
      expect(isEncrypted('one:two')).toBe(false);
      expect(isEncrypted('one:two:three:four')).toBe(false);
    });

    it('returns false for invalid IV length in v1', () => {
      expect(isEncrypted('abc:1234567890abcdef:12345678')).toBe(false);
    });

    it('returns false for invalid checksum length in v1', () => {
      expect(isEncrypted('123456789012345678901234:abcdef:123')).toBe(false);
    });

    it('returns false for non-hex characters', () => {
      expect(isEncrypted('ghij56789012345678901234:abcdef:12345678')).toBe(false);
    });
  });

  describe('hashContent', () => {
    it('returns a hash string', async () => {
      const hash = await hashContent('Test content');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('returns consistent hash for same content', async () => {
      expect(await hashContent('same')).toBe(await hashContent('same'));
    });

    it('returns different hash for different content', async () => {
      expect(await hashContent('A')).not.toBe(await hashContent('B'));
    });

    it('handles empty string', async () => {
      expect(await hashContent('')).toBeDefined();
    });
  });
});
```

- [ ] **Step 4: Run tests to confirm they fail**
```bash
npm test -- __tests__/utils/encryption.test.ts
# Expected: new tests FAIL (v2 encryption not implemented yet)
```

- [ ] **Step 5: Implement the new encryption.ts**

Replace the entire contents of `utils/encryption.ts` with:

```ts
/**
 * Three™ - Encryption Utilities
 *
 * AES-256-GCM encryption for entries at rest.
 * v2 format: real AES-256-GCM via react-native-quick-crypto
 * v1 format: legacy XOR (read-only, for backward compat)
 */

import crypto from 'react-native-quick-crypto';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoCrypto from 'expo-crypto';

const SECURE_KEY_ALIAS = 'threesentences_encryption_key';
const LEGACY_ASYNC_KEY = '@threesentences/encryption_key';

const KEY_LENGTH = 32;   // 256 bits
const IV_LENGTH = 12;    // 96-bit GCM nonce
const TAG_LENGTH = 16;   // 128-bit GCM auth tag
const ALGORITHM = 'aes-256-gcm' as const;

// ─── Key Management ───────────────────────────────────────────────────────────

async function getOrCreateEncryptionKey(): Promise<Buffer> {
  // 1. Try SecureStore first (the right place)
  let hexKey = await SecureStore.getItemAsync(SECURE_KEY_ALIAS);

  if (!hexKey) {
    // 2. Check AsyncStorage for legacy key (migration path)
    hexKey = await AsyncStorage.getItem(LEGACY_ASYNC_KEY);

    if (hexKey) {
      // Migrate: move to SecureStore, remove from AsyncStorage
      await SecureStore.setItemAsync(SECURE_KEY_ALIAS, hexKey, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
      await AsyncStorage.removeItem(LEGACY_ASYNC_KEY);
    } else {
      // 3. Generate new key
      const keyBytes = crypto.randomBytes(KEY_LENGTH);
      hexKey = keyBytes.toString('hex');
      await SecureStore.setItemAsync(SECURE_KEY_ALIAS, hexKey, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    }
  }

  return Buffer.from(hexKey, 'hex');
}

// ─── v2: AES-256-GCM ─────────────────────────────────────────────────────────

async function encryptV2(plaintext: string): Promise<string> {
  const key = await getOrCreateEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8') as Buffer,
    cipher.final() as Buffer,
  ]);
  const authTag = cipher.getAuthTag();

  // payload = ciphertext + authTag (standard GCM convention)
  const payload = Buffer.concat([encrypted, authTag]);
  return `v2:${iv.toString('hex')}:${payload.toString('hex')}`;
}

async function decryptV2(encryptedStr: string): Promise<string> {
  const parts = encryptedStr.split(':');
  // parts[0] = 'v2', parts[1] = iv_hex, parts[2] = ciphertext+tag hex
  const iv = Buffer.from(parts[1], 'hex');
  const payload = Buffer.from(parts[2], 'hex');

  const ciphertext = payload.subarray(0, payload.length - TAG_LENGTH);
  const authTag = payload.subarray(payload.length - TAG_LENGTH);

  const key = await getOrCreateEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext) as Buffer,
    decipher.final() as Buffer,
  ]);

  return decrypted.toString('utf8');
}

// ─── v1: Legacy XOR (read-only) ───────────────────────────────────────────────

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function decryptV1Legacy(encryptedStr: string): Promise<string> {
  const parts = encryptedStr.split(':');
  const [ivHex, cipherHex] = parts;

  const key = await getOrCreateEncryptionKey();
  const keyBytes = new Uint8Array(key);
  const iv = hexToBytes(ivHex);
  const cipherBytes = hexToBytes(cipherHex);

  const plaintextBytes = new Uint8Array(cipherBytes.length);
  for (let i = 0; i < cipherBytes.length; i++) {
    plaintextBytes[i] = cipherBytes[i] ^ keyBytes[i % keyBytes.length] ^ iv[i % iv.length];
  }

  const decoder = new TextDecoder();
  return decoder.decode(plaintextBytes);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function encryptContent(plaintext: string): Promise<string> {
  return encryptV2(plaintext);
}

export async function decryptContent(encryptedStr: string): Promise<string> {
  if (encryptedStr.startsWith('v2:')) {
    return decryptV2(encryptedStr);
  }
  // Legacy v1 format: no version prefix, 3 colon-separated segments
  return decryptV1Legacy(encryptedStr);
}

export function isEncrypted(content: string): boolean {
  const parts = content.split(':');
  if (parts.length !== 3) return false;

  if (parts[0] === 'v2') {
    // v2: iv must be 24 hex chars (12 bytes)
    return parts[1].length === IV_LENGTH * 2 && /^[0-9a-f]+$/i.test(parts[1]);
  }

  // v1: first segment is IV (24 hex chars), third is 8-char checksum
  const [ivHex, , checksum] = parts;
  if (ivHex.length !== IV_LENGTH * 2) return false;
  if (checksum.length !== 8) return false;
  return /^[0-9a-f]+$/i.test(ivHex) && /^[0-9a-f]+$/i.test(checksum);
}

export async function hashContent(content: string): Promise<string> {
  return ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    content
  );
}
```

- [ ] **Step 6: Run tests**
```bash
npm test -- __tests__/utils/encryption.test.ts
# Expected: all encryption tests pass including new v2 tests
```

- [ ] **Step 7: Run full test suite**
```bash
npm test
# Expected: all tests pass (317 + new tests)
```

- [ ] **Step 8: Verify TypeScript**
```bash
npx tsc --noEmit 2>&1 | grep -v "landing/"
# Expected: no errors
```

- [ ] **Step 9: Rebuild native (required for react-native-quick-crypto)**
```bash
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

Note: `react-native-quick-crypto` uses JSI (C++ bindings) and will not work in Expo Go. Test on a development build only.

- [ ] **Step 10: Commit**
```bash
git add utils/encryption.ts package.json app.json __tests__/utils/encryption.test.ts
git commit -m "feat: replace XOR with AES-256-GCM encryption, migrate key to SecureStore"
```

---

## Task 8: Final Verification

- [ ] **Step 1: Run full test suite**
```bash
npm test
# Expected: all tests pass
```

- [ ] **Step 2: Full TypeScript check (no landing errors)**
```bash
npx tsc --noEmit 2>&1 | grep -v "landing/"
# Expected: no output (0 errors)
```

- [ ] **Step 3: Manual smoke test on device**

Using a development build (`npx expo run:ios`):

1. **New user signup:** Sign up with name + username + email → verify email → land on profile-setup with username pre-filled → complete setup → land on main tabs
2. **Write an entry:** Enter 3 sentences → save → verify it appears in history
3. **AI reflection:** Go to Reflect tab → generate reflection for 7 days → verify a real AI response appears (not "word frequency analysis")
4. **Verify reflection saved:** Check Supabase dashboard → `reflections` table → confirm a row was inserted with the correct `time_range` and `content`
5. **Encryption:** Check Supabase dashboard → `entries` table → `encrypted_content` column → confirm values start with `v2:`
6. **Returning user:** Kill and reopen the app → verify you land on the tabs (not login) and streak is correct

- [ ] **Step 4: Confirm no AsyncStorage encryption key**

In the Expo DevTools or by checking AsyncStorage in the app, confirm `@threesentences/encryption_key` is no longer present (key has moved to SecureStore).

---

## Issue Status Reference

| Issue | Status | Task |
|-------|--------|------|
| C1/C2 Encryption (XOR → AES-256-GCM) | ✅ Fixed | Task 7 |
| C3/C4 Schema type mismatch | ✅ Fixed | Task 4 (reflections type) |
| C5/C6 Streak timezone bug | ✅ Already fixed in codebase | — |
| C7 Signup username flow | ✅ Fixed | Task 3 |
| C8 Group message RLS | ✅ Fixed in schema.sql | Task 6 (verify live DB) |
| H1 Friend suggestion query | ✅ Already fixed in codebase | — |
| H2 Username race condition | ✅ Already fixed in codebase | — |
| H3 .single() → .maybeSingle() | ✅ Fixed | Task 1 |
| M1/M2 Real AI reflections | ✅ Fixed | Task 4 |
| M3 Profile redirect order | ✅ Fixed | Task 3 |
| M4 Haptics cache | ✅ Already fixed in codebase | — |
| M5/M6 Token refresh | ✅ N/A (Supabase native auth) | — |
| App TypeScript errors | ✅ Fixed | Task 2 |
| Landing page TypeScript errors | ✅ Fixed | Task 5 |
