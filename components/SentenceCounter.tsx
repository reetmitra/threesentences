/**
 * ThreeSixtyThree™ Three Sentences - Sentence Counter
 * 
 * Displays current sentence count in "X/3" format.
 * Uses monospace numerals to prevent layout shift.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

interface SentenceCounterProps {
  count: number;
  target?: number;
}

export function SentenceCounter({ count, target = 3 }: SentenceCounterProps) {
  const activeColors = colors.dark;

  const isComplete = count === target;
  const isOver = count > target;

  const getColor = () => {
    if (isOver) return activeColors.error;
    if (isComplete) return activeColors.accent;
    return activeColors.textSecondary;
  };

  return (
    <View style={styles.container}>
      <Text
        variant="xl"
        weight="bold"
        mono
        fixedSize
        style={[styles.count, { color: getColor() }]}
        accessibilityLabel={`${count} of ${target} sentences`}
        accessibilityRole="text"
      >
        {count}/{target}
      </Text>
      {isComplete && (
        <Text variant="sm" color="secondary" style={styles.hint}>
          Ready to submit
        </Text>
      )}
      {isOver && (
        <Text variant="sm" style={[styles.hint, { color: activeColors.error }]}>
          Too many sentences
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  count: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  hint: {
    marginTop: 4,
  },
});
