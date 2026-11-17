/**
 * Three™ - Settings Store
 *
 * Private per-user settings (day rollover hour, tracker switches) in
 * Supabase `user_settings`, cached in AsyncStorage so the rollover hour is
 * known at boot even offline.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/config/supabase';
import { setDayRolloverHour } from '@/types/entry';
import { DEFAULT_SETTINGS, DbUserSettings, UserSettings, mapToUserSettings } from '@/types/tracking';

const CACHE_KEY = '@threesentences/user_settings';

let current: UserSettings = DEFAULT_SETTINGS;

function apply(settings: UserSettings): UserSettings {
  current = settings;
  setDayRolloverHour(settings.dayRolloverHour);
  return settings;
}

async function writeCache(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to cache settings:', error);
  }
}

export function getCachedSettings(): UserSettings {
  return current;
}

export async function hydrateSettingsFromCache(): Promise<UserSettings> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return apply(DEFAULT_SETTINGS);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return apply(DEFAULT_SETTINGS);
    const p = parsed as { dayRolloverHour?: unknown; trackers?: unknown };
    // Reuse the row mapper so cached data gets the same validation.
    return apply(
      mapToUserSettings({
        user_id: '',
        day_rollover_hour: p.dayRolloverHour as number,
        trackers: p.trackers,
        updated_at: '',
      }),
    );
  } catch (error) {
    console.error('Failed to read settings cache:', error);
    return apply(DEFAULT_SETTINGS);
  }
}

export async function loadSettings(): Promise<UserSettings> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) return getCachedSettings();

    const { data, error } = await supabase.from('user_settings').select('*').maybeSingle();
    if (error) throw error;

    let row = data as DbUserSettings | null;
    if (!row) {
      const created = await supabase
        .from('user_settings')
        .upsert({ user_id: session.user.id }, { onConflict: 'user_id' })
        .select()
        .single();
      if (created.error) throw created.error;
      row = created.data as DbUserSettings;
    }

    const settings = apply(mapToUserSettings(row));
    await writeCache(settings);
    return settings;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return getCachedSettings();
  }
}

export async function updateSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const previous = current;
  const next: UserSettings = {
    dayRolloverHour: patch.dayRolloverHour ?? previous.dayRolloverHour,
    trackers: { ...previous.trackers, ...patch.trackers },
  };
  apply(next);
  await writeCache(next);

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) throw new Error('No active session');

    const { error } = await supabase.from('user_settings').upsert(
      {
        user_id: sessionData.session.user.id,
        day_rollover_hour: next.dayRolloverHour,
        trackers: next.trackers,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    if (error) throw error;
    return next;
  } catch (error) {
    console.error('Failed to save settings:', error);
    apply(previous);
    await writeCache(previous);
    throw new Error('Could not save your settings. Please try again.');
  }
}

export async function resetSettingsCache(): Promise<void> {
  apply(DEFAULT_SETTINGS);
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear settings cache:', error);
  }
}
