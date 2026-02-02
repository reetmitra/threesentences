/**
 * ThreeSixtyThree™ Three Sentences - Reflections Store
 * 
 * Storage for AI-generated reflections.
 * Per PRD FR-AI-07: User can delete all AI-generated reflections independently.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reflection } from '@/services/aiReflection';

const STORAGE_KEYS = {
  REFLECTIONS: '@threesentences/reflections',
} as const;

/**
 * Get all saved reflections
 */
export async function getAllReflections(): Promise<Reflection[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    if (!data) return [];
    return JSON.parse(data) as Reflection[];
  } catch (error) {
    console.error('Failed to load reflections:', error);
    return [];
  }
}

/**
 * Save a new reflection
 */
export async function saveReflection(reflection: Reflection): Promise<void> {
  const reflections = await getAllReflections();
  reflections.push(reflection);
  await AsyncStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
}

/**
 * Get the most recent reflection
 */
export async function getLatestReflection(): Promise<Reflection | null> {
  const reflections = await getAllReflections();
  if (reflections.length === 0) return null;
  
  // Sort by generatedAt descending
  reflections.sort((a, b) => 
    new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
  
  return reflections[0];
}

/**
 * Delete a specific reflection by ID
 */
export async function deleteReflection(id: string): Promise<void> {
  const reflections = await getAllReflections();
  const filtered = reflections.filter(r => r.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(filtered));
}

/**
 * Delete all reflections (per PRD FR-AI-07)
 */
export async function deleteAllReflections(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.REFLECTIONS);
}

/**
 * Get reflection count
 */
export async function getReflectionCount(): Promise<number> {
  const reflections = await getAllReflections();
  return reflections.length;
}
