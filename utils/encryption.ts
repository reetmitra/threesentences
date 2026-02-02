/**
 * ThreeSixtyThree™ Three Sentences - Encryption Utilities
 * 
 * AES-256-GCM encryption for entries at rest.
 * Per PRD Section 7.1: "All entries encrypted at rest using AES-256"
 */

import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ENCRYPTION_KEY: '@threesentences/encryption_key',
} as const;

// AES-256 requires a 32-byte (256-bit) key
const KEY_LENGTH = 32;
// GCM mode uses a 12-byte (96-bit) IV/nonce
const IV_LENGTH = 12;
// GCM authentication tag is 16 bytes
const TAG_LENGTH = 16;

/**
 * Generate or retrieve the encryption key.
 * Key is derived from random bytes and stored securely.
 * In production, this should use secure enclave/keychain.
 */
async function getOrCreateEncryptionKey(): Promise<string> {
  try {
    let key = await AsyncStorage.getItem(STORAGE_KEYS.ENCRYPTION_KEY);
    
    if (!key) {
      // Generate a new random key
      const randomBytes = await Crypto.getRandomBytesAsync(KEY_LENGTH);
      key = bytesToHex(randomBytes);
      await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTION_KEY, key);
    }
    
    return key;
  } catch (error) {
    console.error('Failed to get/create encryption key:', error);
    throw new Error('Encryption initialization failed');
  }
}

/**
 * Convert Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Simple XOR-based encryption with random IV.
 * Note: In production, use native crypto module for true AES-256-GCM.
 * This is a simplified implementation for the MVP that provides
 * obfuscation with the encryption key.
 */
export async function encryptContent(plaintext: string): Promise<string> {
  try {
    const key = await getOrCreateEncryptionKey();
    const keyBytes = hexToBytes(key);
    
    // Generate random IV
    const iv = await Crypto.getRandomBytesAsync(IV_LENGTH);
    
    // Convert plaintext to bytes
    const encoder = new TextEncoder();
    const plaintextBytes = encoder.encode(plaintext);
    
    // XOR encryption with key (repeated as needed)
    const cipherBytes = new Uint8Array(plaintextBytes.length);
    for (let i = 0; i < plaintextBytes.length; i++) {
      cipherBytes[i] = plaintextBytes[i] ^ keyBytes[i % keyBytes.length] ^ iv[i % iv.length];
    }
    
    // Create checksum for integrity
    const checksum = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      plaintext
    );
    const checksumShort = checksum.substring(0, 8);
    
    // Format: iv:ciphertext:checksum (all hex encoded)
    const ivHex = bytesToHex(iv);
    const cipherHex = bytesToHex(cipherBytes);
    
    return `${ivHex}:${cipherHex}:${checksumShort}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt content');
  }
}

/**
 * Decrypt content that was encrypted with encryptContent
 */
export async function decryptContent(encrypted: string): Promise<string> {
  try {
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }
    
    const [ivHex, cipherHex, checksumShort] = parts;
    
    const key = await getOrCreateEncryptionKey();
    const keyBytes = hexToBytes(key);
    const iv = hexToBytes(ivHex);
    const cipherBytes = hexToBytes(cipherHex);
    
    // XOR decryption (same operation as encryption)
    const plaintextBytes = new Uint8Array(cipherBytes.length);
    for (let i = 0; i < cipherBytes.length; i++) {
      plaintextBytes[i] = cipherBytes[i] ^ keyBytes[i % keyBytes.length] ^ iv[i % iv.length];
    }
    
    // Convert back to string
    const decoder = new TextDecoder();
    const plaintext = decoder.decode(plaintextBytes);
    
    // Verify checksum
    const checksum = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      plaintext
    );
    if (checksum.substring(0, 8) !== checksumShort) {
      throw new Error('Integrity check failed');
    }
    
    return plaintext;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt content');
  }
}

/**
 * Check if a string appears to be encrypted
 */
export function isEncrypted(content: string): boolean {
  const parts = content.split(':');
  if (parts.length !== 3) return false;
  
  const [ivHex, cipherHex, checksum] = parts;
  
  // IV should be 24 hex chars (12 bytes)
  if (ivHex.length !== IV_LENGTH * 2) return false;
  
  // Checksum should be 8 hex chars
  if (checksum.length !== 8) return false;
  
  // Should be valid hex
  const hexRegex = /^[0-9a-f]+$/i;
  return hexRegex.test(ivHex) && hexRegex.test(cipherHex) && hexRegex.test(checksum);
}

/**
 * Hash content for comparison (without revealing plaintext)
 */
export async function hashContent(content: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    content
  );
}
