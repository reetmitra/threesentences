import {
  DEFAULT_SETTINGS,
  mapToUserSettings,
  DbUserSettings,
  DbHabit,
  validateHabitName,
  nextFreeHabitPosition,
  suggestHabits,
  isMoodValue,
  MOOD_LABELS,
  mapToHabit,
  HabitPosition,
} from '@/types/tracking';

const row = (over: Partial<DbUserSettings>): DbUserSettings => ({
  user_id: 'u',
  day_rollover_hour: 4,
  trackers: { habits: true, mood: true },
  updated_at: '2026-01-01T00:00:00Z',
  ...over,
});

describe('mapToUserSettings', () => {
  it('returns defaults for null', () => {
    expect(mapToUserSettings(null)).toEqual(DEFAULT_SETTINGS);
  });
  it('falls back on invalid hour and garbage trackers', () => {
    expect(mapToUserSettings(row({ day_rollover_hour: 9, trackers: 'garbage' }))).toEqual(DEFAULT_SETTINGS);
  });
  it('maps a valid row', () => {
    expect(
      mapToUserSettings(row({ day_rollover_hour: 2, trackers: { habits: false, mood: true } })),
    ).toEqual({ dayRolloverHour: 2, trackers: { habits: false, mood: true } });
  });
});

describe('validateHabitName', () => {
  it('rejects empty', () => {
    expect(validateHabitName('   ')).toEqual({ ok: false, error: 'Give it a name.' });
  });
  it('trims', () => {
    expect(validateHabitName('  No alcohol  ')).toEqual({ ok: true, name: 'No alcohol' });
  });
  it('enforces 40 chars', () => {
    expect(validateHabitName('a'.repeat(41))).toEqual({ ok: false, error: 'Keep it to 40 characters.' });
    expect(validateHabitName('a'.repeat(40)).ok).toBe(true);
  });
});

describe('nextFreeHabitPosition', () => {
  const p = (...n: HabitPosition[]) => n.map((position) => ({ position }));
  it('lowest free slot', () => {
    expect(nextFreeHabitPosition([])).toBe(0);
    expect(nextFreeHabitPosition(p(0, 2))).toBe(1);
  });
  it('returns null when full', () => {
    expect(nextFreeHabitPosition(p(0, 1, 2))).toBeNull();
  });
});

describe('suggestHabits', () => {
  it('puts sleep habits first and drops active ones', () => {
    const out = suggestHabits(['sleep-optimization'], ['no alcohol']);
    expect(out.slice(0, 2)).toEqual(['In bed by 1am', 'No phone in bed']);
    expect(out).not.toContain('No alcohol');
  });
  it('puts Moved 20 min first for fitness interests', () => {
    expect(suggestHabits(['hyrox'], [])[0]).toBe('Moved 20 min');
  });
});

describe('mood', () => {
  it('isMoodValue', () => {
    expect(isMoodValue(3)).toBe(true);
    expect(isMoodValue(0)).toBe(false);
    expect(isMoodValue(6)).toBe(false);
    expect(isMoodValue('3')).toBe(false);
  });
  it('labels', () => {
    expect(MOOD_LABELS[1]).toBe('rough');
    expect(MOOD_LABELS[5]).toBe('great');
  });
});

describe('mapToHabit', () => {
  it('maps created_at and position', () => {
    const row: DbHabit = {
      id: 'h', user_id: 'u', name: 'Read', position: 2, link: null,
      created_at: '2026-01-01T00:00:00Z', archived_at: null,
    };
    expect(mapToHabit(row)).toEqual({ id: 'h', name: 'Read', position: 2, createdAt: '2026-01-01T00:00:00Z' });
  });
});
