/**
 * Three™ - Habit Check List ("Your three")
 *
 * One row per habit with ✓ (done) and — (not done). Tapping the active
 * answer clears it; unanswered is simply empty, never "missed".
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Icon } from '@/components/ui/Icon';
import { colors } from '@/theme/colors';
import { spacing, componentRadius } from '@/theme/spacing';
import { Habit, HabitAnswers } from '@/types/tracking';

const c = colors.dark;

interface HabitCheckListProps {
  habits: Habit[];
  answers: HabitAnswers;
  onAnswer: (habitId: string, done: boolean | null) => void;
  onEdit: () => void;
}

export function HabitCheckList({ habits, answers, onAnswer, onEdit }: HabitCheckListProps) {
  return (
    <View>
      <Pressable
        onPress={onEdit}
        style={styles.eyebrowButton}
        accessibilityRole="button"
        accessibilityLabel="Your three. Edit habits"
      >
        <Text family="mono" variant="xs" uppercase style={styles.eyebrow}>
          Your three
        </Text>
      </Pressable>

      {habits.length === 0 ? (
        <Pressable onPress={onEdit} style={styles.emptyRow} accessibilityRole="button">
          <Text variant="base" style={styles.emptyText}>
            Choose up to three things to check in on
          </Text>
        </Pressable>
      ) : (
        habits.map((habit) => {
          const answer = answers[habit.id];
          return (
            <View key={habit.id} style={styles.row}>
              <Text variant="base" style={styles.name} numberOfLines={2}>
                {habit.name}
              </Text>
              <AnswerButton
                selected={answer === true}
                label={`${habit.name}, done`}
                onPress={() => onAnswer(habit.id, answer === true ? null : true)}
              >
                <Icon name="check" size={20} color={answer === true ? c.paper : c.textSecondary} />
              </AnswerButton>
              <AnswerButton
                selected={answer === false}
                label={`${habit.name}, not done`}
                onPress={() => onAnswer(habit.id, answer === false ? null : false)}
              >
                <Text variant="lg" style={answer === false ? styles.dashSelected : styles.dash}>
                  —
                </Text>
              </AnswerButton>
            </View>
          );
        })
      )}
    </View>
  );
}

function AnswerButton({
  selected,
  label,
  onPress,
  children,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.answer, selected && styles.answerSelected]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  eyebrowButton: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  eyebrow: { color: c.textSecondary, letterSpacing: 1.5 },
  emptyRow: { minHeight: 44, justifyContent: 'center' },
  emptyText: { color: c.textSecondary, textDecorationLine: 'underline' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: 52,
  },
  name: { flex: 1, color: c.textPrimary },
  answer: {
    width: 44,
    height: 44,
    borderRadius: componentRadius.chip,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerSelected: { backgroundColor: c.textBright },
  dash: { color: c.textSecondary },
  dashSelected: { color: c.paper },
});
