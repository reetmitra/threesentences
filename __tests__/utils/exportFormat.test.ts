import { buildJsonExport, buildTxtExport, DayTracking, ExportHabit } from '@/utils/exportFormat';
import { Entry } from '@/types/entry';
import { DEFAULT_SETTINGS } from '@/types/tracking';

const entry = (date: string, content: string): Entry => ({
  id: date,
  date,
  content,
  submittedAt: `${date}T22:00:00Z`,
  timezone: 'UTC',
});
const habit = (id: string, name: string, position: 0 | 1 | 2): ExportHabit => ({
  id,
  name,
  position,
  createdAt: '2026-11-01T00:00:00Z',
  archivedAt: null,
  link: null,
});
const habits: ExportHabit[] = [
  habit('h1', 'In bed by 1am', 0),
  habit('h2', 'No alcohol', 1),
  { ...habit('h3', 'Read 10 pages', 2), archivedAt: '2026-11-10T00:00:00Z' },
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
    const out = buildTxtExport([entry('2026-11-16', 'Quiet.')], habits, {});
    expect(out).toBe('--- 2026-11-16 ---\nQuiet.\n');
  });
  it('keeps a day with tracking but no entry, newest first', () => {
    const out = buildTxtExport([entry('2026-11-16', 'Quiet.')], habits, days);
    expect(out).toBe(
      '--- 2026-11-17 ---\nMood: good · In bed by 1am ✓ · No alcohol —\n' +
        '\n--- 2026-11-16 ---\nQuiet.\n',
    );
  });
});

describe('buildJsonExport', () => {
  it('has entries, habits, days, settings', () => {
    const parsed = JSON.parse(
      buildJsonExport([entry('2026-11-17', 'x')], habits, days, DEFAULT_SETTINGS),
    );
    expect(Object.keys(parsed)).toEqual(['entries', 'habits', 'days', 'settings']);
    expect(parsed.days['2026-11-17'].mood).toBe(4);
    expect(parsed.habits[2]).toMatchObject({ archivedAt: '2026-11-10T00:00:00Z', link: null });
    expect(parsed.settings).toEqual(DEFAULT_SETTINGS);
  });
});
