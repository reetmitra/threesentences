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
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

const GOAL = 363;

/**
 * Patterns' answer to "Am I showing up?": nights written leads, the streak is a
 * small sibling. Missed days are simply empty, so no figure here may shout a zero.
 */
export function StreakCounter({ currentStreak, longestStreak, totalEntries }: StreakCounterProps) {
  const c = colors.dark;
  const reduceMotion = useReducedMotion();
  const progressWidth = useSharedValue(0);
  const progressPercent = Math.min(totalEntries / GOAL, 1);
  const toGo = Math.max(GOAL - totalEntries, 0);

  useEffect(() => {
    progressWidth.value = reduceMotion
      ? progressPercent
      : withDelay(400, withTiming(progressPercent, { duration: 800, easing: Easing.out(Easing.ease) }));
  }, [progressPercent, reduceMotion]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(400)}
      style={[styles.container, { backgroundColor: c.surface, borderColor: c.frame }]}
    >
      {/* Hero: nights written */}
      <View style={styles.heroRow}>
        <Text
          family="serifSemiboldItalic"
          fixedSize
          style={[styles.heroNumber, { color: c.textPrimary }]}
        >
          {totalEntries}
        </Text>
        <View style={styles.heroMeta}>
          <Text family="sansSemibold" variant="sm" style={{ color: c.textPrimary }}>
            {totalEntries === 1 ? 'night written' : 'nights written'}
          </Text>
          <Text variant="sm" style={{ color: c.textSecondary }}>
            {toGo === 0 ? 'You made it to 363' : `${toGo} to go`}
          </Text>
        </View>
      </View>

      {/* Streaks, small */}
      <View style={[styles.statsRow, { borderTopColor: c.frame }]}>
        <View style={styles.statItem}>
          <Text family="serifSemiboldItalic" variant="xl" fixedSize style={{ color: c.textPrimary }}>
            {currentStreak}
          </Text>
          <Text variant="xs" style={{ color: c.textSecondary }}>
            Current streak
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: c.frame }]} />

        <View style={styles.statItem}>
          <Text family="serifSemiboldItalic" variant="xl" fixedSize style={{ color: c.textPrimary }}>
            {longestStreak}
          </Text>
          <Text variant="xs" style={{ color: c.textSecondary }}>
            Best streak
          </Text>
        </View>
      </View>

      {/* Progress to 363: the same moonlight as every other "kept" mark */}
      <View style={[styles.progressSection, { borderTopColor: c.frame }]}>
        <View style={styles.progressLabelRow}>
          <Text variant="xs" style={{ color: c.textSecondary }}>
            Progress to 363
          </Text>
          <Text family="mono" variant="xs" style={{ color: c.textSecondary }}>
            {totalEntries}/{GOAL}
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: c.frame }]}>
          <Animated.View
            style={[styles.progressFill, { backgroundColor: c.moon }, progressStyle]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[4],
    gap: spacing[3],
  },
  heroNumber: {
    fontSize: 40,
    lineHeight: 44,
  },
  heroMeta: {
    paddingBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  progressSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  progressTrack: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
});
