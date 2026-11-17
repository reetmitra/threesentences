import { DEFAULT_SETTINGS, mapToUserSettings, DbUserSettings } from '@/types/tracking';

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
