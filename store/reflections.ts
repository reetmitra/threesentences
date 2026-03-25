/**
 * Three™ - Reflections Store
 *
 * Storage for AI-generated reflections.
 * Syncs to Supabase with AsyncStorage as offline cache.
 * Per PRD FR-AI-07: User can delete all AI-generated reflections independently.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/config/supabase';
import { Reflection, ReflectionTimeRange } from '@/services/aiReflection';

const STORAGE_KEY = '@threesentences/reflections';

/**
 * Save a reflection to Supabase and AsyncStorage cache
 */
export async function saveReflection(userId: string, reflection: Reflection): Promise<void> {
  // Save to Supabase
  try {
    await supabase
      .from('reflections')
      .insert({
        user_id: userId,
        time_range: reflection.timeRange,
        entries_analyzed: reflection.entriesAnalyzed,
        content: reflection.content,
        has_crisis_indicators: reflection.hasCrisisIndicators,
      });
  } catch (error) {
    console.error('Failed to save reflection to Supabase:', error);
  }

  // Save to AsyncStorage cache
  try {
    const existing = await getCachedReflections();
    existing.push(reflection);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Failed to cache reflection:', error);
  }
}

/**
 * Get all reflections — from Supabase if userId provided, else AsyncStorage cache
 */
export async function getAllReflections(userId?: string): Promise<Reflection[]> {
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const reflections: Reflection[] = data.map((r: any) => ({
          id: r.id,
          generatedAt: r.created_at,
          timeRange: r.time_range as ReflectionTimeRange,
          content: r.content,
          entriesAnalyzed: r.entries_analyzed,
          hasCrisisIndicators: r.has_crisis_indicators,
        }));
        // Update local cache
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reflections));
        return reflections;
      }
    } catch (error) {
      console.error('Failed to fetch reflections from Supabase, using cache:', error);
    }
  }

  return getCachedReflections();
}

/**
 * Get cached reflections from AsyncStorage
 */
async function getCachedReflections(): Promise<Reflection[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Reflection[];
  } catch (error) {
    console.error('Failed to load reflections from cache:', error);
    return [];
  }
}

/**
 * Get the most recent reflection
 */
export async function getLatestReflection(userId?: string): Promise<Reflection | null> {
  const reflections = await getAllReflections(userId);
  if (reflections.length === 0) return null;

  reflections.sort((a, b) =>
    new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );

  return reflections[0];
}

/**
 * Delete a specific reflection by ID
 */
export async function deleteReflection(id: string, userId?: string): Promise<void> {
  // Delete from Supabase
  if (userId) {
    try {
      await supabase
        .from('reflections')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Failed to delete reflection from Supabase:', error);
    }
  }

  // Delete from cache
  const reflections = await getCachedReflections();
  const filtered = reflections.filter(r => r.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Delete all reflections (per PRD FR-AI-07)
 */
export async function deleteAllReflections(userId?: string): Promise<void> {
  // Delete from Supabase
  if (userId) {
    try {
      await supabase
        .from('reflections')
        .delete()
        .eq('user_id', userId);
    } catch (error) {
      console.error('Failed to delete reflections from Supabase:', error);
    }
  }

  await AsyncStorage.removeItem(STORAGE_KEY);
}

/**
 * Get reflection count
 */
export async function getReflectionCount(userId?: string): Promise<number> {
  const reflections = await getAllReflections(userId);
  return reflections.length;
}
