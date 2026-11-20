import {
  buildRange,
  habitStats,
  isFullHabitDay,
  mapPatternRows,
  questionForWeek,
  summarizeWeek,
  WEEK_QUESTIONS,
  monthRange,
  moodPoints,
  moodSegments,
  describeFewMoods,
  summarizeHabit,
  summarizeMood,
  summarizeMonth,
  PatternDay,
} from '@/types/patterns';
import { parseDateString } from '@/types/entry';

const day = (date: string, mood: PatternDay['mood'] = null, answers: PatternDay['answers'] = {}): PatternDay => ({
  date,
  hasEntry: true,
  mood,
  answers,
});

function inclusiveCount(from: string, to: string): number {
  const d = parseDateString(from);
  const end = parseDateString(to);
  let n = 0;
  while (d <= end) {
    n++;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

describe('buildRange', () => {
  it('crosses the DST start', () => {
    expect(buildRange('2026-03-10', 7)).toEqual({ from: '2026-03-04', to: '2026-03-10' });
  });
  it('crosses the DST end (fall-back night, Nov 1)', () => {
    expect(buildRange('2026-11-03', 7)).toEqual({ from: '2026-10-28', to: '2026-11-03' });
  });
  it('crosses a year boundary', () => {
    expect(buildRange('2027-01-02', 7).from).toBe('2026-12-27');
  });
  it.each([30, 90] as const)('spans exactly %i dates', (n) => {
    const { from, to } = buildRange('2026-03-10', n);
    expect(to).toBe('2026-03-10');
    expect(inclusiveCount(from, to)).toBe(n);
  });
});

describe('monthRange', () => {
  it('handles leap February', () => {
    expect(monthRange(2028, 2)).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });
  it('handles December', () => {
    expect(monthRange(2026, 12).to).toBe('2026-12-31');
  });
});

describe('mapPatternRows', () => {
  it('drops invalid moods and non-boolean answers', () => {
    const rows = [0, 6, '3', 4].map((mood, i) => ({
      date: `2026-03-0${i + 1}`,
      has_entry: true,
      mood: mood as number,
      habit_answers: { h1: true, h2: 'yes' },
    }));
    const out = mapPatternRows(rows);
    expect(out.map((d) => d.mood)).toEqual([null, null, null, 4]);
    expect(out[0].answers).toEqual({ h1: true });
  });
  it('tolerates non-object answers', () => {
    const out = mapPatternRows([
      { date: '2026-03-01', has_entry: false, mood: null, habit_answers: null },
      { date: '2026-03-02', has_entry: false, mood: null, habit_answers: [true] },
    ]);
    expect(out.map((d) => d.answers)).toEqual([{}, {}]);
  });
});

describe('isFullHabitDay', () => {
  it('needs at least one answer and all true', () => {
    expect(isFullHabitDay(day('2026-03-01', null, {}))).toBe(false);
    expect(isFullHabitDay(day('2026-03-01', null, { a: true, b: false }))).toBe(false);
    expect(isFullHabitDay(day('2026-03-01', null, { a: true }))).toBe(true);
  });
});

describe('habitStats', () => {
  it('ignores answers for other habits', () => {
    const days = [day('2026-03-01', null, { x: true }), day('2026-03-02', null, { h1: true }), day('2026-03-03', null, { h1: false })];
    expect(habitStats(days, 'h1')).toEqual({ done: 1, answered: 2 });
  });
  it('is zero for no days', () => {
    expect(habitStats([], 'h1')).toEqual({ done: 0, answered: 0 });
  });
});

describe('moodPoints', () => {
  it('is empty for no days', () => {
    expect(moodPoints([], 300, 100)).toEqual([]);
  });
  it('centres a single day', () => {
    expect(moodPoints([day('2026-03-01', 3)], 300, 100)).toEqual([
      { x: 150, y: 50, mood: 3, date: '2026-03-01' },
    ]);
  });
  it('maps 1 to bottom and 5 to top, skipping null', () => {
    const pts = moodPoints([day('2026-03-01', 1), day('2026-03-02'), day('2026-03-03', 5)], 300, 100);
    expect(pts.map((p) => p.y)).toEqual([100, 0]);
    expect(pts.map((p) => p.x)).toEqual([50, 250]);
  });
  it('never produces NaN', () => {
    const pts = moodPoints([day('2026-03-01', 2)], 0, 0);
    pts.forEach((p) => {
      expect(Number.isNaN(p.x)).toBe(false);
      expect(Number.isNaN(p.y)).toBe(false);
    });
  });
});

describe('moodSegments', () => {
  it('joins only consecutive dates', () => {
    // Mon, Tue, Thu
    const pts = moodPoints([day('2026-03-02', 3), day('2026-03-03', 4), day('2026-03-04'), day('2026-03-05', 2)], 400, 100);
    expect(moodSegments(pts)).toHaveLength(1);
    expect(moodSegments(pts)[0]).toEqual({ x1: pts[0].x, y1: pts[0].y, x2: pts[1].x, y2: pts[1].y });
  });
  it('joins across the DST boundary', () => {
    const pts = moodPoints([day('2026-03-07', 3), day('2026-03-08', 3), day('2026-03-09', 3)], 300, 100);
    expect(moodSegments(pts)).toHaveLength(2);
  });
});

describe('summarizeMood', () => {
  it('names the most common mood and rough days', () => {
    const days = [day('2026-03-01', 3), day('2026-03-02', 3), day('2026-03-03', 1), day('2026-03-04', 1), day('2026-03-05', 4)];
    expect(summarizeMood(days, 30)).toBe('Mood over 30 days: mostly okay, 2 rough days.');
  });
  it('omits rough count when none, ties go higher', () => {
    expect(summarizeMood([day('2026-03-01', 3), day('2026-03-02', 4)], 7)).toBe('Mood over 7 days: mostly good.');
  });
  it('handles no moods', () => {
    expect(summarizeMood([day('2026-03-01')], 30)).toBe('No mood logged in the last 30 days.');
  });
});

describe('summarizeHabit', () => {
  it('uses days answered as denominator', () => {
    expect(summarizeHabit('In bed by 1am', { done: 4, answered: 7 })).toBe('In bed by 1am: 4 of 7 days');
  });
  it('handles no answers', () => {
    expect(summarizeHabit('In bed by 1am', { done: 0, answered: 0 })).toBe('In bed by 1am: not checked in yet');
  });
});

// One row per day of the month up to `last`, like get_patterns returns.
function monthRows(year: number, month: number, last: number, opts: { entries?: number[]; full?: number[] } = {}): PatternDay[] {
  const pad = (n: number) => String(n).padStart(2, '0');
  return Array.from({ length: last }, (_, i) => {
    const d = i + 1;
    return {
      date: `${year}-${pad(month)}-${pad(d)}`,
      hasEntry: (opts.entries ?? []).includes(d),
      mood: null,
      answers: ((opts.full ?? []).includes(d) ? { h1: true, h2: true } : {}) as PatternDay['answers'],
    };
  });
}

describe('summarizeMonth', () => {
  it('states the finding for the current month: nights written of nights so far, habits kept', () => {
    const days = monthRows(2026, 11, 18, { entries: [1, 2, 5, 9], full: [2, 9] });
    expect(summarizeMonth(days, 2026, 11, '2026-11-18', true)).toBe('4 of 18 nights this month · every habit kept on 2');
  });
  it('omits the habits clause when none were kept or Habits is off', () => {
    const days = monthRows(2026, 11, 18, { entries: [1, 2, 5, 9], full: [2, 9] });
    expect(summarizeMonth(days, 2026, 11, '2026-11-18', false)).toBe('4 of 18 nights this month');
    expect(summarizeMonth(monthRows(2026, 11, 18, { entries: [3] }), 2026, 11, '2026-11-18', true)).toBe('1 of 18 nights this month');
  });
  it('names a past month and counts all of its days', () => {
    const days = monthRows(2026, 10, 31, { entries: [1, 2, 3] });
    expect(summarizeMonth(days, 2026, 10, '2026-11-18', true)).toBe('3 of 31 nights in October');
  });
  it('counts a month still in progress only up to today, ignoring later rows', () => {
    const days = monthRows(2026, 11, 30, { entries: [1, 20, 25] }); // 20 and 25 are after today
    expect(summarizeMonth(days, 2026, 11, '2026-11-18', true)).toBe('1 of 18 nights this month');
  });
  it('is singular on day one', () => {
    expect(summarizeMonth(monthRows(2026, 11, 1, { entries: [1] }), 2026, 11, '2026-11-01', true)).toBe('1 of 1 night this month');
  });
  it('says an empty month plainly, never "0 of N"', () => {
    expect(summarizeMonth(monthRows(2026, 11, 1), 2026, 11, '2026-11-01', true)).toBe('No nights written yet this month');
    expect(summarizeMonth(monthRows(2026, 10, 31), 2026, 10, '2026-11-18', true)).toBe('No nights written in October');
  });
  it('is still "this month" on the last day of the month', () => {
    expect(summarizeMonth(monthRows(2026, 11, 30, { entries: [30] }), 2026, 11, '2026-11-30', true)).toBe('1 of 30 nights this month');
  });
  it('is empty for a month that has not started', () => {
    expect(summarizeMonth([], 2026, 12, '2026-11-18', true)).toBe('');
  });
  it('is correct across the DST start (Mar 8) and end (Nov 1) months', () => {
    expect(summarizeMonth(monthRows(2026, 3, 10, { entries: [7, 8, 9] }), 2026, 3, '2026-03-10', true)).toBe('3 of 10 nights this month');
    expect(summarizeMonth(monthRows(2026, 11, 3, { entries: [1, 2] }), 2026, 11, '2026-11-03', true)).toBe('2 of 3 nights this month');
  });
  it('ignores rows from outside the month', () => {
    const days = [...monthRows(2026, 10, 31, { entries: [30, 31] }), ...monthRows(2026, 11, 5, { entries: [1] })];
    expect(summarizeMonth(days, 2026, 11, '2026-11-05', true)).toBe('1 of 5 nights this month');
  });
});

describe('describeFewMoods', () => {
  it('says nothing logged when empty', () => {
    expect(describeFewMoods([day('2026-03-01')])).toBe('No mood logged yet.');
  });
  it('names a single night', () => {
    expect(describeFewMoods([day('2026-03-01', 4)])).toBe('1 night logged: good');
  });
  it('lists the moods in date order', () => {
    expect(describeFewMoods([day('2026-03-01', 4), day('2026-03-02'), day('2026-03-03', 3)])).toBe('2 nights logged: good, okay');
  });
});

describe('summarizeWeek', () => {
  const d = (date: string, hasEntry: boolean, answers: PatternDay['answers'] = {}): PatternDay => ({ date, hasEntry, mood: null, answers });

  it('counts nights written and habit check-ins kept of those answered', () => {
    const days = [
      d('2026-11-12', true, { a: true, b: true }),
      d('2026-11-13', false),
      d('2026-11-14', true, { a: true, b: false }),
      d('2026-11-15', true, { a: false }),
    ];
    expect(summarizeWeek(days)).toEqual({ nights: 3, span: 4, kept: 3, answered: 5 });
  });
  it('is all zeros for an empty week', () => {
    expect(summarizeWeek([])).toEqual({ nights: 0, span: 0, kept: 0, answered: 0 });
  });
  it('does not count unanswered habits as missed', () => {
    expect(summarizeWeek([d('2026-11-12', true, {})])).toEqual({ nights: 1, span: 1, kept: 0, answered: 0 });
  });
});

describe('questionForWeek', () => {
  it('has enough distinct questions that a quarter does not repeat', () => {
    expect(WEEK_QUESTIONS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(WEEK_QUESTIONS).size).toBe(WEEK_QUESTIONS.length);
  });
  it('is the same from Monday to Sunday and changes on the next Monday', () => {
    const week = ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'];
    const qs = week.map(questionForWeek);
    expect(new Set(qs).size).toBe(1);
    expect(questionForWeek('2026-11-16')).not.toBe(qs[0]);
  });
  it('holds across the DST fall-back weekend (Sun Nov 1 2026, week of Oct 26)', () => {
    expect(questionForWeek('2026-10-26')).toBe(questionForWeek('2026-11-01'));
    expect(questionForWeek('2026-11-02')).not.toBe(questionForWeek('2026-11-01'));
  });
  it('holds across the DST spring-forward weekend (Sun Mar 8 2026, week of Mar 2)', () => {
    expect(questionForWeek('2026-03-02')).toBe(questionForWeek('2026-03-08'));
    expect(questionForWeek('2026-03-09')).not.toBe(questionForWeek('2026-03-08'));
  });
  it('cycles through every question before repeating and wraps cleanly over a year end', () => {
    const seen = new Set<string>();
    for (let w = 0; w < WEEK_QUESTIONS.length; w++) {
      const date = new Date(Date.UTC(2026, 0, 5 + w * 7)); // Mondays from 5 Jan 2026
      seen.add(questionForWeek(date.toISOString().slice(0, 10)));
    }
    expect(seen.size).toBe(WEEK_QUESTIONS.length);
    expect(typeof questionForWeek('2026-12-31')).toBe('string');
    expect(typeof questionForWeek('2027-01-01')).toBe('string');
  });
  it('is always one of the questions', () => {
    for (const day of ['2026-01-01', '2026-06-15', '2026-12-31', '2028-02-29']) {
      expect(WEEK_QUESTIONS).toContain(questionForWeek(day));
    }
  });
});
