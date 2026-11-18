/**
 * Three™ - Export builders (pure; no store imports)
 */

import { Entry } from '@/types/entry';
import { Habit, HabitAnswers, MOOD_LABELS, MoodValue, UserSettings } from '@/types/tracking';

export interface DayTracking {
  mood: MoodValue | null;
  answers: HabitAnswers;
}

/** A habit as exported: includes archived ones and fields the UI doesn't use. */
export interface ExportHabit extends Habit {
  archivedAt: string | null;
  link: string | null;
}

export function buildJsonExport(
  entries: Entry[],
  habits: ExportHabit[],
  days: Record<string, DayTracking>,
  settings: UserSettings,
): string {
  return JSON.stringify({ entries, habits, days, settings }, null, 2);
}

function trackingLine(habits: Habit[], day: DayTracking | undefined): string | null {
  if (!day) return null;
  const parts: string[] = [];
  if (day.mood !== null) parts.push(`Mood: ${MOOD_LABELS[day.mood]}`);
  for (const h of habits) {
    const done = day.answers[h.id];
    if (done !== undefined) parts.push(`${h.name} ${done ? '✓' : '—'}`);
  }
  return parts.length ? parts.join(' · ') : null;
}

/** Every day with an entry or tracking, newest first (like getAllEntries). */
export function buildTxtExport(
  entries: Entry[],
  habits: Habit[],
  days: Record<string, DayTracking>,
): string {
  const contentByDate = new Map(entries.map((e) => [e.date, e.content]));
  const dates = [...new Set([...contentByDate.keys(), ...Object.keys(days)])].sort().reverse();
  return dates
    .map((date) => {
      const content = contentByDate.get(date);
      const line = trackingLine(habits, days[date]);
      return `--- ${date} ---\n${content !== undefined ? `${content}\n` : ''}${line ? `${line}\n` : ''}`;
    })
    .join('\n');
}

const PAGE = 1000;

/** Fetch every row via .range() pages; throws on any error so callers never return partial data. */
export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await fetchPage(from, from + PAGE - 1);
    if (error) throw error;
    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE) return rows;
  }
}
