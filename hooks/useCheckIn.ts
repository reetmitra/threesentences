/**
 * Three™ - useCheckIn
 *
 * Mood and habit answers for one logical day. Taps show at once and save
 * in the background, one write at a time per answer (see SaveQueue). If a
 * save fails the answer goes back to the last saved value, with a toast.
 * Loads on mount and whenever `date` changes; call `reload()` to refresh.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
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
import {
  Habit,
  HabitAnswers,
  MoodValue,
  SaveQueue,
  SaveStep,
  TrackerSettings,
  applyServerValue,
  newSaveQueue,
  queueTap,
  settleSave,
  shownValue,
} from '@/types/tracking';

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

type Queues<V> = Map<string, SaveQueue<V>>;

function withAnswer(answers: HabitAnswers, habitId: string, done: boolean | null): HabitAnswers {
  const next = { ...answers };
  if (done === null) delete next[habitId];
  else next[habitId] = done;
  return next;
}

/** Store a queue step, show its value, and send the next write, if any. */
function advance<V>(
  queues: Queues<V>,
  key: string,
  step: SaveStep<V>,
  save: (value: V) => Promise<void>,
  show: (value: V, failed: boolean) => void,
): void {
  queues.set(key, step.queue);
  show(shownValue(step.queue), step.failed);
  if (!step.send) return;
  const settle = (ok: boolean) =>
    advance(queues, key, settleSave(queues.get(key) ?? step.queue, ok), save, show);
  save(step.send.value).then(
    () => settle(true),
    () => settle(false),
  );
}

/** Record a value read from the server; returns what to show. */
function applyRead<V>(queues: Queues<V>, atStart: Queues<V>, key: string, saved: V): V {
  const next = applyServerValue(queues.get(key), atStart.get(key), saved);
  queues.set(key, next);
  return shownValue(next);
}

export function useCheckIn(date: string): CheckIn {
  const { showToast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [answers, setAnswers] = useState<HabitAnswers>({});
  const [mood, setMoodValue] = useState<MoodValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Keyed by date (mood) and date|habitId (answers), so a write that
  // settles after the day rolls over can't touch the new day's state.
  const moodQueues = useRef<Queues<MoodValue | null>>(new Map()).current;
  const answerQueues = useRef<Queues<boolean | null>>(new Map()).current;
  const dateRef = useRef(date);
  dateRef.current = date;

  // The stores catch their own errors and return empty defaults.
  const reload = useCallback(async () => {
    const moodAtStart = new Map(moodQueues);
    const answersAtStart = new Map(answerQueues);
    const [h, a, m] = await Promise.all([getActiveHabits(), getHabitAnswers(date), getMood(date)]);
    let shown: HabitAnswers = {};
    for (const habit of h) {
      const v = applyRead(answerQueues, answersAtStart, `${date}|${habit.id}`, a[habit.id] ?? null);
      shown = withAnswer(shown, habit.id, v);
    }
    setHabits(h);
    setAnswers(shown);
    setMoodValue(applyRead(moodQueues, moodAtStart, date, m));
    setIsLoading(false);
  }, [date, moodQueues, answerQueues]);

  useEffect(() => {
    reload();
  }, [reload]);

  const answerHabit = useCallback(
    (habitId: string, done: boolean | null) => {
      const key = `${date}|${habitId}`;
      const queue = answerQueues.get(key) ?? newSaveQueue<boolean | null>(null);
      advance(
        answerQueues,
        key,
        queueTap(queue, done),
        (v) => setHabitAnswer(habitId, date, v),
        (v, failed) => {
          if (dateRef.current === date) setAnswers((a) => withAnswer(a, habitId, v));
          if (failed) showToast('error', SAVE_ERROR);
        },
      );
    },
    [date, answerQueues, showToast],
  );

  const chooseMood = useCallback(
    (next: MoodValue | null) => {
      const queue = moodQueues.get(date) ?? newSaveQueue<MoodValue | null>(null);
      advance(
        moodQueues,
        date,
        queueTap(queue, next),
        (v) => setMood(date, v),
        (v, failed) => {
          if (dateRef.current === date) setMoodValue(v);
          if (failed) showToast('error', SAVE_ERROR);
        },
      );
    },
    [date, moodQueues, showToast],
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
