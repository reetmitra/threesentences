/**
 * Three™ - Check-ins Store
 *
 * One optional mood (1-5) per day.
 */

import { supabase } from '@/config/supabase';
import { MoodValue, isMoodValue } from '@/types/tracking';
import { DayTracking, fetchAllPages } from '@/utils/exportFormat';

export async function getMood(date: string): Promise<MoodValue | null> {
  try {
    const { data, error } = await supabase
      .from('checkins')
      .select('mood')
      .eq('date', date)
      .maybeSingle();
    if (error) throw error;
    const mood: unknown = data?.mood;
    return isMoodValue(mood) ? mood : null;
  } catch (error) {
    console.error('Failed to load mood:', error);
    return null;
  }
}

export async function setMood(date: string, mood: MoodValue | null): Promise<void> {
  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !data.session) throw new Error('You need to be signed in.');

  const { error } = await supabase.from('checkins').upsert(
    { user_id: data.session.user.id, date, mood, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,date' },
  );
  if (error) {
    console.error('Failed to save mood:', error);
    throw new Error('Could not save your mood. Please try again.');
  }
}

/** Every habit answer and mood for the signed-in user, merged per date (for export). */
export async function getAllTracking(): Promise<Record<string, DayTracking>> {
  try {
    const [logs, checkins] = await Promise.all([
      fetchAllPages<{ habit_id: string; date: string; done: boolean }>((from, to) =>
        supabase
          .from('habit_logs')
          .select('habit_id, date, done')
          .order('date', { ascending: true })
          .order('habit_id', { ascending: true })
          .range(from, to),
      ),
      fetchAllPages<{ date: string; mood: unknown }>((from, to) =>
        supabase
          .from('checkins')
          .select('date, mood')
          .order('date', { ascending: true })
          .range(from, to),
      ),
    ]);

    const days: Record<string, DayTracking> = {};
    const day = (date: string): DayTracking => (days[date] ??= { mood: null, answers: {} });
    for (const r of logs) {
      day(r.date).answers[r.habit_id] = r.done;
    }
    for (const r of checkins) {
      if (isMoodValue(r.mood)) day(r.date).mood = r.mood;
    }
    return days;
  } catch (error) {
    console.error('Failed to load tracking for export:', error);
    return {};
  }
}
