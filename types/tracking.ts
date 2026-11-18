/**
 * Three™ - Tracking types
 *
 * Private per-user settings (day rollover + tracker switches).
 */

import { DEFAULT_DAY_ROLLOVER_HOUR } from '@/types/entry';
import { INTEREST_CATEGORIES } from '@/types/profile';

export interface TrackerSettings {
  habits: boolean;
  mood: boolean;
}

export interface UserSettings {
  dayRolloverHour: number;
  trackers: TrackerSettings;
}

/** A settings change: only the keys being changed (so concurrent toggles compose). */
export interface SettingsPatch {
  dayRolloverHour?: number;
  trackers?: Partial<TrackerSettings>;
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

// ---------------------------------------------------------------------------
// Habits & mood
// ---------------------------------------------------------------------------

export type HabitPosition = 0 | 1 | 2;

export interface Habit {
  id: string;
  name: string;
  position: HabitPosition;
  createdAt: string;
}

export interface DbHabit {
  id: string;
  user_id: string;
  name: string;
  position: number;
  link: string | null;
  created_at: string;
  archived_at: string | null;
}

export function mapToHabit(row: DbHabit): Habit {
  return {
    id: row.id,
    name: row.name,
    position: row.position as HabitPosition,
    createdAt: row.created_at,
  };
}

export const MAX_ACTIVE_HABITS = 3;
export const HABIT_NAME_MAX = 40;
export const THREE_HABITS_ERROR = 'You already have three habits.';

export const HABIT_SUGGESTIONS = [
  'In bed by 1am',
  'No alcohol',
  'No smoking',
  'Moved 20 min',
  'Read 10 pages',
  '2L water',
  'No phone in bed',
] as const;

export function validateHabitName(
  raw: string,
): { ok: true; name: string } | { ok: false; error: string } {
  const name = raw.trim();
  if (!name) return { ok: false, error: 'Give it a name.' };
  if (name.length > HABIT_NAME_MAX) return { ok: false, error: 'Keep it to 40 characters.' };
  return { ok: true, name };
}

export function nextFreeHabitPosition(active: { position: HabitPosition }[]): HabitPosition | null {
  const used = new Set(active.map((h) => h.position));
  for (const p of [0, 1, 2] as const) if (!used.has(p)) return p;
  return null;
}

export function suggestHabits(interests: string[], activeNames: string[]): string[] {
  const active = new Set(activeNames.map((n) => n.trim().toLowerCase()));
  const sleep = interests.includes('sleep-optimization');
  const fitness = interests.some(
    (id) => INTEREST_CATEGORIES.find((c) => c.id === id)?.group === 'fitness',
  );
  const rank = (s: string): number => {
    if (sleep && (s === 'In bed by 1am' || s === 'No phone in bed')) return 0;
    if (fitness && s === 'Moved 20 min') return 1;
    return 2;
  };
  // Array.sort is stable, so ties keep HABIT_SUGGESTIONS order.
  return HABIT_SUGGESTIONS.filter((s) => !active.has(s.toLowerCase())).sort(
    (a, b) => rank(a) - rank(b),
  );
}

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export const MOOD_LABELS: Record<MoodValue, string> = {
  1: 'rough',
  2: 'low',
  3: 'okay',
  4: 'good',
  5: 'great',
};

export function isMoodValue(n: unknown): n is MoodValue {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 5;
}

/** habitId -> done; a missing key means unanswered. */
export type HabitAnswers = Record<string, boolean>;

// ---------------------------------------------------------------------------
// Check-in save queue (one per mood or per habit answer, per day)
// ---------------------------------------------------------------------------

/**
 * One write in flight at a time; only the latest tap waits behind it, so
 * writes land in tap order and the last tap wins. The UI shows the latest
 * tap while a write is pending, otherwise the last value known saved.
 */
export interface SaveQueue<V> {
  confirmed: V;
  inFlight: { value: V } | null;
  queued: { value: V } | null;
}

export interface SaveStep<V> {
  queue: SaveQueue<V>;
  /** Write this value now. */
  send: { value: V } | null;
  /** True when a failure rolled the UI back to the saved value. */
  failed: boolean;
}

export function newSaveQueue<V>(confirmed: V): SaveQueue<V> {
  return { confirmed, inFlight: null, queued: null };
}

export function shownValue<V>(q: SaveQueue<V>): V {
  return (q.queued ?? q.inFlight ?? { value: q.confirmed }).value;
}

export function queueTap<V>(q: SaveQueue<V>, value: V): SaveStep<V> {
  if (q.inFlight) return { queue: { ...q, queued: { value } }, send: null, failed: false };
  return { queue: { ...q, inFlight: { value } }, send: { value }, failed: false };
}

/** The in-flight write finished; send the queued tap next, if any. */
export function settleSave<V>(q: SaveQueue<V>, ok: boolean): SaveStep<V> {
  const confirmed = ok && q.inFlight ? q.inFlight.value : q.confirmed;
  if (q.queued) {
    return { queue: { confirmed, inFlight: q.queued, queued: null }, send: q.queued, failed: false };
  }
  return { queue: newSaveQueue(confirmed), send: null, failed: !ok };
}

/**
 * A server read finished. `atStart` is the queue as it was when the read
 * began: if anything happened since, the read may predate it, so keep ours.
 */
export function applyServerValue<V>(
  current: SaveQueue<V> | undefined,
  atStart: SaveQueue<V> | undefined,
  saved: V,
): SaveQueue<V> {
  if (current && current !== atStart) return current;
  return current ? { ...current, confirmed: saved } : newSaveQueue(saved);
}
