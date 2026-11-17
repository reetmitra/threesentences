/**
 * Three™ - Habit Grid (Patterns)
 *
 * Per habit, one cell per day: filled = done, outline = not done,
 * empty space = unanswered. Never red; no streak language.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { habitStats, PatternDay, RangeDays, summarizeHabit } from '@/types/patterns';
import { Habit } from '@/types/tracking';

interface HabitGridProps {
  habits: Habit[];
  days: PatternDay[];
  range: RangeDays;
}

export function HabitGrid({ habits, days, range }: HabitGridProps) {
  if (habits.length === 0) {
    return (
      <Text variant="sm" style={styles.empty}>
        Add habits on Today to see them here.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {habits.map((habit) => {
        const stats = habitStats(days, habit.id);
        return (
          <View
            key={habit.id}
            accessible
            accessibilityLabel={summarizeHabit(habit.name, stats, range)}
          >
            <View style={styles.header}>
              <Text variant="sm" numberOfLines={1} style={styles.name}>
                {habit.name}
              </Text>
              <Text family="mono" variant="xs" style={styles.count}>
                {`${stats.done}/${stats.answered}`}
              </Text>
            </View>
            {/* flex: 1 + gap: each cell gets the row width / days, less the 2pt gap. */}
            <View style={styles.cells}>
              {days.map((d) => {
                const a = d.answers[habit.id];
                return (
                  <View
                    key={d.date}
                    style={[styles.cell, a === true && styles.done, a === false && styles.notDone]}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const c = colors.dark;

const styles = StyleSheet.create({
  empty: { color: c.textSecondary },
  list: { gap: spacing[4] },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[2],
    marginBottom: spacing[1.5],
  },
  name: { flex: 1, color: c.textPrimary },
  count: { color: c.textSecondary },
  cells: { flexDirection: 'row', gap: 2, height: spacing[4] },
  cell: { flex: 1, borderRadius: radius.sm },
  done: { backgroundColor: c.textBright },
  notDone: { borderWidth: 1, borderColor: c.frame },
});
