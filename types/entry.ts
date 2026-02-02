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
}

/**
 * Helper to get today's date in YYYY-MM-DD format
 * Uses local timezone
 */
export function getTodayDateString(): string {
  const now = new Date();
  return formatDateString(now);
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
