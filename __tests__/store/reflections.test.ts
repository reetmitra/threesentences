/**
 * Tests for Reflections Store
 *
 * Per PRD FR-AI-07: User can delete all AI-generated reflections independently
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllReflections,
  saveReflection,
  getLatestReflection,
  deleteReflection,
  deleteAllReflections,
  getReflectionCount,
} from '@/store/reflections';
import { Reflection } from '@/services/aiReflection';

describe('reflections store', () => {
  beforeEach(() => {
    (global as any).clearMockStorage();
    jest.clearAllMocks();
  });

  const createMockReflection = (overrides?: Partial<Reflection>): Reflection => ({
    id: `reflection-${Date.now()}-${Math.random()}`,
    generatedAt: new Date().toISOString(),
    timeRange: 7,
    content: 'Test reflection content.',
    entriesAnalyzed: 5,
    hasCrisisIndicators: false,
    ...overrides,
  });

  describe('getAllReflections', () => {
    it('returns empty array when no reflections exist', async () => {
      const reflections = await getAllReflections();
      expect(reflections).toEqual([]);
    });

    it('returns all stored reflections', async () => {
      const stored = [
        createMockReflection({ id: 'ref-1' }),
        createMockReflection({ id: 'ref-2' }),
      ];
      await AsyncStorage.setItem('@threesentences/reflections', JSON.stringify(stored));

      const reflections = await getAllReflections();
      expect(reflections).toHaveLength(2);
      expect(reflections[0].id).toBe('ref-1');
      expect(reflections[1].id).toBe('ref-2');
    });

    it('handles corrupted data gracefully', async () => {
      await AsyncStorage.setItem('@threesentences/reflections', 'invalid json');

      const reflections = await getAllReflections();
      expect(reflections).toEqual([]);
    });
  });

  describe('saveReflection', () => {
    it('saves a new reflection', async () => {
      const reflection = createMockReflection({ id: 'new-reflection' });
      await saveReflection(reflection);

      const reflections = await getAllReflections();
      expect(reflections).toHaveLength(1);
      expect(reflections[0].id).toBe('new-reflection');
    });

    it('appends to existing reflections', async () => {
      const reflection1 = createMockReflection({ id: 'ref-1' });
      const reflection2 = createMockReflection({ id: 'ref-2' });

      await saveReflection(reflection1);
      await saveReflection(reflection2);

      const reflections = await getAllReflections();
      expect(reflections).toHaveLength(2);
    });

    it('preserves reflection properties', async () => {
      const reflection = createMockReflection({
        id: 'test-id',
        timeRange: 30,
        content: 'Specific content.',
        entriesAnalyzed: 10,
        hasCrisisIndicators: false,
      });
      await saveReflection(reflection);

      const reflections = await getAllReflections();
      expect(reflections[0]).toEqual(reflection);
    });
  });

  describe('getLatestReflection', () => {
    it('returns null when no reflections exist', async () => {
      const latest = await getLatestReflection();
      expect(latest).toBeNull();
    });

    it('returns the most recent reflection', async () => {
      const older = createMockReflection({
        id: 'older',
        generatedAt: '2026-01-01T10:00:00.000Z',
      });
      const newer = createMockReflection({
        id: 'newer',
        generatedAt: '2026-01-15T10:00:00.000Z',
      });
      const newest = createMockReflection({
        id: 'newest',
        generatedAt: '2026-01-20T10:00:00.000Z',
      });

      // Save in random order
      await saveReflection(newer);
      await saveReflection(older);
      await saveReflection(newest);

      const latest = await getLatestReflection();
      expect(latest?.id).toBe('newest');
    });

    it('handles single reflection', async () => {
      const reflection = createMockReflection({ id: 'only-one' });
      await saveReflection(reflection);

      const latest = await getLatestReflection();
      expect(latest?.id).toBe('only-one');
    });
  });

  describe('deleteReflection', () => {
    it('deletes specific reflection by ID', async () => {
      const ref1 = createMockReflection({ id: 'keep-this' });
      const ref2 = createMockReflection({ id: 'delete-this' });
      const ref3 = createMockReflection({ id: 'also-keep' });

      await saveReflection(ref1);
      await saveReflection(ref2);
      await saveReflection(ref3);

      await deleteReflection('delete-this');

      const reflections = await getAllReflections();
      expect(reflections).toHaveLength(2);
      expect(reflections.find((r) => r.id === 'delete-this')).toBeUndefined();
      expect(reflections.find((r) => r.id === 'keep-this')).toBeDefined();
      expect(reflections.find((r) => r.id === 'also-keep')).toBeDefined();
    });

    it('handles deleting non-existent ID', async () => {
      const reflection = createMockReflection({ id: 'existing' });
      await saveReflection(reflection);

      await deleteReflection('non-existent');

      const reflections = await getAllReflections();
      expect(reflections).toHaveLength(1);
    });

    it('handles deleting from empty list', async () => {
      await deleteReflection('any-id');

      const reflections = await getAllReflections();
      expect(reflections).toEqual([]);
    });
  });

  describe('deleteAllReflections', () => {
    it('removes all reflections', async () => {
      await saveReflection(createMockReflection({ id: 'ref-1' }));
      await saveReflection(createMockReflection({ id: 'ref-2' }));
      await saveReflection(createMockReflection({ id: 'ref-3' }));

      await deleteAllReflections();

      const reflections = await getAllReflections();
      expect(reflections).toEqual([]);
    });

    it('handles deleting when no reflections exist', async () => {
      await deleteAllReflections();

      const reflections = await getAllReflections();
      expect(reflections).toEqual([]);
    });

    it('per PRD FR-AI-07: user can delete all reflections independently', async () => {
      // Set up entries and reflections
      await AsyncStorage.setItem('@threesentences/entries', '[{"id": "entry-1"}]');
      await saveReflection(createMockReflection());

      await deleteAllReflections();

      // Entries should still exist
      const entries = await AsyncStorage.getItem('@threesentences/entries');
      expect(entries).toBe('[{"id": "entry-1"}]');

      // Reflections should be gone
      const reflections = await getAllReflections();
      expect(reflections).toEqual([]);
    });
  });

  describe('getReflectionCount', () => {
    it('returns 0 when no reflections exist', async () => {
      const count = await getReflectionCount();
      expect(count).toBe(0);
    });

    it('returns correct count', async () => {
      await saveReflection(createMockReflection({ id: 'ref-1' }));
      await saveReflection(createMockReflection({ id: 'ref-2' }));
      await saveReflection(createMockReflection({ id: 'ref-3' }));

      const count = await getReflectionCount();
      expect(count).toBe(3);
    });

    it('updates count after deletion', async () => {
      await saveReflection(createMockReflection({ id: 'ref-1' }));
      await saveReflection(createMockReflection({ id: 'ref-2' }));

      expect(await getReflectionCount()).toBe(2);

      await deleteReflection('ref-1');

      expect(await getReflectionCount()).toBe(1);
    });
  });
});
