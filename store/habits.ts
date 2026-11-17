/**
 * Three™ - Habits Store
 *
 * Up to three active habits plus per-day done / not-done answers.
 * A missing habit_logs row means unanswered.
 */

import { supabase } from '@/config/supabase';
import {
  DbHabit,
  Habit,
  HabitAnswers,
  THREE_HABITS_ERROR,
  mapToHabit,
  nextFreeHabitPosition,
  validateHabitName,
} from '@/types/tracking';

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('You need to be signed in.');
  return data.session.user.id;
}

export async function getActiveHabits(): Promise<Habit[]> {
  try {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .is('archived_at', null)
      .order('position', { ascending: true });
    if (error) throw error;
    return ((data ?? []) as DbHabit[]).map(mapToHabit);
  } catch (error) {
    console.error('Failed to load habits:', error);
    return [];
  }
}

export async function addHabit(rawName: string): Promise<Habit> {
  const v = validateHabitName(rawName);
  if (!v.ok) throw new Error(v.error);
  await requireUserId();

  const position = nextFreeHabitPosition(await getActiveHabits());
  if (position === null) throw new Error(THREE_HABITS_ERROR);

  const { data, error } = await supabase
    .from('habits')
    .insert({ name: v.name, position })
    .select()
    .single();
  if (error) {
    // Unique (user_id, position) race on the last slot.
    if ((error as { code?: string }).code === '23505') throw new Error(THREE_HABITS_ERROR);
    console.error('Failed to add habit:', error);
    throw new Error('Could not add that habit. Please try again.');
  }
  return mapToHabit(data as DbHabit);
}

export async function archiveHabit(id: string): Promise<void> {
  await requireUserId();
  const { error } = await supabase
    .from('habits')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.error('Failed to archive habit:', error);
    throw new Error('Could not remove that habit. Please try again.');
  }
}

export async function getHabitAnswers(date: string): Promise<HabitAnswers> {
  try {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('habit_id, done')
      .eq('date', date);
    if (error) throw error;
    const answers: HabitAnswers = {};
    for (const r of (data ?? []) as { habit_id: string; done: boolean }[]) answers[r.habit_id] = r.done;
    return answers;
  } catch (error) {
    console.error('Failed to load habit answers:', error);
    return {};
  }
}

/** `null` clears the answer (back to unanswered). */
export async function setHabitAnswer(
  habitId: string,
  date: string,
  done: boolean | null,
): Promise<void> {
  await requireUserId();
  const { error } =
    done === null
      ? await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('date', date)
      : await supabase
          .from('habit_logs')
          .upsert(
            { habit_id: habitId, date, done, updated_at: new Date().toISOString() },
            { onConflict: 'habit_id,date' },
          );
  if (error) {
    console.error('Failed to save habit answer:', error);
    throw new Error('Could not save that answer. Please try again.');
  }
}
