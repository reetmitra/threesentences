/**
 * ThreeSixtyThree™ Three Sentences - Entry Store
 * 
 * Local-first storage with AsyncStorage.
 * All entries encrypted at rest using AES-256 (per PRD Section 7.1).
 * Entries are immutable after submission - by design (363 philosophy).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Entry,
  Draft,
  getTodayDateString,
  getCurrentTimezone,
  generateId,
} from '@/types/entry';
import { encryptContent, decryptContent, isEncrypted } from '@/utils/encryption';

const STORAGE_KEYS = {
  ENTRIES: '@threesentences/entries',
  DRAFT: '@threesentences/draft',
} as const;

/**
 * Internal entry format (encrypted content)
 */
interface StoredEntry extends Omit<Entry, 'content'> {
  encryptedContent: string;
}

/**
 * Get all entries from storage (decrypted)
 */
export async function getAllEntries(): Promise<Entry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!data) return [];
    
    const storedEntries = JSON.parse(data) as (StoredEntry | Entry)[];
    
    // Decrypt all entries
    const entries: Entry[] = await Promise.all(
      storedEntries.map(async (stored) => {
        // Handle both old (unencrypted) and new (encrypted) formats
        if ('encryptedContent' in stored) {
          try {
            const content = await decryptContent(stored.encryptedContent);
            return {
              id: stored.id,
              date: stored.date,
              content,
              submittedAt: stored.submittedAt,
              timezone: stored.timezone,
            };
          } catch (error) {
            console.error('Failed to decrypt entry:', stored.id, error);
            // Return entry with placeholder if decryption fails
            return {
              id: stored.id,
              date: stored.date,
              content: '[Unable to decrypt entry]',
              submittedAt: stored.submittedAt,
              timezone: stored.timezone,
            };
          }
        } else {
          // Legacy unencrypted entry - migrate it
          return stored as Entry;
        }
      })
    );
    
    return entries;
  } catch (error) {
    console.error('Failed to load entries:', error);
    return [];
  }
}

/**
 * Get entry for a specific date (decrypted)
 * @param date - Date string in YYYY-MM-DD format
 */
export async function getEntryForDate(date: string): Promise<Entry | null> {
  const entries = await getAllEntries();
  return entries.find((e) => e.date === date) || null;
}

/**
 * Get today's entry if it exists
 */
export async function getTodayEntry(): Promise<Entry | null> {
  return getEntryForDate(getTodayDateString());
}

/**
 * Check if an entry exists for today
 */
export async function hasEntryForToday(): Promise<boolean> {
  const entry = await getTodayEntry();
  return entry !== null;
}

/**
 * Save a new entry (encrypted, submission is final - 363 philosophy)
 * @param content - The three sentences
 * @returns The saved entry (with decrypted content for display)
 * @throws If entry already exists for today
 */
export async function saveEntry(content: string): Promise<Entry> {
  const today = getTodayDateString();
  
  // Check if entry already exists (one per day rule)
  const existing = await getEntryForDate(today);
  if (existing) {
    throw new Error('Entry already exists for today. ThreeSixtyThree™: One entry per day.');
  }

  // Encrypt the content
  const encryptedContent = await encryptContent(content);

  const storedEntry: StoredEntry = {
    id: generateId(),
    date: today,
    encryptedContent,
    submittedAt: new Date().toISOString(),
    timezone: getCurrentTimezone(),
  };

  // Load existing entries (raw, without decryption for efficiency)
  const data = await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES);
  const storedEntries: StoredEntry[] = data ? JSON.parse(data) : [];
  storedEntries.push(storedEntry);
  
  await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(storedEntries));
  
  // Clear draft after successful submission
  await clearDraft();
  
  // Return the entry with decrypted content for immediate display
  return {
    id: storedEntry.id,
    date: storedEntry.date,
    content,
    submittedAt: storedEntry.submittedAt,
    timezone: storedEntry.timezone,
  };
}

/**
 * Get entries for a specific month
 * @param year - Full year (e.g., 2026)
 * @param month - Month (1-12)
 */
export async function getEntriesForMonth(year: number, month: number): Promise<Entry[]> {
  const entries = await getAllEntries();
  const monthStr = String(month).padStart(2, '0');
  const prefix = `${year}-${monthStr}`;
  return entries.filter((e) => e.date.startsWith(prefix));
}

/**
 * Get dates that have entries for a specific month
 * Returns Set of date strings (YYYY-MM-DD)
 * This doesn't require decryption - just reads metadata
 */
export async function getEntryDatesForMonth(year: number, month: number): Promise<Set<string>> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!data) return new Set();
    
    const storedEntries = JSON.parse(data) as (StoredEntry | Entry)[];
    const monthStr = String(month).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    
    return new Set(
      storedEntries
        .filter((e) => e.date.startsWith(prefix))
        .map((e) => e.date)
    );
  } catch (error) {
    console.error('Failed to get entry dates:', error);
    return new Set();
  }
}

// ============ Draft Management ============

/**
 * Save current draft (auto-save, encrypted)
 */
export async function saveDraft(content: string): Promise<void> {
  const encryptedContent = await encryptContent(content);
  const draft = {
    encryptedContent,
    lastSaved: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
}

/**
 * Get current draft (decrypted)
 */
export async function getDraft(): Promise<Draft | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DRAFT);
    if (!data) return null;
    
    const stored = JSON.parse(data);
    
    // Handle both old (unencrypted) and new (encrypted) formats
    if (stored.encryptedContent) {
      const content = await decryptContent(stored.encryptedContent);
      return {
        content,
        lastSaved: stored.lastSaved,
      };
    } else if (stored.content) {
      // Legacy unencrypted draft
      return stored as Draft;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

/**
 * Clear draft (called after submission)
 */
export async function clearDraft(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.DRAFT);
}

// ============ Export Functionality ============

export type ExportFormat = 'json' | 'text';

/**
 * Export all entries (decrypted for user export)
 * @param format - 'json' or 'text'
 */
export async function exportEntries(format: ExportFormat): Promise<string> {
  const entries = await getAllEntries();
  
  // Sort by date (oldest first)
  entries.sort((a, b) => a.date.localeCompare(b.date));

  if (format === 'json') {
    return JSON.stringify(entries, null, 2);
  }

  // Plain text format
  const lines = entries.map((entry) => {
    const date = new Date(entry.submittedAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return `${formattedDate}\n${'─'.repeat(40)}\n${entry.content}\n`;
  });

  return `ThreeSixtyThree™ Three Sentences Export\n${'═'.repeat(40)}\n\n${lines.join('\n')}`;
}

/**
 * Get total entry count (doesn't require decryption)
 */
export async function getEntryCount(): Promise<number> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!data) return 0;
    const entries = JSON.parse(data);
    return entries.length;
  } catch (error) {
    console.error('Failed to get entry count:', error);
    return 0;
  }
}

/**
 * Get entries for AI reflection (decrypted content for analysis)
 * @param days - Number of days to look back (7, 30, or 90)
 */
export async function getEntriesForReflection(days: number): Promise<Entry[]> {
  const entries = await getAllEntries();
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];
  
  return entries
    .filter((e) => e.date >= cutoffStr)
    .sort((a, b) => a.date.localeCompare(b.date));
}
