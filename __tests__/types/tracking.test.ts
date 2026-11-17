import {
  DEFAULT_SETTINGS,
  mapToUserSettings,
  DbUserSettings,
  DbHabit,
  validateHabitName,
  nextFreeHabitPosition,
  suggestHabits,
  isMoodValue,
  MOOD_LABELS,
  mapToHabit,
  HabitPosition,
  MoodValue,
  SaveQueue,
  newSaveQueue,
  shownValue,
  queueTap,
  settleSave,
  applyServerValue,
} from '@/types/tracking';

const row = (over: Partial<DbUserSettings>): DbUserSettings => ({
  user_id: 'u',
  day_rollover_hour: 4,
  trackers: { habits: true, mood: true },
  updated_at: '2026-01-01T00:00:00Z',
  ...over,
});

describe('mapToUserSettings', () => {
  it('returns defaults for null', () => {
    expect(mapToUserSettings(null)).toEqual(DEFAULT_SETTINGS);
  });
  it('falls back on invalid hour and garbage trackers', () => {
    expect(mapToUserSettings(row({ day_rollover_hour: 9, trackers: 'garbage' }))).toEqual(DEFAULT_SETTINGS);
  });
  it('maps a valid row', () => {
    expect(
      mapToUserSettings(row({ day_rollover_hour: 2, trackers: { habits: false, mood: true } })),
    ).toEqual({ dayRolloverHour: 2, trackers: { habits: false, mood: true } });
  });
});

describe('validateHabitName', () => {
  it('rejects empty', () => {
    expect(validateHabitName('   ')).toEqual({ ok: false, error: 'Give it a name.' });
  });
  it('trims', () => {
    expect(validateHabitName('  No alcohol  ')).toEqual({ ok: true, name: 'No alcohol' });
  });
  it('enforces 40 chars', () => {
    expect(validateHabitName('a'.repeat(41))).toEqual({ ok: false, error: 'Keep it to 40 characters.' });
    expect(validateHabitName('a'.repeat(40)).ok).toBe(true);
  });
});

describe('nextFreeHabitPosition', () => {
  const p = (...n: HabitPosition[]) => n.map((position) => ({ position }));
  it('lowest free slot', () => {
    expect(nextFreeHabitPosition([])).toBe(0);
    expect(nextFreeHabitPosition(p(0, 2))).toBe(1);
  });
  it('returns null when full', () => {
    expect(nextFreeHabitPosition(p(0, 1, 2))).toBeNull();
  });
});

describe('suggestHabits', () => {
  it('puts sleep habits first and drops active ones', () => {
    const out = suggestHabits(['sleep-optimization'], ['no alcohol']);
    expect(out.slice(0, 2)).toEqual(['In bed by 1am', 'No phone in bed']);
    expect(out).not.toContain('No alcohol');
  });
  it('puts Moved 20 min first for fitness interests', () => {
    expect(suggestHabits(['hyrox'], [])[0]).toBe('Moved 20 min');
  });
});

describe('mood', () => {
  it('isMoodValue', () => {
    expect(isMoodValue(3)).toBe(true);
    expect(isMoodValue(0)).toBe(false);
    expect(isMoodValue(6)).toBe(false);
    expect(isMoodValue('3')).toBe(false);
  });
  it('labels', () => {
    expect(MOOD_LABELS[1]).toBe('rough');
    expect(MOOD_LABELS[5]).toBe('great');
  });
});

describe('mapToHabit', () => {
  it('maps created_at and position', () => {
    const row: DbHabit = {
      id: 'h', user_id: 'u', name: 'Read', position: 2, link: null,
      created_at: '2026-01-01T00:00:00Z', archived_at: null,
    };
    expect(mapToHabit(row)).toEqual({ id: 'h', name: 'Read', position: 2, createdAt: '2026-01-01T00:00:00Z' });
  });
});

describe('check-in save queue', () => {
  type Mood = MoodValue | null;

  // Drives a queue the way useCheckIn does and records every write sent.
  function driver<V>(confirmed: V) {
    let q: SaveQueue<V> = newSaveQueue(confirmed);
    const sent: V[] = [];
    const failures: boolean[] = [];
    const take = (step: { queue: SaveQueue<V>; send: { value: V } | null; failed: boolean }) => {
      q = step.queue;
      if (step.send) sent.push(step.send.value);
      failures.push(step.failed);
    };
    return {
      tap: (v: V) => take(queueTap(q, v)),
      settle: (ok: boolean) => take(settleSave(q, ok)),
      shown: () => shownValue(q),
      queue: () => q,
      sent,
      toasts: () => failures.filter(Boolean).length,
    };
  }

  it('fail then fail in order: good then great both fail shows the last saved mood', () => {
    const d = driver<Mood>(3);
    d.tap(4);
    d.tap(5);
    expect(d.shown()).toBe(5);
    d.settle(false); // "good" fails; "great" goes out next
    expect(d.sent).toEqual([4, 5]);
    expect(d.shown()).toBe(5);
    d.settle(false); // "great" fails
    expect(d.shown()).toBe(3);
    expect(d.queue().confirmed).toBe(3);
    expect(d.toasts()).toBe(1);
  });

  it('habit double-tap (check, then clear) both failing ends on the saved answer', () => {
    const d = driver<boolean | null>(null);
    d.tap(true);
    d.tap(null);
    d.settle(false);
    d.settle(false);
    expect(d.sent).toEqual([true, null]);
    expect(d.shown()).toBeNull();
    expect(d.toasts()).toBe(1);
  });

  it('success then success persists the last tapped value, in tap order', () => {
    const d = driver<Mood>(3);
    d.tap(4);
    d.tap(5);
    d.settle(true);
    expect(d.queue().confirmed).toBe(4);
    expect(d.shown()).toBe(5);
    d.settle(true);
    expect(d.sent).toEqual([4, 5]);
    expect(d.queue().confirmed).toBe(5);
    expect(d.shown()).toBe(5);
    expect(d.toasts()).toBe(0);
  });

  it('never sends a second write while one is in flight; only the latest waiting tap goes out', () => {
    const d = driver<Mood>(null);
    d.tap(1);
    d.tap(2);
    d.tap(3);
    d.tap(4);
    expect(d.sent).toEqual([1]);
    d.settle(true);
    d.settle(true);
    expect(d.sent).toEqual([1, 4]);
    expect(d.shown()).toBe(4);
  });

  it('success then failure rolls back to the value that did save', () => {
    const d = driver<boolean | null>(null);
    d.tap(true);
    d.tap(false);
    d.settle(true);
    d.settle(false);
    expect(d.shown()).toBe(true);
    expect(d.toasts()).toBe(1);
  });

  it('a failure with a newer tap waiting sends it without rolling back', () => {
    const d = driver<Mood>(2);
    d.tap(4);
    d.tap(5);
    d.settle(false);
    d.settle(true);
    expect(d.shown()).toBe(5);
    expect(d.queue().confirmed).toBe(5);
    expect(d.toasts()).toBe(0);
  });

  describe('applyServerValue', () => {
    it('creates a queue from the server value', () => {
      expect(applyServerValue<Mood>(undefined, undefined, 3)).toEqual(newSaveQueue(3));
    });

    it('updates the saved value of an unchanged idle queue', () => {
      const q = newSaveQueue<Mood>(2);
      expect(shownValue(applyServerValue(q, q, 4))).toBe(4);
    });

    it('keeps showing a pending tap but records the server value as saved', () => {
      const q = queueTap(newSaveQueue<Mood>(2), 5).queue;
      const next = applyServerValue(q, q, 3);
      expect(shownValue(next)).toBe(5);
      expect(next.confirmed).toBe(3);
    });

    it('ignores a read that started before a tap or a save landed', () => {
      const atStart = newSaveQueue<Mood>(2);
      const tapped = queueTap(atStart, 5);
      const saved = settleSave(tapped.queue, true).queue; // 5 saved during the read
      expect(applyServerValue(saved, atStart, 2)).toBe(saved);
      expect(applyServerValue(tapped.queue, undefined, null)).toBe(tapped.queue);
    });
  });
});
