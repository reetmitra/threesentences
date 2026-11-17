/**
 * Three™ - Day Detail (Patterns)
 *
 * Read-only view of one day: entry, mood, habit answers.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { EntryCard } from '@/components/EntryCard';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Entry, parseDateString } from '@/types/entry';
import { PatternDay } from '@/types/patterns';
import { Habit, MOOD_LABELS } from '@/types/tracking';

interface DayDetailProps {
  date: string;
  entry: Entry | null;
  day: PatternDay | null;
  habits: Habit[];
  isToday: boolean;
  onOpenToday: () => void;
}

export function DayDetail({ date, entry, day, habits, isToday, onOpenToday }: DayDetailProps) {
  const dateLabel = parseDateString(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const answered = habits.filter((h) => typeof day?.answers[h.id] === 'boolean');

  return (
    <View style={styles.container}>
      <Text family="mono" variant="xs" uppercase style={styles.eyebrow}>
        {dateLabel}
      </Text>

      {entry ? (
        <EntryCard entry={entry} />
      ) : (
        <Text variant="sm" style={styles.secondary}>
          No entry this day.
        </Text>
      )}

      {day?.mood != null && (
        <View style={styles.line} accessible accessibilityLabel={`Mood, ${MOOD_LABELS[day.mood]}`}>
          <Text variant="sm" style={styles.secondary}>
            Mood
          </Text>
          <Text variant="sm" style={styles.primary}>
            {MOOD_LABELS[day.mood]}
          </Text>
        </View>
      )}

      {answered.map((h) => {
        const done = day?.answers[h.id] === true;
        return (
          <View
            key={h.id}
            style={styles.line}
            accessible
            accessibilityLabel={`${h.name}, ${done ? 'done' : 'not done'}`}
          >
            <View style={styles.mark}>
              {done ? (
                <Icon name="check" size={16} color={c.textBright} />
              ) : (
                <Text variant="sm" style={styles.secondary}>
                  —
                </Text>
              )}
            </View>
            <Text variant="sm" style={styles.primary}>
              {h.name}
            </Text>
          </View>
        );
      })}

      {isToday && (
        <Pressable onPress={onOpenToday} style={styles.link} accessibilityRole="link">
          <Text variant="sm" style={styles.linkText}>
            Open Today
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const c = colors.dark;

const styles = StyleSheet.create({
  container: { gap: spacing[3] },
  eyebrow: { color: c.textSecondary, letterSpacing: 1.5 },
  secondary: { color: c.textSecondary },
  primary: { color: c.textPrimary, flexShrink: 1 },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  mark: { width: spacing[4], alignItems: 'center' },
  link: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  linkText: { color: c.textPrimary, textDecorationLine: 'underline' },
});
