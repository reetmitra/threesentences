import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EASE_OUT = Easing.out(Easing.ease);

interface SentenceCounterProps {
  count: number;
  target?: number;
}

export function SentenceCounter({ count, target = 3 }: SentenceCounterProps) {
  const c = colors.dark;
  const reduced = useReducedMotion();
  const isOver = count > target;
  const isComplete = count === target;

  const advisoryOpacity = useSharedValue(0);
  const advisoryY = useSharedValue(12);

  useEffect(() => {
    const inDur = reduced ? 0 : 300;
    const outDur = reduced ? 0 : 150;
    if (isOver) {
      advisoryOpacity.value = withTiming(1, { duration: inDur, easing: EASE_OUT });
      advisoryY.value = withTiming(0, { duration: inDur, easing: EASE_OUT });
    } else {
      advisoryOpacity.value = withTiming(0, { duration: outDur, easing: EASE_OUT });
      advisoryY.value = withTiming(12, { duration: outDur, easing: EASE_OUT });
    }
  }, [isOver, reduced]);

  const advisoryStyle = useAnimatedStyle(() => ({
    opacity: advisoryOpacity.value,
    transform: [{ translateY: advisoryY.value }],
  }));

  const statusText = isOver
    ? 'too many'
    : isComplete
    ? 'ready'
    : `${target - count} more`;

  // Spec §1.4: 0/1/2 → grey, 3 → bright, 4+ → amber
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

      <Animated.View style={advisoryStyle}>
        <Text
          family="serifItalic"
          variant="sm"
          style={{ color: c.warn }}
        >
          The constraint is the point. Cut one.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing[2],
    gap: 6,
  },
});
