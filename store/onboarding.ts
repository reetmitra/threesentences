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
  HAS_LAUNCHED: '@threesentences/has_launched',
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
  hapticsEnabled: true,
  dailyPromptEnabled: false,
  notificationsEnabled: false,
  reminderHour: 20,
  reminderMinute: 0,
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

// ============ Launch Tracking ============

/**
 * Check if this is a returning user (has launched before)
 */
export async function hasLaunchedBefore(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.HAS_LAUNCHED);
    return val === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark that the app has been launched at least once
 */
export async function markFirstLaunch(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.HAS_LAUNCHED, 'true');
}

/**
 * Clear all app data (for account deletion)
 */
export async function clearAllData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const appKeys = keys.filter((k) => k.startsWith('@threesentences/'));
  await AsyncStorage.multiRemove(appKeys);
}
