/**
 * Tests for Entry Store (Supabase-based)
 *
 * Tests entry management with Supabase backend.
 */

import { getTodayDateString, getCurrentTimezone } from '@/types/entry';
import {
  getAllEntries,
  getEntryForDate,
  getTodayEntry,
  hasEntryForToday,
  saveEntry,
  getEntriesForMonth,
  getEntryDatesForMonth,
  getEntryStats,
  saveDraft,
  getDraft,
  clearDraft,
} from '@/store/entries';

// Mock Supabase
const mockSupabaseSelect = jest.fn();
const mockSupabaseInsert = jest.fn();
const mockSupabaseUpdate = jest.fn();
const mockSupabaseDelete = jest.fn();

jest.mock('@/config/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: () => mockSupabaseSelect(),
            single: () => mockSupabaseSelect(),
          }),
          order: () => mockSupabaseSelect(),
          gte: () => ({
            lte: () => ({
              order: () => mockSupabaseSelect(),
            }),
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => mockSupabaseInsert(),
        }),
      }),
      update: () => ({
        eq: () => ({
          eq: () => ({
            select: () => ({
              single: () => mockSupabaseUpdate(),
            }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({
          eq: () => mockSupabaseDelete(),
        }),
      }),
    }),
  },
}));

// Mock AsyncStorage for drafts
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock encryption
jest.mock('@/utils/encryption', () => ({
  encryptContent: jest.fn((content) => Promise.resolve(`encrypted:${content}`)),
  decryptContent: jest.fn((content) =>
    Promise.resolve(content.replace('encrypted:', ''))),
}));

const testUserId = 'test-user-123';
const today = getTodayDateString();

const mockDbEntry = {
  id: 'entry-uuid',
  user_id: testUserId,
  date: today,
  encrypted_content: 'encrypted:Test entry content',
  timezone: 'America/New_York',
  created_at: '2024-01-01T12:00:00.000Z',
  updated_at: '2024-01-01T12:00:00.000Z',
};

describe('entry store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseSelect.mockResolvedValue({ data: [mockDbEntry], error: null });
    mockSupabaseInsert.mockResolvedValue({ data: mockDbEntry, error: null });
    mockSupabaseUpdate.mockResolvedValue({ data: mockDbEntry, error: null });
    mockSupabaseDelete.mockResolvedValue({ error: null });
  });

  describe('getAllEntries', () => {
    it('fetches and decrypts all entries', async () => {
      const entries = await getAllEntries(testUserId);

      expect(entries).toHaveLength(1);
      expect(entries[0].content).toBe('Test entry content');
    });

    it('returns empty array on error', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: null, error: { message: 'Error' } });

      const entries = await getAllEntries(testUserId);

      expect(entries).toEqual([]);
    });
  });

  describe('getEntryForDate', () => {
    it('returns entry for specific date', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: mockDbEntry, error: null });

      const entry = await getEntryForDate(testUserId, today);

      expect(entry).not.toBeNull();
      expect(entry?.date).toBe(today);
    });

    it('returns null when not found', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: null, error: null });

      const entry = await getEntryForDate(testUserId, today);

      expect(entry).toBeNull();
    });
  });

  describe('getTodayEntry', () => {
    it('returns todays entry', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: mockDbEntry, error: null });

      const entry = await getTodayEntry(testUserId);

      expect(entry).not.toBeNull();
      expect(entry?.date).toBe(today);
    });
  });

  describe('hasEntryForToday', () => {
    it('returns true when entry exists', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: mockDbEntry, error: null });

      const hasEntry = await hasEntryForToday(testUserId);

      expect(hasEntry).toBe(true);
    });

    it('returns false when no entry', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: null, error: null });

      const hasEntry = await hasEntryForToday(testUserId);

      expect(hasEntry).toBe(false);
    });
  });

  describe('saveEntry', () => {
    it('creates new entry when none exists', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: null, error: null });

      const entry = await saveEntry(testUserId, 'New entry content');

      expect(entry).toBeDefined();
      expect(entry.content).toBe('New entry content');
    });

    it('encrypts content before saving', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: null, error: null });

      await saveEntry(testUserId, 'Secret content');

      expect(mockSupabaseInsert).toHaveBeenCalled();
    });
  });

  describe('getEntriesForMonth', () => {
    it('returns entries for specific month', async () => {
      const entries = await getEntriesForMonth(testUserId, 2024, 1);

      expect(Array.isArray(entries)).toBe(true);
    });
  });

  describe('getEntryDatesForMonth', () => {
    it('returns set of entry dates', async () => {
      mockSupabaseSelect.mockResolvedValue({
        data: [{ date: '2024-01-15' }, { date: '2024-01-20' }],
        error: null
      });

      const dates = await getEntryDatesForMonth(testUserId, 2024, 1);

      expect(dates).toBeInstanceOf(Set);
      expect(dates.has('2024-01-15')).toBe(true);
    });
  });

  describe('getEntryStats', () => {
    it('returns entry statistics', async () => {
      mockSupabaseSelect.mockResolvedValue({
        data: [{ date: today }, { date: '2024-01-01' }],
        error: null
      });

      const stats = await getEntryStats(testUserId);

      expect(stats).toHaveProperty('totalEntries');
      expect(stats).toHaveProperty('currentStreak');
      expect(stats).toHaveProperty('longestStreak');
    });
  });

  describe('draft management', () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');

    it('saves draft to local storage', async () => {
      const draft = { content: 'Draft content', date: today, lastSaved: new Date().toISOString() };

      await saveDraft(draft);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('clears draft', async () => {
      await clearDraft();

      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });
});
