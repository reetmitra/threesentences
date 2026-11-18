import { formatDateString, parseDateString } from '@/types/entry';
import { HabitAnswers, isMoodValue, MOOD_LABELS, MoodValue } from '@/types/tracking';

export type RangeDays = 7 | 30 | 90;
export const RANGE_OPTIONS: readonly RangeDays[] = [7, 30, 90];
export const DEFAULT_RANGE: RangeDays = 30;

export interface PatternDay {
  date: string;
  hasEntry: boolean;
  mood: MoodValue | null;
  answers: HabitAnswers;
}

export interface DbPatternRow {
  date: string;
  has_entry: boolean;
  mood: number | null;
  habit_answers: unknown;
}

export interface MoodPoint {
  x: number;
  y: number;
  mood: MoodValue;
  date: string;
}

export interface MoodSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function addDays(dateStr: string, n: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + n);
  return formatDateString(d);
}

function cleanAnswers(raw: unknown): HabitAnswers {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
  const out: HabitAnswers = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'boolean') out[k] = v;
  }
  return out;
}

export function mapPatternRows(rows: DbPatternRow[]): PatternDay[] {
  return rows.map((r) => ({
    date: r.date,
    hasEntry: r.has_entry,
    mood: isMoodValue(r.mood) ? r.mood : null,
    answers: cleanAnswers(r.habit_answers),
  }));
}

export function buildRange(endDate: string, days: RangeDays): { from: string; to: string } {
  return { from: addDays(endDate, -(days - 1)), to: endDate };
}

export function monthRange(year: number, month: number): { from: string; to: string } {
  return {
    from: formatDateString(new Date(year, month - 1, 1)),
    to: formatDateString(new Date(year, month, 0)),
  };
}

export function isFullHabitDay(day: PatternDay): boolean {
  const vals = Object.values(day.answers);
  return vals.length > 0 && vals.every(Boolean);
}

export function habitStats(days: PatternDay[], habitId: string): { done: number; answered: number } {
  let done = 0;
  let answered = 0;
  for (const d of days) {
    const a = d.answers[habitId];
    if (typeof a !== 'boolean') continue;
    answered++;
    if (a) done++;
  }
  return { done, answered };
}

export function moodPoints(days: PatternDay[], width: number, height: number): MoodPoint[] {
  const n = days.length;
  const pts: MoodPoint[] = [];
  days.forEach((d, i) => {
    if (d.mood === null) return;
    pts.push({
      x: ((i + 0.5) / n) * width,
      y: height - ((d.mood - 1) / 4) * height,
      mood: d.mood,
      date: d.date,
    });
  });
  return pts;
}

export function moodSegments(points: MoodPoint[]): MoodSegment[] {
  const segs: MoodSegment[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (addDays(a.date, 1) === b.date) segs.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }
  return segs;
}

export function summarizeMood(days: PatternDay[], range: RangeDays): string {
  const counts: Record<number, number> = {};
  for (const d of days) if (d.mood !== null) counts[d.mood] = (counts[d.mood] ?? 0) + 1;
  let top: MoodValue | null = null;
  for (const m of [1, 2, 3, 4, 5] as const) {
    // >= so ties resolve to the higher mood
    if (counts[m] && (top === null || counts[m] >= counts[top])) top = m;
  }
  if (top === null) return `No mood logged in the last ${range} days.`;
  const rough = counts[1] ?? 0;
  const roughPart = rough > 0 ? `, ${rough} rough ${rough === 1 ? 'day' : 'days'}` : '';
  return `Mood over ${range} days: mostly ${MOOD_LABELS[top]}${roughPart}.`;
}

export function summarizeHabit(name: string, stats: { done: number; answered: number }): string {
  if (stats.answered === 0) return `${name}: not checked in yet`;
  return `${name}: ${stats.done} of ${stats.answered} ${stats.answered === 1 ? 'day' : 'days'}`;
}
