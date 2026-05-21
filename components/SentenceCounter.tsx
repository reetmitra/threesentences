import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface SentenceCounterProps {
  count: number;
  target?: number;
}

export function SentenceCounter({ count, target = 3 }: SentenceCounterProps) {
  const c = colors.dark;
  const remaining = target - count;
  const isComplete = count === target;
  const isOver = count > target;

  const statusText = isOver
    ? 'too many'
    : isComplete
    ? 'ready'
    : `${remaining} more`;

  const counterColor = isOver ? c.warn : isComplete ? c.textBright : c.textSecondary;

  return (
    <View style={styles.container} accessibilityLabel={`${count} of ${target} sentences`}>
      <Text
        family="monoMedium"
        variant="base"
        fixedSize
        style={{ color: counterColor, letterSpacing: 1 }}
      >
        {count} / {target} · {statusText}
      </Text>

      {isOver && (
        <Text
          family="serifItalic"
          variant="sm"
          style={[styles.advisory, { color: c.warn }]}
        >
          The constraint is the point. Cut one.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing[2],
    gap: 6,
  },
  advisory: {
    marginTop: 2,
  },
});
