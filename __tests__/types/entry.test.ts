/**
 * Tests for Entry Type Utilities
 *
 * Date and ID utilities for journal entries
 */

import {
  getTodayDateString,
  formatDateString,
  parseDateString,
  getCurrentTimezone,
  generateId,
} from '@/types/entry';

describe('entry type utilities', () => {
  describe('getTodayDateString', () => {
    it('returns a string in YYYY-MM-DD format', () => {
      const result = getTodayDateString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns correct current date', () => {
      const result = getTodayDateString();
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(result).toBe(expected);
    });
  });

  describe('formatDateString', () => {
    it('formats date with single digit month and day', () => {
      const date = new Date(2026, 0, 5); // Jan 5, 2026
      expect(formatDateString(date)).toBe('2026-01-05');
    });

    it('formats date with double digit month and day', () => {
      const date = new Date(2026, 11, 25); // Dec 25, 2026
      expect(formatDateString(date)).toBe('2026-12-25');
    });

    it('handles leap year date', () => {
      const date = new Date(2024, 1, 29); // Feb 29, 2024 (leap year)
      expect(formatDateString(date)).toBe('2024-02-29');
    });

    it('handles year boundaries', () => {
      const date = new Date(2026, 0, 1); // Jan 1, 2026
      expect(formatDateString(date)).toBe('2026-01-01');
    });

    it('handles December 31st', () => {
      const date = new Date(2026, 11, 31); // Dec 31, 2026
      expect(formatDateString(date)).toBe('2026-12-31');
    });
  });

  describe('parseDateString', () => {
    it('parses YYYY-MM-DD string correctly', () => {
      const result = parseDateString('2026-01-15');
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
    });

    it('parses leap year date', () => {
      const result = parseDateString('2024-02-29');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1); // February is 1
      expect(result.getDate()).toBe(29);
    });

    it('parses first day of year', () => {
      const result = parseDateString('2026-01-01');
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(1);
    });

    it('parses last day of year', () => {
      const result = parseDateString('2026-12-31');
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(11); // December is 11
      expect(result.getDate()).toBe(31);
    });

    it('round-trips with formatDateString', () => {
      const original = '2026-06-15';
      const parsed = parseDateString(original);
      const formatted = formatDateString(parsed);
      expect(formatted).toBe(original);
    });
  });

  describe('getCurrentTimezone', () => {
    it('returns a non-empty string', () => {
      const tz = getCurrentTimezone();
      expect(typeof tz).toBe('string');
      expect(tz.length).toBeGreaterThan(0);
    });

    it('returns an IANA timezone format', () => {
      const tz = getCurrentTimezone();
      // Common pattern for IANA timezones
      expect(tz).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+$/);
    });
  });

  describe('generateId', () => {
    it('returns a UUID v4 format string', () => {
      const id = generateId();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('generates unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });

    it('has correct version digit (4)', () => {
      const id = generateId();
      const versionChar = id.charAt(14);
      expect(versionChar).toBe('4');
    });

    it('has correct variant bits', () => {
      const id = generateId();
      const variantChar = id.charAt(19);
      expect(['8', '9', 'a', 'b']).toContain(variantChar);
    });

    it('generates IDs of correct length', () => {
      const id = generateId();
      expect(id.length).toBe(36); // 32 hex chars + 4 hyphens
    });
  });
});
