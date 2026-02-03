/**
 * Tests for Onboarding Store
 *
 * Manages onboarding completion state and user preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  hasCompletedOnboarding,
  completeOnboarding,
  resetOnboarding,
  getPreferences,
  updatePreferences,
  clearAllData,
} from '@/store/onboarding';

describe('onboarding store', () => {
  beforeEach(() => {
    (global as any).clearMockStorage();
    jest.clearAllMocks();
  });

  describe('hasCompletedOnboarding', () => {
    it('returns false when no onboarding state exists', async () => {
      const result = await hasCompletedOnboarding();
      expect(result).toBe(false);
    });

    it('returns false when onboarding not completed', async () => {
      const state = { hasCompleted: false };
      await AsyncStorage.setItem('@threesentences/onboarding', JSON.stringify(state));

      const result = await hasCompletedOnboarding();
      expect(result).toBe(false);
    });

    it('returns true when onboarding is completed', async () => {
      const state = { hasCompleted: true, completedAt: new Date().toISOString() };
      await AsyncStorage.setItem('@threesentences/onboarding', JSON.stringify(state));

      const result = await hasCompletedOnboarding();
      expect(result).toBe(true);
    });

    it('handles corrupted data gracefully', async () => {
      await AsyncStorage.setItem('@threesentences/onboarding', 'invalid json');

      const result = await hasCompletedOnboarding();
      expect(result).toBe(false);
    });
  });

  describe('completeOnboarding', () => {
    it('marks onboarding as completed', async () => {
      await completeOnboarding();

      const result = await hasCompletedOnboarding();
      expect(result).toBe(true);
    });

    it('stores completion timestamp', async () => {
      const before = new Date().toISOString();
      await completeOnboarding();
      const after = new Date().toISOString();

      const stored = await AsyncStorage.getItem('@threesentences/onboarding');
      const state = JSON.parse(stored!);

      expect(state.completedAt).toBeDefined();
      expect(state.completedAt >= before).toBe(true);
      expect(state.completedAt <= after).toBe(true);
    });

    it('can be called multiple times', async () => {
      await completeOnboarding();
      await completeOnboarding();

      const result = await hasCompletedOnboarding();
      expect(result).toBe(true);
    });
  });

  describe('resetOnboarding', () => {
    it('resets onboarding state', async () => {
      await completeOnboarding();
      expect(await hasCompletedOnboarding()).toBe(true);

      await resetOnboarding();
      expect(await hasCompletedOnboarding()).toBe(false);
    });

    it('handles reset when no state exists', async () => {
      await resetOnboarding();
      const result = await hasCompletedOnboarding();
      expect(result).toBe(false);
    });
  });

  describe('getPreferences', () => {
    it('returns default preferences when none exist', async () => {
      const prefs = await getPreferences();

      expect(prefs.aiReflectionEnabled).toBe(false);
      expect(prefs.theme).toBeNull();
    });

    it('returns stored preferences', async () => {
      const stored = { aiReflectionEnabled: true, theme: 'dark' };
      await AsyncStorage.setItem('@threesentences/preferences', JSON.stringify(stored));

      const prefs = await getPreferences();
      expect(prefs.aiReflectionEnabled).toBe(true);
      expect(prefs.theme).toBe('dark');
    });

    it('merges stored preferences with defaults', async () => {
      // Store only partial preferences
      const stored = { aiReflectionEnabled: true };
      await AsyncStorage.setItem('@threesentences/preferences', JSON.stringify(stored));

      const prefs = await getPreferences();
      expect(prefs.aiReflectionEnabled).toBe(true);
      expect(prefs.theme).toBeNull(); // Default value
    });

    it('handles corrupted data gracefully', async () => {
      await AsyncStorage.setItem('@threesentences/preferences', 'invalid json');

      const prefs = await getPreferences();
      expect(prefs.aiReflectionEnabled).toBe(false);
      expect(prefs.theme).toBeNull();
    });
  });

  describe('updatePreferences', () => {
    it('updates single preference', async () => {
      const updated = await updatePreferences({ aiReflectionEnabled: true });

      expect(updated.aiReflectionEnabled).toBe(true);
      expect(updated.theme).toBeNull();
    });

    it('updates multiple preferences', async () => {
      const updated = await updatePreferences({
        aiReflectionEnabled: true,
        theme: 'dark',
      });

      expect(updated.aiReflectionEnabled).toBe(true);
      expect(updated.theme).toBe('dark');
    });

    it('persists changes', async () => {
      await updatePreferences({ aiReflectionEnabled: true });

      const prefs = await getPreferences();
      expect(prefs.aiReflectionEnabled).toBe(true);
    });

    it('preserves existing preferences when updating partial', async () => {
      await updatePreferences({ aiReflectionEnabled: true });
      await updatePreferences({ theme: 'dark' });

      const prefs = await getPreferences();
      expect(prefs.aiReflectionEnabled).toBe(true);
      expect(prefs.theme).toBe('dark');
    });

    it('returns the updated preferences', async () => {
      const initial = await getPreferences();
      expect(initial.aiReflectionEnabled).toBe(false);

      const updated = await updatePreferences({ aiReflectionEnabled: true });
      expect(updated.aiReflectionEnabled).toBe(true);
    });
  });

  describe('clearAllData', () => {
    it('clears all app data', async () => {
      // Set up various data
      await completeOnboarding();
      await updatePreferences({ aiReflectionEnabled: true });
      await AsyncStorage.setItem('@threesentences/entries', '[]');
      await AsyncStorage.setItem('@threesentences/draft', '{}');
      await AsyncStorage.setItem('@threesentences/reflections', '[]');

      await clearAllData();

      // All app data should be cleared
      expect(await AsyncStorage.getItem('@threesentences/onboarding')).toBeNull();
      expect(await AsyncStorage.getItem('@threesentences/preferences')).toBeNull();
      expect(await AsyncStorage.getItem('@threesentences/entries')).toBeNull();
      expect(await AsyncStorage.getItem('@threesentences/draft')).toBeNull();
      expect(await AsyncStorage.getItem('@threesentences/reflections')).toBeNull();
    });

    it('only clears app-specific keys', async () => {
      await AsyncStorage.setItem('@threesentences/entries', '[]');
      await AsyncStorage.setItem('@other_app/data', 'should remain');

      await clearAllData();

      expect(await AsyncStorage.getItem('@threesentences/entries')).toBeNull();
      expect(await AsyncStorage.getItem('@other_app/data')).toBe('should remain');
    });

    it('handles empty storage gracefully', async () => {
      await clearAllData();
      // Should not throw
      expect(await hasCompletedOnboarding()).toBe(false);
    });
  });
});
