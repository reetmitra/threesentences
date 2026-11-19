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

/**
 * The Patterns screen's one-line finding for the month on screen:
 * "4 of 18 nights this month · every habit kept on 2". Counts only days up to
 * `today`; empty string for a month that has not started. A month with no nights
 * says so plainly instead of "0 of 31".
 */
export function summarizeMonth(
  days: PatternDay[],
  year: number,
  month: number,
  today: string,
  showHabits: boolean,
): string {
  const { from, to } = monthRange(year, month);
  if (from > today) return '';
  const last = to < today ? to : today;
  const elapsed = parseDateString(last).getDate();
  const inScope = days.filter((d) => d.date >= from && d.date <= last);
  const written = inScope.filter((d) => d.hasEntry).length;
  const kept = showHabits ? inScope.filter(isFullHabitDay).length : 0;
  const current = to >= today;
  const monthName = parseDateString(from).toLocaleDateString('en-US', { month: 'long' });
  // "Missed days are simply empty": an empty month is stated plainly, never as "0 of 31".
  if (written === 0) return current ? 'No nights written yet this month' : `No nights written in ${monthName}`;
  const nights = `${written} of ${elapsed} ${elapsed === 1 ? 'night' : 'nights'} ${current ? 'this month' : `in ${monthName}`}`;
  return kept > 0 ? `${nights} · every habit kept on ${kept}` : nights;
}

/** Mood in words for a range with too few points to draw a line: "2 nights logged: good, okay". */
export function describeFewMoods(days: PatternDay[]): string {
  const moods = days.filter((d) => d.mood !== null).map((d) => MOOD_LABELS[d.mood as MoodValue]);
  if (moods.length === 0) return 'No mood logged yet.';
  return `${moods.length} ${moods.length === 1 ? 'night' : 'nights'} logged: ${moods.join(', ')}`;
}

export interface WeekSummary {
  nights: number;
  span: number;
  kept: number;
  answered: number;
}

/** Counts for the "Your week" card: nights written, and habit check-ins kept of those answered. */
export function summarizeWeek(days: PatternDay[]): WeekSummary {
  let kept = 0;
  let answered = 0;
  for (const d of days) {
    for (const v of Object.values(d.answers)) {
      answered++;
      if (v) kept++;
    }
  }
  return { nights: days.filter((d) => d.hasEntry).length, span: days.length, kept, answered };
}

/** One gentle question a week, for the "Your week" card. Reflective, never diagnostic. */
export const WEEK_QUESTIONS: readonly string[] = [
  'What gave you energy this week?',
  'Which night felt most like you?',
  'What did you keep showing up for?',
  'What would make next week a little easier?',
  'What helped you wind down this week?',
  'What are you proud of that nobody saw?',
  'What do you want to keep doing?',
  'What do you want to let go of?',
  'What surprised you this week?',
  'Where did your time go, and was it where you wanted it?',
  'Who did you want to talk to this week?',
  'What is one small thing you have been putting off?',
];

/**
 * The question for the Monday-to-Sunday week containing `today` (YYYY-MM-DD): the same all week,
 * a new one each Monday. Counts whole days in UTC so a DST change can't shift the week.
 */
export function questionForWeek(today: string): string {
  const [y, m, d] = today.split('-').map(Number);
  const dayNumber = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  // Day 0 (1 Jan 1970) was a Thursday; +3 makes each block of seven start on a Monday.
  const week = Math.floor((dayNumber + 3) / 7);
  return WEEK_QUESTIONS[week % WEEK_QUESTIONS.length];
}
