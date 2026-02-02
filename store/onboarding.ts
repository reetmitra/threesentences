/**
 * ThreeSixtyThree™ Three Sentences - Onboarding Store
 * 
 * Manages onboarding completion state.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingState, UserPreferences } from '@/types/entry';

const STORAGE_KEYS = {
  ONBOARDING: '@threesentences/onboarding',
  PREFERENCES: '@threesentences/preferences',
} as const;

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);
    if (!data) return false;
    const state = JSON.parse(data) as OnboardingState;
    return state.hasCompleted;
  } catch (error) {
    console.error('Failed to check onboarding state:', error);
    return false;
  }
}

/**
 * Mark onboarding as completed
 */
export async function completeOnboarding(): Promise<void> {
  const state: OnboardingState = {
    hasCompleted: true,
    completedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(state));
}

/**
 * Reset onboarding (for testing/debugging)
 */
export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING);
}

// ============ User Preferences ============

const DEFAULT_PREFERENCES: UserPreferences = {
  aiReflectionEnabled: false,
  theme: null, // Follow system
};

/**
 * Get user preferences
 */
export async function getPreferences(): Promise<UserPreferences> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!data) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  updates: Partial<UserPreferences>
): Promise<UserPreferences> {
  const current = await getPreferences();
  const updated = { ...current, ...updates };
  await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
  return updated;
}

/**
 * Clear all app data (for account deletion)
 */
export async function clearAllData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const appKeys = keys.filter((k) => k.startsWith('@threesentences/'));
  await AsyncStorage.multiRemove(appKeys);
}
