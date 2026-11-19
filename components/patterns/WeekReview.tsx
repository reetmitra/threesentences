/**
 * Three™ - Your week (Patterns)
 *
 * A short weekly review: nights written, habits kept, the week's mood shape and one
 * question to think about. Counts only; nothing here reads or shows entry text.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { MoodChart } from '@/components/patterns/MoodChart';
import { colors } from '@/theme/colors';
import { componentRadius, spacing } from '@/theme/spacing';
import { PatternDay, questionForWeek, summarizeWeek } from '@/types/patterns';

interface WeekReviewProps {
  /** The last seven days, oldest first. */
  days: PatternDay[];
  /** Logical today (YYYY-MM-DD); picks this week's question. */
  today: string;
  showHabits: boolean;
  showMood: boolean;
}

export function WeekReview({ days, today, showHabits, showMood }: WeekReviewProps) {
  const { nights, span, kept, answered } = summarizeWeek(days);

  return (
    <View style={styles.card}>
      <Text family="sansSemibold" variant="base" style={styles.title}>
        Your week
      </Text>
      <Text variant="sm" style={styles.line}>
        {`${nights} of ${span} nights written`}
      </Text>
      {showHabits && answered > 0 && (
        <Text variant="sm" style={styles.line}>
          {`${kept} of ${answered} habit check-ins kept`}
        </Text>
      )}
      {showMood && (
        <View style={styles.mood}>
          <MoodChart days={days} range={7} height={72} />
        </View>
      )}
      <View style={styles.question}>
        <Text variant="xs" style={styles.questionLabel}>
          To think about
        </Text>
        <Text family="serifItalic" variant="lg" style={styles.questionText}>
          {questionForWeek(today)}
        </Text>
      </View>
    </View>
  );
}

const c = colors.dark;

const styles = StyleSheet.create({
  card: {
    backgroundColor: c.surface,
    borderColor: c.frame,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: componentRadius.card,
    padding: spacing[4],
    marginBottom: spacing[5],
  },
  title: { color: c.textPrimary, marginBottom: spacing[2] },
  line: { color: c.textSecondary, marginBottom: spacing[1] },
  mood: { marginTop: spacing[3] },
  question: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.frame,
  },
  questionLabel: { color: c.textSecondary, marginBottom: spacing[1] },
  questionText: { color: c.textPrimary },
});
