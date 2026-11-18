import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/config/supabase';
import { parseDateString } from '@/types/entry';
import {
  buildRange,
  DbPatternRow,
  mapPatternRows,
  monthRange,
  PatternDay,
  RANGE_OPTIONS,
} from '@/types/patterns';

const PREFIX = '@threesentences/patterns/';

interface CachedPatterns {
  from: string;
  to: string;
  days: PatternDay[];
}

/**
 * The screen slot a range fills: a calendar month (`m2026-11`) or a 7/30/90-day
 * range (`r30`). One key per slot, overwritten as the days move on, so keys
 * don't pile up daily. A 30-day range that is exactly a month shares the
 * month's slot; same from/to, same data.
 */
function slotFor(from: string, to: string): string | null {
  const start = parseDateString(from);
  const month = monthRange(start.getFullYear(), start.getMonth() + 1);
  if (month.from === from && month.to === to) return `m${from.slice(0, 7)}`;
  const days = RANGE_OPTIONS.find((n) => buildRange(to, n).from === from);
  return days ? `r${days}` : null;
}

/**
 * Per-user key, so another account on this device never sees it. Null when signed out.
 * userId comes from the caller (useAuth), not getSession(): offline with an expired
 * token, getSession() retries a refresh for ~25s and returns null, which would hide the cache.
 */
function cacheKey(userId: string | null, from: string, to: string): string | null {
  const slot = slotFor(from, to);
  return userId && slot ? `${PREFIX}${userId}/${slot}` : null;
}

async function readCache(key: string | null, from: string, to: string): Promise<PatternDay[] | null> {
  if (!key) return null;
  try {
    const raw = await AsyncStorage.getItem(key);
    const cached = raw ? (JSON.parse(raw) as Partial<CachedPatterns> | null) : null;
    // The slot may hold an older day's range; only an exact match counts.
    if (cached?.from !== from || cached.to !== to || !Array.isArray(cached.days)) return null;
    return cached.days;
  } catch (e) {
    console.error('patterns cache read failed', e);
    return null;
  }
}

export async function getCachedPatterns(
  userId: string | null,
  from: string,
  to: string,
): Promise<PatternDay[] | null> {
  return readCache(cacheKey(userId, from, to), from, to);
}

export async function getPatterns(userId: string | null, from: string, to: string): Promise<PatternDay[]> {
  // Key taken before the request: a reply that lands after an account switch
  // still files under the account that asked.
  const key = cacheKey(userId, from, to);
  const { data, error } = await supabase.rpc('get_patterns', { p_from: from, p_to: to });
  if (error || !Array.isArray(data)) {
    console.error('get_patterns failed', error);
    const cached = await readCache(key, from, to);
    if (cached) return cached;
    throw new Error("Couldn't load your patterns.");
  }
  const days = mapPatternRows(data as DbPatternRow[]);
  if (key) {
    try {
      const entry: CachedPatterns = { from, to, days };
      await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.error('patterns cache write failed', e);
    }
  }
  return days;
}

/** On sign-out: drop every account's cached patterns from this device. */
export async function clearPatternsCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PREFIX)));
  } catch (e) {
    console.error('patterns cache clear failed', e);
  }
}
