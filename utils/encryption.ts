/**
 * Three™ - Encryption Utilities
 *
 * AES-256-GCM encryption for entries at rest.
 * v2 format: real AES-256-GCM via react-native-quick-crypto
 * v1 format: legacy XOR (read-only, for backward compat with existing entries)
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
      // Verify the write succeeded before removing the only other copy
      const verified = await SecureStore.getItemAsync(SECURE_KEY_ALIAS);
      if (verified === hexKey) {
        await AsyncStorage.removeItem(LEGACY_ASYNC_KEY);
      }
      // If verification fails, leave AsyncStorage copy intact (safe to retry next launch)
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

  const encryptedPart = cipher.update(plaintext, 'utf8');
  const finalPart = cipher.final();
  const authTag = cipher.getAuthTag();

  // payload = ciphertext + authTag (standard GCM convention)
  const encrypted = Buffer.concat([encryptedPart, finalPart]);
  const payload = Buffer.concat([encrypted, authTag]);
  return `v2:${iv.toString('hex')}:${payload.toString('hex')}`;
}

async function decryptV2(encryptedStr: string): Promise<string> {
  const parts = encryptedStr.split(':');
  // parts[0] = 'v2', parts[1] = iv_hex, parts[2] = ciphertext+tag hex
  const iv = hexToBytes(parts[1]);
  const payloadBytes = hexToBytes(parts[2]);

  const ciphertext = payloadBytes.subarray(0, payloadBytes.length - TAG_LENGTH);
  const authTag = payloadBytes.subarray(payloadBytes.length - TAG_LENGTH);

  const key = await getOrCreateEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });
  // Cast needed: react-native-quick-crypto expects its own Buffer type;
  // Uint8Array is the common subset that works at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decipher.setAuthTag(authTag as any);

  const decryptedPart = decipher.update(ciphertext);
  const decryptedFinal = decipher.final();
  const decrypted = Buffer.concat([decryptedPart, decryptedFinal]);

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
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format');
  }
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
  // Legacy v1 format: no version prefix
  return decryptV1Legacy(encryptedStr);
}

export function isEncrypted(content: string): boolean {
  const parts = content.split(':');
  if (parts.length !== 3) return false;

  if (parts[0] === 'v2') {
    // v2: second segment is IV (24 hex chars = 12 bytes), third segment is payload
    return (
      parts[1].length === IV_LENGTH * 2 &&
      /^[0-9a-f]+$/i.test(parts[1]) &&
      parts[2].length > 0 &&
      /^[0-9a-f]+$/i.test(parts[2])
    );
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
