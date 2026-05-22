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

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

export function StreakCounter({ currentStreak, longestStreak, totalEntries }: StreakCounterProps) {
  const c = colors.dark;
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
      style={[styles.container, { backgroundColor: c.surface, borderColor: c.frame }]}
    >
      {/* Hero streak numeral */}
      <View style={styles.heroRow}>
        <Text
          family="serifSemiboldItalic"
          fixedSize
          style={[styles.heroNumber, { color: c.textPrimary }]}
        >
          {currentStreak}
        </Text>
        <View style={styles.heroMeta}>
          <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5 }}>
            Day streak
          </Text>
          {currentStreak > 0 && (
            <Text family="mono" variant="xs" style={{ color: c.textTertiary, marginTop: 2, textTransform: 'uppercase' }}>
              keep going
            </Text>
          )}
        </View>
      </View>

      {/* 3-stat tiles */}
      <View style={[styles.statsRow, { borderTopColor: c.frame }]}>
        <View style={styles.statItem}>
          <Text family="serifSemiboldItalic" variant="2xl" fixedSize style={{ color: c.textPrimary }}>
            {longestStreak}
          </Text>
          <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1 }}>
            Best
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: c.frame }]} />

        <View style={styles.statItem}>
          <Text family="serifSemiboldItalic" variant="2xl" fixedSize style={{ color: c.textPrimary }}>
            {totalEntries}
          </Text>
          <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1 }}>
            Total
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: c.frame }]} />

        <View style={styles.statItem}>
          <Text family="serifSemiboldItalic" variant="2xl" fixedSize style={{ color: c.textPrimary }}>
            {363 - totalEntries > 0 ? 363 - totalEntries : 0}
          </Text>
          <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1 }}>
            To go
          </Text>
        </View>
      </View>

      {/* Progress to 363 */}
      <View style={[styles.progressSection, { borderTopColor: c.frame }]}>
        <View style={styles.progressLabelRow}>
          <Text family="mono" variant="xs" style={{ color: c.textTertiary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Progress to 363
          </Text>
          <Text family="mono" variant="xs" style={{ color: c.textTertiary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {totalEntries}/363
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: c.frame }]}>
          <Animated.View
            style={[styles.progressFill, { backgroundColor: c.textBright }, progressStyle]}
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
    fontSize: 64,
    lineHeight: 68,
  },
  heroMeta: {
    paddingBottom: 6,
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
