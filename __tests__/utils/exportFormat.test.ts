import { buildJsonExport, buildTxtExport, DayTracking } from '@/utils/exportFormat';
import { Entry } from '@/types/entry';
import { Habit } from '@/types/tracking';

const entry = (date: string, content: string): Entry => ({
  id: date,
  date,
  content,
  submittedAt: `${date}T22:00:00Z`,
  timezone: 'UTC',
});
const habits: Habit[] = [
  { id: 'h1', name: 'In bed by 1am', position: 0, createdAt: '2026-11-01T00:00:00Z' },
  { id: 'h2', name: 'No alcohol', position: 1, createdAt: '2026-11-01T00:00:00Z' },
  { id: 'h3', name: 'Read 10 pages', position: 2, createdAt: '2026-11-01T00:00:00Z' },
];
const days: Record<string, DayTracking> = {
  '2026-11-17': { mood: 4, answers: { h1: true, h2: false } },
};

describe('buildTxtExport', () => {
  it('renders mood and answered habits, omitting unanswered', () => {
    const out = buildTxtExport([entry('2026-11-17', 'Hello.')], habits, days);
    expect(out).toBe(
      '--- 2026-11-17 ---\nHello.\nMood: good · In bed by 1am ✓ · No alcohol —\n',
    );
  });
  it('renders no tracking line for an untracked day', () => {
    const out = buildTxtExport([entry('2026-11-16', 'Quiet.')], habits, days);
    expect(out).toBe('--- 2026-11-16 ---\nQuiet.\n');
  });
});

describe('buildJsonExport', () => {
  it('has entries, habits, days', () => {
    const parsed = JSON.parse(buildJsonExport([entry('2026-11-17', 'x')], habits, days));
    expect(Object.keys(parsed)).toEqual(['entries', 'habits', 'days']);
    expect(parsed.days['2026-11-17'].mood).toBe(4);
  });
});
