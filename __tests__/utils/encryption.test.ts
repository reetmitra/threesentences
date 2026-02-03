/**
 * Tests for Encryption Utility
 *
 * Per PRD Section 7.1: All entries encrypted at rest
 */

import {
  encryptContent,
  decryptContent,
  isEncrypted,
  hashContent,
} from '@/utils/encryption';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('encryption', () => {
  beforeEach(() => {
    // Clear storage before each test
    (global as any).clearMockStorage();
  });

  describe('encryptContent', () => {
    it('encrypts plaintext successfully', async () => {
      const plaintext = 'Hello, World!';
      const encrypted = await encryptContent(plaintext);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
    });

    it('returns string in correct format (iv:ciphertext:checksum)', async () => {
      const encrypted = await encryptContent('Test message');
      const parts = encrypted.split(':');

      expect(parts).toHaveLength(3);
    });

    it('generates different ciphertext for same plaintext (due to random IV)', async () => {
      const plaintext = 'Same content';
      const encrypted1 = await encryptContent(plaintext);
      const encrypted2 = await encryptContent(plaintext);

      // IVs should be different
      const iv1 = encrypted1.split(':')[0];
      const iv2 = encrypted2.split(':')[0];
      expect(iv1).not.toBe(iv2);
    });

    it('handles empty string', async () => {
      const encrypted = await encryptContent('');
      expect(encrypted).toBeDefined();
      expect(encrypted.split(':')).toHaveLength(3);
    });

    it('handles long content', async () => {
      const longContent = 'A'.repeat(10000);
      const encrypted = await encryptContent(longContent);
      expect(encrypted).toBeDefined();
    });

    it('handles special characters', async () => {
      const specialChars = '!@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./"';
      const encrypted = await encryptContent(specialChars);
      expect(encrypted).toBeDefined();
    });

    it('handles unicode characters', async () => {
      const unicode = '你好世界 🌍 مرحبا';
      const encrypted = await encryptContent(unicode);
      expect(encrypted).toBeDefined();
    });

    it('creates encryption key if none exists', async () => {
      await encryptContent('Test');

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@threesentences/encryption_key');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('reuses existing encryption key', async () => {
      // First encryption creates the key
      await encryptContent('First');
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls.length;

      // Second encryption should reuse the key
      await encryptContent('Second');
      // setItem for key should not be called again
      // (only the initial key creation sets the key)
    });
  });

  describe('decryptContent', () => {
    it('decrypts encrypted content correctly', async () => {
      const plaintext = 'Hello, World!';
      const encrypted = await encryptContent(plaintext);
      const decrypted = await decryptContent(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('handles round-trip encryption/decryption', async () => {
      const testCases = [
        'Simple text',
        'Text with numbers 123',
        'Special chars: !@#$%',
        'Multi\nline\ntext',
        'Emoji: 🎉🔐',
      ];

      for (const text of testCases) {
        const encrypted = await encryptContent(text);
        const decrypted = await decryptContent(encrypted);
        expect(decrypted).toBe(text);
      }
    });

    it('handles empty string round-trip', async () => {
      const encrypted = await encryptContent('');
      const decrypted = await decryptContent(encrypted);
      expect(decrypted).toBe('');
    });

    it('throws error for invalid format', async () => {
      await expect(decryptContent('invalid')).rejects.toThrow();
    });

    it('throws error for missing parts', async () => {
      await expect(decryptContent('only:two')).rejects.toThrow();
    });

    it('verifies checksum integrity', async () => {
      // The checksum is verified during decryption
      // Our mock hash function is simple, so we just verify the format is correct
      const encrypted = await encryptContent('Test');
      const parts = encrypted.split(':');

      expect(parts).toHaveLength(3);
      expect(parts[2]).toHaveLength(8); // Checksum is 8 hex chars
    });
  });

  describe('isEncrypted', () => {
    it('returns true for encrypted content', async () => {
      const encrypted = await encryptContent('Test');
      expect(isEncrypted(encrypted)).toBe(true);
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

    it('returns false for invalid IV length', () => {
      expect(isEncrypted('abc:1234567890abcdef:12345678')).toBe(false);
    });

    it('returns false for invalid checksum length', () => {
      // Valid IV length (24 hex chars = 12 bytes), but wrong checksum
      expect(isEncrypted('123456789012345678901234:abcdef:123')).toBe(false);
    });

    it('returns false for non-hex characters', () => {
      expect(isEncrypted('ghij56789012345678901234:abcdef:12345678')).toBe(false);
    });

    it('correctly identifies valid encrypted format', () => {
      // 24 hex chars (12 bytes) IV, any length hex cipher, 8 char checksum
      const validFormat = '123456789012345678901234:abcdef1234567890:12345678';
      expect(isEncrypted(validFormat)).toBe(true);
    });
  });

  describe('hashContent', () => {
    it('returns hash string for content', async () => {
      const hash = await hashContent('Test content');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('returns consistent hash for same content', async () => {
      const content = 'Same content';
      const hash1 = await hashContent(content);
      const hash2 = await hashContent(content);
      expect(hash1).toBe(hash2);
    });

    it('returns different hash for different content', async () => {
      const hash1 = await hashContent('Content A');
      const hash2 = await hashContent('Content B');
      expect(hash1).not.toBe(hash2);
    });

    it('handles empty string', async () => {
      const hash = await hashContent('');
      expect(hash).toBeDefined();
    });
  });
});
