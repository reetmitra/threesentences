# C1/C2: Encryption Overhaul — XOR to AES-256-GCM + Secure Key Storage

## Current State (What's Broken)

### Problem 1: XOR "encryption" is not encryption
`utils/encryption.ts` claims AES-256-GCM in comments but implements XOR cipher (lines 83-87):
```
cipherBytes[i] = plaintextBytes[i] ^ keyBytes[i % keyBytes.length] ^ iv[i % iv.length]
```
XOR with a repeating key is trivially breakable. Known-plaintext attacks recover the key instantly. The IV provides no semantic security because XOR(plaintext, key, iv) has the same weakness regardless of IV randomness.

### Problem 2: Key stored in plaintext AsyncStorage
`getOrCreateEncryptionKey()` (line 29-35) stores the 256-bit key in `AsyncStorage` under `@threesentences/encryption_key`. AsyncStorage is:
- Unencrypted SQLite on Android
- Unencrypted plist on iOS
- Readable by any process with file access / jailbreak / backup extraction
- The key is right next to the data it protects — encrypting with a plaintext-stored key is equivalent to no encryption

### Problem 3: SHA-256 checksum is not authenticated encryption
The 8-char truncated SHA-256 hash of the *plaintext* (line 90-95) is stored alongside the ciphertext. This is not a MAC — it doesn't use the key, so an attacker can forge valid checksums. It also leaks information (same plaintext = same checksum prefix).

### Problem 4: Encrypted data goes to Supabase
`store/entries.ts` uploads `encrypted_content` to Supabase. If the encryption is broken (it is), server-side data is effectively plaintext to anyone with DB access.

## Target State

| Aspect | Current | Target |
|--------|---------|--------|
| Cipher | XOR with repeating key | AES-256-GCM via `react-native-quick-crypto` or `expo-crypto` SubtleCrypto |
| Auth | Truncated SHA-256 of plaintext | GCM authentication tag (built into cipher) |
| Key storage | AsyncStorage (plaintext) | `expo-secure-store` (iOS Keychain / Android Keystore) |
| Key derivation | Raw random bytes | Random bytes, but stored in hardware-backed secure enclave |
| Format | `iv:ciphertext:checksum` | `v2:iv:ciphertext+tag` (version-prefixed) |
| API surface | `encryptContent`, `decryptContent`, `isEncrypted`, `hashContent` | Same exports, same signatures |

## Library Evaluation

### Option A: `expo-crypto` SubtleCrypto (Preferred if available)
- Expo SDK 50+ exposes `expo-crypto`'s `digest` and `getRandomBytes`. As of SDK 54, `expo-crypto` does NOT expose SubtleCrypto / `crypto.subtle.encrypt` natively.
- `expo-crypto` only provides: `digestStringAsync`, `getRandomBytesAsync`, `getRandomValues`.
- **Verdict: Cannot do AES-256-GCM with expo-crypto alone.**

### Option B: `react-native-quick-crypto` (Recommended)
- Drop-in Node.js `crypto` polyfill using JSI (C++ bindings, not bridge).
- Supports `createCipheriv('aes-256-gcm', key, iv)` with `getAuthTag()`.
- Works with Expo via config plugin or prebuild.
- Performance: native C++ via JSI, not JS-land byte manipulation.
- **Verdict: Best option. Provides real AES-256-GCM with native performance.**

### Option C: Web Crypto API polyfill
- Could polyfill `crypto.subtle` but adds JS-layer overhead and complexity.
- **Verdict: Avoid. Slower, more fragile, harder to audit.**

### Key Storage: `expo-secure-store` (Already in package.json)
- iOS: Keychain Services (hardware-backed on devices with Secure Enclave).
- Android: Android Keystore system (hardware-backed on API 23+).
- Already a dependency (`"expo-secure-store": "^15.0.8"`). Currently unused for encryption keys.
- 2KB value limit — sufficient for a 64-char hex key.
- `SecureStore.setItemAsync(key, value, { keychainAccessible: WHEN_UNLOCKED })`.

## Files to Modify

| File | Change |
|------|--------|
| `utils/encryption.ts` | Replace XOR with AES-256-GCM, migrate key storage, add version prefix |
| `store/entries.ts` | No changes needed (API surface preserved) |
| `__tests__/utils/encryption.test.ts` | Update mocks, add migration tests, add v1/v2 interop tests |
| `package.json` | Add `react-native-quick-crypto` dependency |
| `app.json` or `app.config.js` | Add `react-native-quick-crypto` config plugin (if using Expo prebuild) |

## Step-by-Step Implementation

### Step 1: Install `react-native-quick-crypto`

```bash
npx expo install react-native-quick-crypto
```

If using Expo managed workflow with prebuild:
```json
// app.json plugins array
["react-native-quick-crypto"]
```

Alternatively, if `react-native-quick-crypto` has Expo config plugin issues, use the `crypto.polyfill.js` approach:
```js
// crypto-polyfill.ts (imported at app entry)
import { install } from 'react-native-quick-crypto';
install();
```

### Step 2: Migrate Key from AsyncStorage to SecureStore

```ts
// Pattern for key migration
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECURE_KEY_ALIAS = 'threesentences_encryption_key';
const LEGACY_KEY = '@threesentences/encryption_key';

async function getOrCreateEncryptionKey(): Promise<Buffer> {
  // 1. Try SecureStore first
  let hexKey = await SecureStore.getItemAsync(SECURE_KEY_ALIAS);

  if (!hexKey) {
    // 2. Check AsyncStorage for legacy key (migration)
    hexKey = await AsyncStorage.getItem(LEGACY_KEY);

    if (hexKey) {
      // Migrate: copy to SecureStore, delete from AsyncStorage
      await SecureStore.setItemAsync(SECURE_KEY_ALIAS, hexKey, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
      await AsyncStorage.removeItem(LEGACY_KEY);
    } else {
      // 3. Generate new key
      const keyBytes = crypto.randomBytes(32); // from quick-crypto
      hexKey = keyBytes.toString('hex');
      await SecureStore.setItemAsync(SECURE_KEY_ALIAS, hexKey, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    }
  }

  return Buffer.from(hexKey, 'hex');
}
```

### Step 3: Implement AES-256-GCM Encryption

```ts
import crypto from 'react-native-quick-crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;   // 96-bit nonce for GCM
const TAG_LENGTH = 16;  // 128-bit auth tag
const VERSION_PREFIX = 'v2';

async function encryptContent(plaintext: string): Promise<string> {
  const key = await getOrCreateEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Format: v2:<iv_hex>:<ciphertext_hex><authtag_hex>
  // Auth tag appended to ciphertext (standard practice)
  const payload = Buffer.concat([encrypted, authTag]);
  return `${VERSION_PREFIX}:${iv.toString('hex')}:${payload.toString('hex')}`;
}
```

### Step 4: Implement AES-256-GCM Decryption with Legacy Fallback

```ts
async function decryptContent(encryptedStr: string): Promise<string> {
  // Version detection
  if (encryptedStr.startsWith('v2:')) {
    return decryptV2(encryptedStr);
  }
  // Legacy XOR format: iv:ciphertext:checksum (no version prefix)
  return decryptV1Legacy(encryptedStr);
}

async function decryptV2(encryptedStr: string): Promise<string> {
  const parts = encryptedStr.split(':');
  // parts[0] = 'v2', parts[1] = iv_hex, parts[2] = ciphertext+tag hex
  const iv = Buffer.from(parts[1], 'hex');
  const payload = Buffer.from(parts[2], 'hex');

  // Split payload into ciphertext and auth tag
  const ciphertext = payload.subarray(0, payload.length - TAG_LENGTH);
  const authTag = payload.subarray(payload.length - TAG_LENGTH);

  const key = await getOrCreateEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(), // Throws if auth tag verification fails
  ]);

  return decrypted.toString('utf8');
}

async function decryptV1Legacy(encryptedStr: string): Promise<string> {
  // Keep existing XOR logic here verbatim for backward compat
  // This allows reading old entries without data loss
  // ... (current XOR implementation)
}
```

### Step 5: Update `isEncrypted`

```ts
function isEncrypted(content: string): boolean {
  // v2 format
  if (content.startsWith('v2:')) {
    const parts = content.split(':');
    if (parts.length !== 3) return false;
    if (parts[1].length !== IV_LENGTH * 2) return false;
    return /^[0-9a-f]+$/i.test(parts[1]) && /^[0-9a-f]+$/i.test(parts[2]);
  }
  // v1 legacy format (existing logic)
  // ... keep current implementation
}
```

### Step 6: `hashContent` stays the same
`hashContent` uses `expo-crypto` SHA-256 and is fine. No change needed.

## Migration Strategy

### Principle: Read old, write new. No bulk re-encryption required.

1. **Key migration** happens on first call to `getOrCreateEncryptionKey()`:
   - If key exists in AsyncStorage but not SecureStore: copy to SecureStore, delete from AsyncStorage.
   - If key exists in SecureStore: use it.
   - If no key anywhere: generate new, store in SecureStore only.

2. **Data migration** is lazy (on-read):
   - `decryptContent()` detects format by version prefix.
   - No prefix = v1 (XOR). Decrypt with legacy code.
   - `v2:` prefix = AES-256-GCM. Decrypt with new code.
   - All new writes use v2 format.

3. **Optional: Background re-encryption** (not required for launch):
   - Could add a one-time migration that reads all entries, decrypts (v1 or v2), re-encrypts as v2, and updates Supabase.
   - Run this as a post-login background task.
   - Pattern:
     ```ts
     async function reEncryptAllEntries(userId: string): Promise<void> {
       const entries = await getAllEntriesRaw(userId); // fetch without decrypt
       for (const entry of entries) {
         if (!entry.encrypted_content.startsWith('v2:')) {
           const plaintext = await decryptV1Legacy(entry.encrypted_content);
           const newEncrypted = await encryptContent(plaintext); // writes v2
           await updateEncryptedContent(userId, entry.id, newEncrypted);
         }
       }
       // Mark migration complete in SecureStore
       await SecureStore.setItemAsync('encryption_migration_v2', 'done');
     }
     ```

4. **Edge case: key loss**
   - If SecureStore is cleared (app reinstall) but Supabase still has encrypted entries, they are unrecoverable. This is by design for client-side encryption.
   - Document this. Consider a key backup/export flow for users in the future.

## Testing Approach

### Unit Tests (`__tests__/utils/encryption.test.ts`)

1. **Mock setup changes**:
   - Mock `react-native-quick-crypto` to provide real-ish `createCipheriv`/`createDecipheriv` or use a Node.js crypto mock (since Jest runs in Node, you can use actual `crypto` module in tests).
   - Mock `expo-secure-store` (`getItemAsync`, `setItemAsync`, `deleteItemAsync`).

2. **New test cases**:
   ```
   - v2 encrypt/decrypt round-trip (same cases as existing)
   - v1 legacy decrypt still works (hardcode a known v1 ciphertext)
   - v2 format: starts with 'v2:', has correct structure
   - Auth tag tampering: modify one byte of ciphertext, expect decryption to throw
   - IV uniqueness: encrypt same plaintext twice, IVs differ
   - Key migration: key in AsyncStorage -> moves to SecureStore on first call
   - Key migration: key in SecureStore -> AsyncStorage not touched
   - Key generation: no key anywhere -> new key in SecureStore only
   - isEncrypted detects both v1 and v2 formats
   - Mixed version interop: encrypt v1, read back correctly; encrypt v2, read back correctly
   ```

3. **Integration test** (manual or E2E):
   - Create entries with current (v1) encryption.
   - Deploy new code.
   - Verify old entries still readable.
   - Create new entry, verify it's v2 format in Supabase.
   - Verify key no longer in AsyncStorage.

### Security Verification
- Inspect Supabase `encrypted_content` column: new entries should start with `v2:`.
- Inspect AsyncStorage dump: should NOT contain `@threesentences/encryption_key`.
- Attempt to decrypt v2 ciphertext with wrong key: should throw (auth tag failure, not garbage output).

## Implementation Order

1. `npm install react-native-quick-crypto` + config plugin setup
2. Modify `utils/encryption.ts`:
   - Add imports (`react-native-quick-crypto`, `expo-secure-store`)
   - Rename current `encryptContent` -> `encryptV1Legacy` (keep for reference only)
   - Rename current decrypt logic -> `decryptV1Legacy`
   - Implement `getOrCreateEncryptionKey` with SecureStore + AsyncStorage migration
   - Implement new `encryptContent` (AES-256-GCM, v2 prefix)
   - Implement new `decryptContent` (version dispatch -> v2 or v1 legacy)
   - Update `isEncrypted` to handle both formats
   - Keep `hashContent` unchanged
3. Update tests
4. Run `npx expo prebuild` if needed for native module
5. Test on device (crypto modules need native code, won't work in Expo Go)

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| `react-native-quick-crypto` doesn't work with Expo SDK 54 | Fallback: use `aesjs` (pure JS AES) — slower but no native dependency. Or use `@simerplaha/react-native-aes-crypto`. |
| Key lost on reinstall = permanent data loss | Accept for MVP. Future: key backup via user password (PBKDF2 wrapping). |
| Expo Go doesn't support native modules | Use development build (`npx expo run:ios`) for testing. Document this requirement. |
| v1 entries with corrupted checksums | Legacy decrypt already catches this and throws. `mapToEntry` in entries.ts already handles decrypt failure gracefully (shows "[Unable to decrypt entry]"). |
| Performance with many entries | GCM is fast in native (quick-crypto uses OpenSSL). Lazy migration means no upfront cost. |
