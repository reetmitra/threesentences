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

// Stateful SecureStore mock so encrypt/decrypt reuse the same key within a test
// Variable must be prefixed with "mock" to be accessible inside jest.mock() factory
const mockSecureStoreMap = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key: string) => Promise.resolve(mockSecureStoreMap.get(key) ?? null)),
  setItemAsync: jest.fn((key: string, value: string) => {
    mockSecureStoreMap.set(key, value);
    return Promise.resolve();
  }),
  WHEN_UNLOCKED: 'WHEN_UNLOCKED',
}));

describe('encryption', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureStoreMap.clear();
    (global as any).clearMockStorage?.();
    // Re-bind mocks after clearAllMocks so the map-backed implementations still work
    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) =>
      Promise.resolve(mockSecureStoreMap.get(key) ?? null)
    );
    (SecureStore.setItemAsync as jest.Mock).mockImplementation((key: string, value: string) => {
      mockSecureStoreMap.set(key, value);
      return Promise.resolve();
    });
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
      const AsyncStorageMod = require('@react-native-async-storage/async-storage');
      // The mock uses __esModule: true with a default export
      const AsyncStorage = AsyncStorageMod.default ?? AsyncStorageMod;
      const legacyKey = 'a'.repeat(64);
      // Seed legacy key into AsyncStorage (using the real mock map via setItem)
      await AsyncStorage.setItem('@threesentences/encryption_key', legacyKey);
      // SecureStore has no key (secureStoreMap is empty from beforeEach)

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
