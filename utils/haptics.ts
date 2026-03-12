/**
 * Three™ - Haptics Utility
 *
 * Respects user preference for haptic feedback.
 */

import * as Haptics from 'expo-haptics';
import { getPreferences } from '@/store/onboarding';

let cachedEnabled: boolean | null = null;

/** Refresh the cached preference (call on app start or settings change) */
export async function refreshHapticsPreference(): Promise<void> {
  const prefs = await getPreferences();
  cachedEnabled = prefs.hapticsEnabled;
}

async function isEnabled(): Promise<boolean> {
  if (cachedEnabled === null) {
    await refreshHapticsPreference();
  }
  return cachedEnabled !== false;
}

export async function triggerImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
): Promise<void> {
  if (await isEnabled()) {
    await Haptics.impactAsync(style);
  }
}

export async function triggerNotification(
  type: Haptics.NotificationFeedbackType
): Promise<void> {
  if (await isEnabled()) {
    await Haptics.notificationAsync(type);
  }
}

export async function triggerSelection(): Promise<void> {
  if (await isEnabled()) {
    await Haptics.selectionAsync();
  }
}
