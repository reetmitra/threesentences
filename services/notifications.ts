/**
 * Three™ - Push Notification Service
 *
 * Handles permission requests, daily reminders, and streak warnings.
 * Uses local scheduling (no server push needed).
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const DAILY_REMINDER_ID = 'daily-reminder';
const STREAK_WARNING_ID = 'streak-warning';

/** Request notification permissions. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Check if notifications are permitted */
export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule a daily reminder notification at a specific time.
 * Cancels any existing daily reminder first.
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  // Cancel existing daily reminder
  await cancelDailyReminder();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Three Sentences',
      body: 'Take a moment to write your three sentences today.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
    identifier: DAILY_REMINDER_ID,
  });
}

/** Cancel the daily reminder */
export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {
    // Ignore if no notification with this ID exists
  });
}

/**
 * Schedule a streak warning for late evening if user hasn't written yet.
 * Call this on app open; cancel when user submits an entry.
 */
export async function scheduleStreakWarning(): Promise<void> {
  await cancelStreakWarning();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Don\'t break the chain',
      body: 'You haven\'t written today. Three sentences is all it takes.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
    identifier: STREAK_WARNING_ID,
  });
}

/** Cancel the streak warning */
export async function cancelStreakWarning(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(STREAK_WARNING_ID).catch(() => {
    // Ignore if no notification with this ID exists
  });
}

/** Cancel all scheduled notifications */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Configure notification handler (call in app root) */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
