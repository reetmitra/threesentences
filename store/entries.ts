/**
 * Three™ - Entry Store
 * 
 * Manages journal entries with Supabase backend for cross-device sync.
 * Entries are encrypted client-side before upload for privacy.
 * Immutable after 24 hours - by design (365 philosophy).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/config/supabase';
import {
  Entry,
  Draft,
  getTodayDateString,
  formatDateString,
  getCurrentTimezone,
  generateId,
} from '@/types/entry';
import { encryptContent, decryptContent } from '@/utils/encryption';

const LOCAL_STORAGE_KEYS = {
  DRAFT: '@three/draft',
  ENTRIES_CACHE: '@three/entries_cache',
} as const;

/**
 * Database entry row type
 */
interface DbEntry {
  id: string;
  user_id: string;
  date: string;
  encrypted_content: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

/**
 * Convert database entry to app Entry type (with decryption)
 */
async function mapToEntry(dbEntry: DbEntry): Promise<Entry> {
  try {
    const content = await decryptContent(dbEntry.encrypted_content);
    return {
      id: dbEntry.id,
      date: dbEntry.date,
      content,
      submittedAt: dbEntry.created_at,
      timezone: dbEntry.timezone,
    };
  } catch (error) {
    console.error('Failed to decrypt entry:', dbEntry.id, error);
    return {
      id: dbEntry.id,
      date: dbEntry.date,
      content: '[Unable to decrypt entry]',
      submittedAt: dbEntry.created_at,
      timezone: dbEntry.timezone,
    };
  }
}

/**
 * Get all entries from Supabase (decrypted)
 */
export async function getAllEntries(userId: string): Promise<Entry[]> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Failed to fetch entries:', error);
      return [];
    }

    // Decrypt all entries
    const entries = await Promise.all(
      (data as DbEntry[]).map(mapToEntry)
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
export async function getEntryForDate(userId: string, date: string): Promise<Entry | null> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch entry for date:', error);
      return null;
    }

    if (!data) return null;

    return mapToEntry(data as DbEntry);
  } catch (error) {
    console.error('Failed to get entry for date:', error);
    return null;
  }
}

/**
 * Get today's entry if it exists
 */
export async function getTodayEntry(userId: string): Promise<Entry | null> {
  return getEntryForDate(userId, getTodayDateString());
}

/**
 * Check if an entry exists for today
 */
export async function hasEntryForToday(userId: string): Promise<boolean> {
  const entry = await getTodayEntry(userId);
  return entry !== null;
}

/**
 * Save a new entry (encrypted before saving)
 * @param content - The three sentences
 * @returns The saved entry (with decrypted content for display)
 */
export async function saveEntry(userId: string, content: string): Promise<Entry> {
  const today = getTodayDateString();
  const timezone = getCurrentTimezone();

  // Encrypt the content before saving
  const encryptedContent = await encryptContent(content);

  // Check if entry exists for today
  const { data: existing } = await supabase
    .from('entries')
    .select('id')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  let entryId: string;
  let submittedAt: string;

  if (existing) {
    // Update existing entry
    const { data, error } = await supabase
      .from('entries')
      .update({
        encrypted_content: encryptedContent,
        timezone,
      })
      .eq('user_id', userId)
      .eq('date', today)
      .select()
      .single();

    if (error) {
      console.error('Failed to update entry:', error);
      throw new Error('Failed to save entry');
    }

    entryId = data.id;
    submittedAt = data.updated_at;
  } else {
    // Create new entry
    const { data, error } = await supabase
      .from('entries')
      .insert({
        user_id: userId,
        date: today,
        encrypted_content: encryptedContent,
        timezone,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create entry:', error);
      throw new Error('Failed to save entry');
    }

    entryId = data.id;
    submittedAt = data.created_at;
  }

  // Clear draft after successful submission
  await clearDraft();

  return {
    id: entryId,
    date: today,
    content,
    submittedAt,
    timezone,
  };
}

/**
 * Get entries for a specific month
 * @param year - Full year (e.g., 2026)
 * @param month - Month (1-12)
 */
export async function getEntriesForMonth(
  userId: string,
  year: number,
  month: number
): Promise<Entry[]> {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lt('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Failed to fetch entries for month:', error);
      return [];
    }

    return Promise.all((data as DbEntry[]).map(mapToEntry));
  } catch (error) {
    console.error('Failed to get entries for month:', error);
    return [];
  }
}

/**
 * Get dates that have entries for a specific month
 * Returns Set of date strings (YYYY-MM-DD)
 */
export async function getEntryDatesForMonth(
  userId: string,
  year: number,
  month: number
): Promise<Set<string>> {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('entries')
      .select('date')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lt('date', endDate);

    if (error) {
      console.error('Failed to fetch entry dates:', error);
      return new Set();
    }

    return new Set(data.map((e: { date: string }) => e.date));
  } catch (error) {
    console.error('Failed to get entry dates:', error);
    return new Set();
  }
}

/**
 * Get entry count statistics
 */
export async function getEntryStats(userId: string): Promise<{
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
}> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error || !data) {
      return { totalEntries: 0, currentStreak: 0, longestStreak: 0 };
    }

    const totalEntries = data.length;
    const dates = new Set(data.map((e: { date: string }) => e.date));

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;

    const today = new Date();
    const checkDate = new Date(today);

    // Check current streak — if today has no entry, back up one day before counting
    if (!dates.has(formatDateString(checkDate))) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (dates.has(formatDateString(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate longest streak
    const sortedDates = Array.from(dates).sort();
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        streak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          streak++;
        } else {
          longestStreak = Math.max(longestStreak, streak);
          streak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, streak);

    return { totalEntries, currentStreak, longestStreak };
  } catch (error) {
    console.error('Failed to get entry stats:', error);
    return { totalEntries: 0, currentStreak: 0, longestStreak: 0 };
  }
}

/**
 * Delete an entry (admin only or within 24 hours)
 */
export async function deleteEntry(userId: string, entryId: string): Promise<void> {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('user_id', userId)
    .eq('id', entryId);

  if (error) {
    console.error('Failed to delete entry:', error);
    throw new Error('Failed to delete entry');
  }
}

// ============================================
// Draft Management (Local-only for privacy)
// ============================================

/**
 * Save a draft (local storage only, not synced)
 */
export async function saveDraft(draft: Draft): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_STORAGE_KEYS.DRAFT, JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

/**
 * Get the current draft
 */
export async function getDraft(): Promise<Draft | null> {
  try {
    const data = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.DRAFT);
    if (!data) return null;

    const draft = JSON.parse(data) as Draft;

    // Drafts expire after the day
    if (draft.date !== getTodayDateString()) {
      await clearDraft();
      return null;
    }

    return draft;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

/**
 * Clear the current draft
 */
export async function clearDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LOCAL_STORAGE_KEYS.DRAFT);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}

/**
 * Migrate local entries to Supabase (for existing users)
 */
export async function migrateLocalEntries(userId: string): Promise<number> {
  const LOCAL_ENTRIES_KEY = '@threesentences/entries';

  try {
    const localData = await AsyncStorage.getItem(LOCAL_ENTRIES_KEY);
    if (!localData) return 0;

    interface LocalEntry {
      id: string;
      date: string;
      content?: string;
      encryptedContent?: string;
      submittedAt: string;
      timezone: string;
    }

    const localEntries = JSON.parse(localData) as LocalEntry[];
    let migrated = 0;

    for (const entry of localEntries) {
      // Get content (may be encrypted or not)
      let content: string;
      if (entry.content) {
        content = entry.content;
      } else if (entry.encryptedContent) {
        try {
          content = await decryptContent(entry.encryptedContent);
        } catch {
          content = entry.encryptedContent; // Use as-is if can't decrypt
        }
      } else {
        continue;
      }

      // Encrypt for Supabase
      const encryptedContent = await encryptContent(content);

      // Check if already exists in Supabase
      const { data: existing } = await supabase
        .from('entries')
        .select('id')
        .eq('user_id', userId)
        .eq('date', entry.date)
        .maybeSingle();

      if (!existing) {
        // Insert into Supabase
        const { error } = await supabase
          .from('entries')
          .insert({
            user_id: userId,
            date: entry.date,
            encrypted_content: encryptedContent,
            timezone: entry.timezone || 'UTC',
          });

        if (!error) {
          migrated++;
        }
      }
    }

    // Keep local data as backup but mark as migrated
    await AsyncStorage.setItem(
      `${LOCAL_ENTRIES_KEY}_migrated`,
      new Date().toISOString()
    );

    return migrated;
  } catch (error) {
    console.error('Failed to migrate local entries:', error);
    return 0;
  }
}

// ============================================
// Export and Count Functions
// ============================================

export type ExportFormat = 'json' | 'txt' | 'csv';

/**
 * Get total entry count
 */
export async function getEntryCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to get entry count:', error);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.error('Failed to get entry count:', error);
    return 0;
  }
}

/**
 * Get entries for AI reflection (past N days)
 */
export async function getEntriesForReflection(
  userId: string,
  days: number = 7
): Promise<Entry[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = formatDateString(startDate);

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .order('date', { ascending: false });

    if (error) {
      console.error('Failed to get entries for reflection:', error);
      return [];
    }

    return Promise.all((data as DbEntry[]).map(mapToEntry));
  } catch (error) {
    console.error('Failed to get entries for reflection:', error);
    return [];
  }
}

/**
 * Export entries in specified format
 */
export async function exportEntries(
  userId: string,
  format: ExportFormat = 'json'
): Promise<string> {
  const entries = await getAllEntries(userId);

  switch (format) {
    case 'json':
      return JSON.stringify(entries, null, 2);

    case 'csv': {
      const header = 'Date,Content,Submitted At,Timezone\n';
      const rows = entries.map((e) =>
        `"${e.date}","${e.content.replace(/"/g, '""')}","${e.submittedAt}","${e.timezone}"`
      );
      return header + rows.join('\n');
    }

    case 'txt': {
      return entries.map((e) =>
        `--- ${e.date} ---\n${e.content}\n`
      ).join('\n');
    }

    default:
      return JSON.stringify(entries, null, 2);
  }
}
