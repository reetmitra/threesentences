/**
 * Three™ - Streak Badge Component
 *
 * Displays current streak with animated entrance.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
} from 'react-native-reanimated';
import { Flame } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface StreakBadgeProps {
  currentStreak: number;
  /** Compact mode for headers (inline, smaller) */
  compact?: boolean;
}

export function StreakBadge({ currentStreak, compact = false }: StreakBadgeProps) {
  const activeColors = colors.dark;
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 180 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (currentStreak === 0) return null;

  if (compact) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.compactContainer}
      >
        <Flame size={14} color={colors.dark.warning} strokeWidth={2} />
        <Text variant="sm" family="sansSemibold" style={{ color: colors.dark.warning }}>
          {currentStreak}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Flame size={32} color={activeColors.warning} strokeWidth={2} />
      <Text variant="3xl" family="sansBold" style={{ color: activeColors.textPrimary }}>
        {currentStreak}
      </Text>
      <Text variant="sm" color="secondary">
        day streak
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing[1],
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(240, 180, 41, 0.15)',
  },
});
