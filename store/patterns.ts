import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/config/supabase';
import { DbPatternRow, mapPatternRows, PatternDay } from '@/types/patterns';

const cacheKey = (from: string, to: string): string => `@threesentences/patterns/${from}_${to}`;

export async function getCachedPatterns(from: string, to: string): Promise<PatternDay[] | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(from, to));
    return raw ? (JSON.parse(raw) as PatternDay[]) : null;
  } catch (e) {
    console.error('patterns cache read failed', e);
    return null;
  }
}

export async function getPatterns(from: string, to: string): Promise<PatternDay[]> {
  const { data, error } = await supabase.rpc('get_patterns', { p_from: from, p_to: to });
  if (error || !Array.isArray(data)) {
    console.error('get_patterns failed', error);
    const cached = await getCachedPatterns(from, to);
    if (cached) return cached;
    throw new Error("Couldn't load your patterns.");
  }
  const days = mapPatternRows(data as DbPatternRow[]);
  try {
    await AsyncStorage.setItem(cacheKey(from, to), JSON.stringify(days));
  } catch (e) {
    console.error('patterns cache write failed', e);
  }
  return days;
}
