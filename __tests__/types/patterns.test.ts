import {
  buildRange,
  habitStats,
  isFullHabitDay,
  mapPatternRows,
  monthRange,
  moodPoints,
  moodSegments,
  summarizeHabit,
  summarizeMood,
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
    expect(summarizeHabit('In bed by 1am', { done: 4, answered: 7 }, 7)).toBe('In bed by 1am: 4 of 7 days');
  });
  it('handles no answers', () => {
    expect(summarizeHabit('In bed by 1am', { done: 0, answered: 0 }, 7)).toBe('In bed by 1am: not checked in yet');
  });
});
