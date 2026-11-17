/**
 * Three™ - Export builders (pure; no store imports)
 */

import { Entry } from '@/types/entry';
import { Habit, HabitAnswers, MOOD_LABELS, MoodValue } from '@/types/tracking';

export interface DayTracking {
  mood: MoodValue | null;
  answers: HabitAnswers;
}

export function buildJsonExport(
  entries: Entry[],
  habits: Habit[],
  days: Record<string, DayTracking>,
): string {
  return JSON.stringify({ entries, habits, days }, null, 2);
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

export function buildTxtExport(
  entries: Entry[],
  habits: Habit[],
  days: Record<string, DayTracking>,
): string {
  return entries
    .map((e) => {
      const line = trackingLine(habits, days[e.date]);
      return `--- ${e.date} ---\n${e.content}\n${line ? `${line}\n` : ''}`;
    })
    .join('\n');
}
