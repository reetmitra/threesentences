/**
 * ThreeSixtyThree™ Three Sentences - Entry Types
 * 
 * Core data model for journal entries.
 * Entries are immutable after submission - this is by design.
 */

export interface Entry {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Local date in YYYY-MM-DD format */
  date: string;

  /** The three sentences - encrypted at rest */
  content: string;

  /** ISO 8601 timestamp of submission */
  submittedAt: string;

  /** IANA timezone identifier (e.g., 'America/New_York') */
  timezone: string;
}

export interface Draft {
  /** Current draft content (not yet submitted) */
  content: string;

  /** The date this draft is for (YYYY-MM-DD) */
  date: string;

  /** ISO 8601 timestamp of last auto-save */
  lastSaved: string;
}

export interface OnboardingState {
  /** Whether user has completed onboarding */
  hasCompleted: boolean;

  /** ISO 8601 timestamp of completion */
  completedAt?: string;
}

export interface UserPreferences {
  /** AI reflection feature opt-in (default: false) */
  aiReflectionEnabled: boolean;

  /** Preferred theme (null = follow system) */
  theme: 'light' | 'dark' | null;

  /** Haptic feedback enabled (default: true) */
  hapticsEnabled: boolean;

  /** Show daily writing prompt (default: false) */
  dailyPromptEnabled: boolean;

  /** Push notifications enabled (default: false) */
  notificationsEnabled: boolean;

  /** Daily reminder hour (0-23, default: 20) */
  reminderHour: number;

  /** Daily reminder minute (0-59, default: 0) */
  reminderMinute: number;
}

export const DEFAULT_DAY_ROLLOVER_HOUR = 4;
export const DAY_ROLLOVER_OPTIONS = [0, 1, 2, 3, 4, 5, 6] as const;

let dayRolloverHour: number = DEFAULT_DAY_ROLLOVER_HOUR;

/** Set the hour (0-6) at which the logical day rolls over. Invalid values are ignored. */
export function setDayRolloverHour(hour: number): void {
  if (Number.isInteger(hour) && hour >= 0 && hour <= 6) dayRolloverHour = hour;
}

export function getDayRolloverHour(): number {
  return dayRolloverHour;
}

/**
 * Logical date (YYYY-MM-DD, local timezone): times before rolloverHour
 * belong to the previous day. Subtracts hours via setHours (not ms
 * arithmetic) so DST transitions don't shift the result.
 */
export function getLogicalDateString(now: Date, rolloverHour: number): string {
  const shifted = new Date(now);
  shifted.setHours(shifted.getHours() - rolloverHour);
  return formatDateString(shifted);
}

/** Today's logical date at the configured rollover hour. */
export function getTodayDateString(now: Date = new Date()): string {
  return getLogicalDateString(now, dayRolloverHour);
}

export function formatRolloverLabel(hour: number): string {
  return hour === 0 ? 'midnight' : `${hour}am`;
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get current IANA timezone
 */
export function getCurrentTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
