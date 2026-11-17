/**
 * Three™ - Check-ins Store
 *
 * One optional mood (1-5) per day.
 */

import { supabase } from '@/config/supabase';
import { MoodValue, isMoodValue } from '@/types/tracking';

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
