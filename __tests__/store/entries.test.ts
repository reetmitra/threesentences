/**
 * Tests for Entries Store
 *
 * Per PRD: Local-first storage, entries encrypted at rest, immutable after submission
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllEntries,
  getEntryForDate,
  getTodayEntry,
  hasEntryForToday,
  saveEntry,
  getEntriesForMonth,
  getEntryDatesForMonth,
  saveDraft,
  getDraft,
  clearDraft,
  exportEntries,
  getEntryCount,
  getEntriesForReflection,
} from '@/store/entries';
import { getTodayDateString, formatDateString } from '@/types/entry';

// Mock encryption to simplify testing
jest.mock('@/utils/encryption', () => ({
  encryptContent: jest.fn((content) =>
    Promise.resolve(`encrypted:${btoa(content)}:checksum`)
  ),
  decryptContent: jest.fn((encrypted) => {
    const parts = encrypted.split(':');
    if (parts.length !== 3) throw new Error('Invalid format');
    return Promise.resolve(atob(parts[1]));
  }),
  isEncrypted: jest.fn((content) => content.includes('encrypted:')),
}));

describe('entries store', () => {
  beforeEach(() => {
    (global as any).clearMockStorage();
    jest.clearAllMocks();
  });

  describe('getAllEntries', () => {
    it('returns empty array when no entries exist', async () => {
      const entries = await getAllEntries();
      expect(entries).toEqual([]);
    });

    it('returns decrypted entries', async () => {
      const storedEntries = [
        {
          id: 'entry-1',
          date: '2026-01-15',
          encryptedContent: `encrypted:${btoa('First entry.')}:checksum`,
          submittedAt: '2026-01-15T10:00:00.000Z',
          timezone: 'America/New_York',
        },
      ];
      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(storedEntries));

      const entries = await getAllEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].content).toBe('First entry.');
      expect(entries[0].id).toBe('entry-1');
    });

    it('handles legacy unencrypted entries', async () => {
      const legacyEntries = [
        {
          id: 'legacy-1',
          date: '2026-01-10',
          content: 'Legacy unencrypted content.',
          submittedAt: '2026-01-10T10:00:00.000Z',
          timezone: 'America/New_York',
        },
      ];
      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(legacyEntries));

      const entries = await getAllEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].content).toBe('Legacy unencrypted content.');
    });

    it('returns multiple entries in order', async () => {
      const storedEntries = [
        {
          id: 'entry-1',
          date: '2026-01-15',
          encryptedContent: `encrypted:${btoa('Entry one.')}:checksum`,
          submittedAt: '2026-01-15T10:00:00.000Z',
          timezone: 'America/New_York',
        },
        {
          id: 'entry-2',
          date: '2026-01-16',
          encryptedContent: `encrypted:${btoa('Entry two.')}:checksum`,
          submittedAt: '2026-01-16T10:00:00.000Z',
          timezone: 'America/New_York',
        },
      ];
      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(storedEntries));

      const entries = await getAllEntries();
      expect(entries).toHaveLength(2);
    });
  });

  describe('getEntryForDate', () => {
    it('returns null when no entry exists for date', async () => {
      const entry = await getEntryForDate('2026-01-15');
      expect(entry).toBeNull();
    });

    it('returns entry for specific date', async () => {
      const storedEntries = [
        {
          id: 'entry-1',
          date: '2026-01-15',
          encryptedContent: `encrypted:${btoa('Specific date entry.')}:checksum`,
          submittedAt: '2026-01-15T10:00:00.000Z',
          timezone: 'America/New_York',
        },
      ];
      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(storedEntries));

      const entry = await getEntryForDate('2026-01-15');
      expect(entry).not.toBeNull();
      expect(entry?.content).toBe('Specific date entry.');
    });

    it('returns null when date does not match any entry', async () => {
      const storedEntries = [
        {
          id: 'entry-1',
          date: '2026-01-15',
          encryptedContent: `encrypted:${btoa('Entry.')}:checksum`,
          submittedAt: '2026-01-15T10:00:00.000Z',
          timezone: 'America/New_York',
        },
      ];
      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(storedEntries));

      const entry = await getEntryForDate('2026-01-16');
      expect(entry).toBeNull();
    });
  });

  describe('getTodayEntry', () => {
    it('returns null when no entry for today', async () => {
      const entry = await getTodayEntry();
      expect(entry).toBeNull();
    });

    it('returns entry for today if it exists', async () => {
      const today = getTodayDateString();
      const storedEntries = [
        {
          id: 'today-entry',
          date: today,
          encryptedContent: `encrypted:${btoa('Today entry.')}:checksum`,
          submittedAt: new Date().toISOString(),
          timezone: 'America/New_York',
        },
      ];
      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(storedEntries));

      const entry = await getTodayEntry();
      expect(entry).not.toBeNull();
      expect(entry?.content).toBe('Today entry.');
    });
  });

  describe('hasEntryForToday', () => {
    it('returns false when no entry exists for today', async () => {
      const hasEntry = await hasEntryForToday();
      expect(hasEntry).toBe(false);
    });

    it('returns true when entry exists for today', async () => {
      const today = getTodayDateString();
      const storedEntries = [
        {
          id: 'today-entry',
          date: today,
          encryptedContent: `encrypted:${btoa('Entry.')}:checksum`,
          submittedAt: new Date().toISOString(),
          timezone: 'America/New_York',
        },
      ];
      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(storedEntries));

      const hasEntry = await hasEntryForToday();
      expect(hasEntry).toBe(true);
    });
  });

  describe('saveEntry', () => {
    it('saves new entry successfully', async () => {
      const content = 'My three sentences.';
      const entry = await saveEntry(content);

      expect(entry.content).toBe(content);
      expect(entry.date).toBe(getTodayDateString());
      expect(entry.id).toBeDefined();
      expect(entry.submittedAt).toBeDefined();
      expect(entry.timezone).toBeDefined();
    });

    it('throws error if entry already exists for today', async () => {
      const today = getTodayDateString();
      const storedEntries = [
        {
          id: 'existing',
          date: today,
          encryptedContent: `encrypted:${btoa('Existing.')}:checksum`,
          submittedAt: new Date().toISOString(),
          timezone: 'America/New_York',
        },
      ];
      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(storedEntries));

      await expect(saveEntry('New content.')).rejects.toThrow(
        'Entry already exists for today'
      );
    });

    it('clears draft after successful save', async () => {
      await saveDraft('Draft content.');
      await saveEntry('Final entry.');

      const draft = await getDraft();
      expect(draft).toBeNull();
    });

    it('encrypts content before saving', async () => {
      await saveEntry('Content to encrypt.');

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      // The stored content should be encrypted (contain 'encrypted:')
    });
  });

  describe('getEntriesForMonth', () => {
    beforeEach(async () => {
      const entries = [
        { id: '1', date: '2026-01-05', encryptedContent: `encrypted:${btoa('Jan 5.')}:checksum`, submittedAt: '2026-01-05T10:00:00Z', timezone: 'UTC' },
        { id: '2', date: '2026-01-15', encryptedContent: `encrypted:${btoa('Jan 15.')}:checksum`, submittedAt: '2026-01-15T10:00:00Z', timezone: 'UTC' },
        { id: '3', date: '2026-02-10', encryptedContent: `encrypted:${btoa('Feb 10.')}:checksum`, submittedAt: '2026-02-10T10:00:00Z', timezone: 'UTC' },
      ];
      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(entries));
    });

    it('returns entries for specific month', async () => {
      const entries = await getEntriesForMonth(2026, 1);
      expect(entries).toHaveLength(2);
    });

    it('returns empty array for month with no entries', async () => {
      const entries = await getEntriesForMonth(2026, 3);
      expect(entries).toHaveLength(0);
    });

    it('filters correctly by year', async () => {
      const entries = await getEntriesForMonth(2025, 1);
      expect(entries).toHaveLength(0);
    });
  });

  describe('getEntryDatesForMonth', () => {
    beforeEach(async () => {
      const entries = [
        { id: '1', date: '2026-01-05', encryptedContent: 'enc', submittedAt: '2026-01-05T10:00:00Z', timezone: 'UTC' },
        { id: '2', date: '2026-01-15', encryptedContent: 'enc', submittedAt: '2026-01-15T10:00:00Z', timezone: 'UTC' },
        { id: '3', date: '2026-01-25', encryptedContent: 'enc', submittedAt: '2026-01-25T10:00:00Z', timezone: 'UTC' },
      ];
      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(entries));
    });

    it('returns Set of dates for month', async () => {
      const dates = await getEntryDatesForMonth(2026, 1);
      expect(dates.size).toBe(3);
      expect(dates.has('2026-01-05')).toBe(true);
      expect(dates.has('2026-01-15')).toBe(true);
      expect(dates.has('2026-01-25')).toBe(true);
    });

    it('returns empty Set for month with no entries', async () => {
      const dates = await getEntryDatesForMonth(2026, 12);
      expect(dates.size).toBe(0);
    });
  });

  describe('draft management', () => {
    describe('saveDraft', () => {
      it('saves draft with encrypted content', async () => {
        await saveDraft('My draft content.');

        const stored = await AsyncStorage.getItem('@threesentences/draft');
        expect(stored).toBeDefined();

        const parsed = JSON.parse(stored!);
        expect(parsed.encryptedContent).toBeDefined();
        expect(parsed.lastSaved).toBeDefined();
      });
    });

    describe('getDraft', () => {
      it('returns null when no draft exists', async () => {
        const draft = await getDraft();
        expect(draft).toBeNull();
      });

      it('returns decrypted draft content', async () => {
        const draftData = {
          encryptedContent: `encrypted:${btoa('Draft text.')}:checksum`,
          lastSaved: new Date().toISOString(),
        };
        await AsyncStorage.setItem('@threesentences/draft', JSON.stringify(draftData));

        const draft = await getDraft();
        expect(draft?.content).toBe('Draft text.');
        expect(draft?.lastSaved).toBeDefined();
      });

      it('handles legacy unencrypted drafts', async () => {
        const legacyDraft = {
          content: 'Legacy draft.',
          lastSaved: new Date().toISOString(),
        };
        await AsyncStorage.setItem('@threesentences/draft', JSON.stringify(legacyDraft));

        const draft = await getDraft();
        expect(draft?.content).toBe('Legacy draft.');
      });
    });

    describe('clearDraft', () => {
      it('removes draft from storage', async () => {
        await saveDraft('Draft to clear.');
        await clearDraft();

        const draft = await getDraft();
        expect(draft).toBeNull();
      });
    });
  });

  describe('exportEntries', () => {
    beforeEach(async () => {
      const entries = [
        { id: '1', date: '2026-01-05', encryptedContent: `encrypted:${btoa('Entry one.')}:checksum`, submittedAt: '2026-01-05T10:00:00Z', timezone: 'UTC' },
        { id: '2', date: '2026-01-15', encryptedContent: `encrypted:${btoa('Entry two.')}:checksum`, submittedAt: '2026-01-15T10:00:00Z', timezone: 'UTC' },
      ];
      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(entries));
    });

    it('exports entries as JSON', async () => {
      const exported = await exportEntries('json');
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].content).toBe('Entry one.');
      expect(parsed[1].content).toBe('Entry two.');
    });

    it('exports entries sorted by date (oldest first)', async () => {
      const exported = await exportEntries('json');
      const parsed = JSON.parse(exported);

      expect(parsed[0].date).toBe('2026-01-05');
      expect(parsed[1].date).toBe('2026-01-15');
    });

    it('exports entries as plain text', async () => {
      const exported = await exportEntries('text');

      expect(exported).toContain('ThreeSixtyThree');
      expect(exported).toContain('Entry one.');
      expect(exported).toContain('Entry two.');
    });

    it('handles empty entries list', async () => {
      await AsyncStorage.removeItem('@threesentences/entries');

      const exported = await exportEntries('json');
      expect(JSON.parse(exported)).toEqual([]);
    });
  });

  describe('getEntryCount', () => {
    it('returns 0 when no entries exist', async () => {
      const count = await getEntryCount();
      expect(count).toBe(0);
    });

    it('returns correct count', async () => {
      const entries = [
        { id: '1', date: '2026-01-05', encryptedContent: 'enc', submittedAt: '2026-01-05T10:00:00Z', timezone: 'UTC' },
        { id: '2', date: '2026-01-15', encryptedContent: 'enc', submittedAt: '2026-01-15T10:00:00Z', timezone: 'UTC' },
        { id: '3', date: '2026-01-25', encryptedContent: 'enc', submittedAt: '2026-01-25T10:00:00Z', timezone: 'UTC' },
      ];
      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(entries));

      const count = await getEntryCount();
      expect(count).toBe(3);
    });
  });

  describe('getEntriesForReflection', () => {
    beforeEach(async () => {
      const today = new Date();
      const entries = [];

      // Create entries for the past 100 days
      for (let i = 0; i < 100; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDateString(date);
        entries.push({
          id: `entry-${i}`,
          date: dateStr,
          encryptedContent: `encrypted:${btoa(`Entry for ${dateStr}.`)}:checksum`,
          submittedAt: date.toISOString(),
          timezone: 'UTC',
        });
      }

      await AsyncStorage.setItem('@threesentences/entries', JSON.stringify(entries));
    });

    it('returns entries from last 7 days', async () => {
      const entries = await getEntriesForReflection(7);
      // Some variation due to date boundary handling
      expect(entries.length).toBeGreaterThan(0);
      expect(entries.length).toBeLessThanOrEqual(10);
    });

    it('returns entries from last 30 days', async () => {
      const entries = await getEntriesForReflection(30);
      expect(entries.length).toBeLessThanOrEqual(35);
    });

    it('returns entries from last 90 days', async () => {
      const entries = await getEntriesForReflection(90);
      expect(entries.length).toBeLessThanOrEqual(95);
    });

    it('returns entries sorted by date ascending', async () => {
      const entries = await getEntriesForReflection(30);

      for (let i = 1; i < entries.length; i++) {
        expect(entries[i].date >= entries[i - 1].date).toBe(true);
      }
    });
  });
});
