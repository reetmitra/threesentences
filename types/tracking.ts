/**
 * Three™ - Tracking types
 *
 * Private per-user settings (day rollover + tracker switches).
 */

import { DEFAULT_DAY_ROLLOVER_HOUR } from '@/types/entry';

export interface TrackerSettings {
  habits: boolean;
  mood: boolean;
}

export interface UserSettings {
  dayRolloverHour: number;
  trackers: TrackerSettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  dayRolloverHour: DEFAULT_DAY_ROLLOVER_HOUR,
  trackers: { habits: true, mood: true },
};

export interface DbUserSettings {
  user_id: string;
  day_rollover_hour: number;
  trackers: unknown;
  updated_at: string;
}

function isValidHour(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 6;
}

/** Fill any missing/invalid field from defaults. */
export function mapToUserSettings(row: DbUserSettings | null | undefined): UserSettings {
  const t = row?.trackers;
  const obj = t && typeof t === 'object' ? (t as Record<string, unknown>) : {};
  return {
    dayRolloverHour: isValidHour(row?.day_rollover_hour)
      ? row.day_rollover_hour
      : DEFAULT_SETTINGS.dayRolloverHour,
    trackers: {
      habits: typeof obj.habits === 'boolean' ? obj.habits : DEFAULT_SETTINGS.trackers.habits,
      mood: typeof obj.mood === 'boolean' ? obj.mood : DEFAULT_SETTINGS.trackers.mood,
    },
  };
}
