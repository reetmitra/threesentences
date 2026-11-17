import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  hydrateSettingsFromCache,
  getCachedSettings,
  resetSettingsCache,
  updateSettings,
} from '@/store/settings';
import { DEFAULT_SETTINGS } from '@/types/tracking';
import { getDayRolloverHour } from '@/types/entry';

jest.mock('@/config/supabase', () => ({ supabase: {} }));

const KEY = '@threesentences/user_settings';

beforeEach(async () => {
  await resetSettingsCache();
  jest.clearAllMocks();
});

describe('settings cache', () => {
  it('hydrates from cache', async () => {
    await AsyncStorage.setItem(KEY, '{"dayRolloverHour":6,"trackers":{"habits":true,"mood":false}}');
    const s = await hydrateSettingsFromCache();
    expect(s).toEqual({ dayRolloverHour: 6, trackers: { habits: true, mood: false } });
    expect(getDayRolloverHour()).toBe(6);
  });

  it('falls back to defaults on corrupt cache', async () => {
    await AsyncStorage.setItem(KEY, '{not json');
    expect(await hydrateSettingsFromCache()).toEqual(DEFAULT_SETTINGS);
    expect(getDayRolloverHour()).toBe(4);
  });

  it('reset clears cache and rollover', async () => {
    await AsyncStorage.setItem(KEY, '{"dayRolloverHour":6,"trackers":{"habits":true,"mood":true}}');
    await hydrateSettingsFromCache();
    await resetSettingsCache();
    expect(getCachedSettings()).toEqual(DEFAULT_SETTINGS);
    expect(getDayRolloverHour()).toBe(4);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(KEY);
  });
});

// The supabase mock has no auth, so every save fails and rolls back.
describe('updateSettings', () => {
  const SAVE_ERROR = 'Could not save your settings. Please try again.';

  it('applies only the changed tracker key, and two failed toggles each roll back their own', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const habits = updateSettings({ trackers: { habits: false } });
    const mood = updateSettings({ trackers: { mood: false } });
    expect(getCachedSettings().trackers).toEqual({ habits: false, mood: false });
    await expect(habits).rejects.toThrow(SAVE_ERROR);
    await expect(mood).rejects.toThrow(SAVE_ERROR);
    expect(getCachedSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
