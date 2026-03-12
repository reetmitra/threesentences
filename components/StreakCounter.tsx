/**
 * Three™ - Streak Counter Component
 *
 * Card showing current/longest streak and progress toward 363.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeInDown,
  Easing,
} from 'react-native-reanimated';
import { Flame, Trophy, Target } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  totalEntries,
}: StreakCounterProps) {
  const activeColors = colors.dark;
  const progressWidth = useSharedValue(0);

  const progressPercent = Math.min(totalEntries / 363, 1);

  useEffect(() => {
    progressWidth.value = withDelay(
      400,
      withTiming(progressPercent, { duration: 800, easing: Easing.out(Easing.ease) })
    );
  }, [progressPercent]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[styles.container, { backgroundColor: activeColors.surface }]}
    >
      {/* Streak stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Flame size={20} color={activeColors.warning} strokeWidth={2} />
          <Text variant="2xl" weight="bold">
            {currentStreak}
          </Text>
          <Text variant="xs" color="secondary">
            Current
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: activeColors.border }]} />

        <View style={styles.statItem}>
          <Trophy size={20} color={activeColors.textSecondary} strokeWidth={2} />
          <Text variant="2xl" weight="bold">
            {longestStreak}
          </Text>
          <Text variant="xs" color="secondary">
            Longest
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: activeColors.border }]} />

        <View style={styles.statItem}>
          <Target size={20} color={activeColors.textSecondary} strokeWidth={2} />
          <Text variant="2xl" weight="bold">
            {totalEntries}
          </Text>
          <Text variant="xs" color="secondary">
            Total
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text variant="xs" color="tertiary">
            Progress to 363
          </Text>
          <Text variant="xs" color="tertiary">
            {totalEntries}/363
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: activeColors.background }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: activeColors.accent },
              progressStyle,
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  divider: {
    width: 1,
    height: 48,
  },
  progressSection: {
    marginTop: spacing[4],
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
