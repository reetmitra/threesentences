/**
 * Three™ - useCheckIn
 *
 * Mood and habit answers for one logical day. Taps update state at once,
 * save in the background, and roll back with a toast if the save fails.
 * Loads on mount and whenever `date` changes; call `reload()` to refresh.
 */

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { getCachedSettings } from '@/store/settings';
import {
  addHabit as storeAddHabit,
  archiveHabit,
  getActiveHabits,
  getHabitAnswers,
  setHabitAnswer,
} from '@/store/habits';
import { getMood, setMood } from '@/store/checkins';
import { Habit, HabitAnswers, MoodValue, TrackerSettings } from '@/types/tracking';

const SAVE_ERROR = "Couldn't save — check your connection.";

export interface CheckIn {
  trackers: TrackerSettings;
  habits: Habit[];
  answers: HabitAnswers;
  mood: MoodValue | null;
  isLoading: boolean;
  answerHabit(habitId: string, done: boolean | null): void;
  chooseMood(mood: MoodValue | null): void;
  /** Resolves to a readable error message, or null on success. */
  addHabit(name: string): Promise<string | null>;
  removeHabit(id: string): Promise<void>;
  reload(): Promise<void>;
}

function withAnswer(answers: HabitAnswers, habitId: string, done: boolean | null): HabitAnswers {
  const next = { ...answers };
  if (done === null) delete next[habitId];
  else next[habitId] = done;
  return next;
}

export function useCheckIn(date: string): CheckIn {
  const { showToast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [answers, setAnswers] = useState<HabitAnswers>({});
  const [mood, setMoodValue] = useState<MoodValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The stores catch their own errors and return empty defaults.
  const reload = useCallback(async () => {
    const [h, a, m] = await Promise.all([getActiveHabits(), getHabitAnswers(date), getMood(date)]);
    setHabits(h);
    setAnswers(a);
    setMoodValue(m);
    setIsLoading(false);
  }, [date]);

  useEffect(() => {
    reload();
  }, [reload]);

  const answerHabit = useCallback(
    (habitId: string, done: boolean | null) => {
      const prev = answers[habitId] ?? null;
      setAnswers((a) => withAnswer(a, habitId, done));
      setHabitAnswer(habitId, date, done).catch(() => {
        // Roll back only if a newer tap hasn't replaced this answer.
        setAnswers((a) => ((a[habitId] ?? null) === done ? withAnswer(a, habitId, prev) : a));
        showToast('error', SAVE_ERROR);
      });
    },
    [answers, date, showToast],
  );

  const chooseMood = useCallback(
    (next: MoodValue | null) => {
      const prev = mood;
      setMoodValue(next);
      setMood(date, next).catch(() => {
        setMoodValue((m) => (m === next ? prev : m));
        showToast('error', SAVE_ERROR);
      });
    },
    [mood, date, showToast],
  );

  const addHabit = useCallback(async (name: string): Promise<string | null> => {
    try {
      const habit = await storeAddHabit(name);
      setHabits((h) => [...h, habit].sort((x, y) => x.position - y.position));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Could not add that habit. Please try again.';
    }
  }, []);

  const removeHabit = useCallback(
    async (id: string) => {
      try {
        await archiveHabit(id);
        setHabits((h) => h.filter((x) => x.id !== id));
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : SAVE_ERROR);
      }
    },
    [showToast],
  );

  return {
    trackers: getCachedSettings().trackers,
    habits,
    answers,
    mood,
    isLoading,
    answerHabit,
    chooseMood,
    addHabit,
    removeHabit,
    reload,
  };
}
