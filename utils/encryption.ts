/**
 * Three™ - Encryption Utilities
 *
 * AES-256-GCM via Hermes Web Crypto API (crypto.subtle) — no native module needed.
 * v2 format: AES-256-GCM (current)
 * v1 format: legacy XOR (read-only, backward compat)
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoCrypto from 'expo-crypto';

const SECURE_KEY_ALIAS = 'threesentences_encryption_key';
const LEGACY_ASYNC_KEY = '@threesentences/encryption_key';

const KEY_LENGTH = 32;  // 256 bits
const IV_LENGTH = 12;   // 96-bit GCM nonce

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Key Management ───────────────────────────────────────────────────────────

async function getRawKeyBytes(): Promise<Uint8Array> {
  let hexKey = await SecureStore.getItemAsync(SECURE_KEY_ALIAS);

  if (!hexKey) {
    // Migrate from legacy AsyncStorage location
    const legacyKey = await AsyncStorage.getItem(LEGACY_ASYNC_KEY);
    if (legacyKey) {
      await SecureStore.setItemAsync(SECURE_KEY_ALIAS, legacyKey, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
      const verified = await SecureStore.getItemAsync(SECURE_KEY_ALIAS);
      if (verified === legacyKey) {
        await AsyncStorage.removeItem(LEGACY_ASYNC_KEY);
      }
      hexKey = legacyKey;
    } else {
      // KEY GENERATION — This 256-bit key is generated once and stored only in SecureStore.
      // There is NO backup or recovery mechanism. If the user reinstalls the app (or if
      // SecureStore is otherwise cleared), this key is permanently lost and all encrypted
      // journal entries become unreadable forever.
      // TODO: Before GA, implement a backup/export path (e.g., iCloud Keychain escrow,
      //       encrypted export to cloud storage, or a user-facing "back up your key" flow).
      const keyBytes = await ExpoCrypto.getRandomBytesAsync(KEY_LENGTH);
      hexKey = bytesToHex(keyBytes);
      await SecureStore.setItemAsync(SECURE_KEY_ALIAS, hexKey, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    }
  }

  return hexToBytes(hexKey);
}

async function getCryptoKey(usage: KeyUsage): Promise<CryptoKey> {
  const rawKey = await getRawKeyBytes();
  // Cast .buffer to ArrayBuffer: TS 5.x infers Uint8Array<ArrayBufferLike> but
  // crypto.subtle.importKey expects BufferSource which requires ArrayBuffer.
  return crypto.subtle.importKey(
    'raw',
    rawKey.buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage]
  );
}

// ─── v2: AES-256-GCM ─────────────────────────────────────────────────────────

async function encryptV2(plaintext: string): Promise<string> {
  const key = await getCryptoKey('encrypt');
  const iv = await ExpoCrypto.getRandomBytesAsync(IV_LENGTH);
  const encoded = new TextEncoder().encode(plaintext);

  const cipherBuffer = await crypto.subtle.encrypt(
    // iv.buffer cast: TS 5.x widens Uint8Array to ArrayBufferLike; AES-GCM iv needs ArrayBuffer.
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer, tagLength: 128 },
    key,
    encoded
  );

  return `v2:${bytesToHex(iv)}:${bytesToHex(new Uint8Array(cipherBuffer))}`;
}

async function decryptV2(encryptedStr: string): Promise<string> {
  const parts = encryptedStr.split(':');
  const iv = hexToBytes(parts[1]);
  const cipherBytes = hexToBytes(parts[2]);

  const key = await getCryptoKey('decrypt');
  const plainBuffer = await crypto.subtle.decrypt(
    // iv.buffer cast: same ArrayBufferLike → ArrayBuffer narrowing as encryptV2.
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer, tagLength: 128 },
    key,
    // cipherBytes.buffer cast: same TS 5.x ArrayBufferLike narrowing needed for data arg.
    cipherBytes.buffer as ArrayBuffer
  );

  return new TextDecoder().decode(plainBuffer);
}

// ─── v1: Legacy XOR (read-only) ───────────────────────────────────────────────

async function decryptV1Legacy(encryptedStr: string): Promise<string> {
  const parts = encryptedStr.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted format');

  const keyBytes = await getRawKeyBytes();
  const iv = hexToBytes(parts[0]);
  const cipherBytes = hexToBytes(parts[1]);

  const plaintextBytes = new Uint8Array(cipherBytes.length);
  for (let i = 0; i < cipherBytes.length; i++) {
    plaintextBytes[i] = cipherBytes[i] ^ keyBytes[i % keyBytes.length] ^ iv[i % iv.length];
  }

  return new TextDecoder().decode(plaintextBytes);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function encryptContent(plaintext: string): Promise<string> {
  return encryptV2(plaintext);
}

export async function decryptContent(encryptedStr: string): Promise<string> {
  if (encryptedStr.startsWith('v2:')) {
    return decryptV2(encryptedStr);
  }
  return decryptV1Legacy(encryptedStr);
}

export function isEncrypted(content: string): boolean {
  const parts = content.split(':');
  if (parts.length !== 3) return false;

  if (parts[0] === 'v2') {
    return (
      parts[1].length === IV_LENGTH * 2 &&
      /^[0-9a-f]+$/i.test(parts[1]) &&
      parts[2].length > 0 &&
      /^[0-9a-f]+$/i.test(parts[2])
    );
  }

  // v1: iv:cipher:checksum
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
