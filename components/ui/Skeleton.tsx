/**
 * Three™ - Skeleton Loading Components
 *
 * Animated shimmer placeholders for loading states.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.35);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      opacity.value = 0.5;
      return;
    }
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.dark.surfaceHi,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Single line skeleton */
export function SkeletonLine({
  width = '100%',
  height = 14,
  style,
}: {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}) {
  return <Skeleton width={width} height={height} borderRadius={4} style={style} />;
}

/** Card-shaped skeleton */
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <SkeletonLine width="60%" height={12} />
      <SkeletonLine width="40%" height={20} style={{ marginTop: spacing[2] }} />
      <SkeletonLine width="80%" height={12} style={{ marginTop: spacing[3] }} />
      <SkeletonLine width="50%" height={12} style={{ marginTop: spacing[2] }} />
    </View>
  );
}

/** Today screen loading skeleton */
export function SkeletonToday() {
  return (
    <View style={styles.todayContainer}>
      <SkeletonLine width="45%" height={12} />
      <SkeletonLine width="55%" height={24} style={{ marginTop: spacing[2] }} />
      <Skeleton
        width="100%"
        height={200}
        borderRadius={12}
        style={{ marginTop: spacing[5] }}
      />
      <View style={styles.todayFooter}>
        <SkeletonLine width="30%" height={16} />
        <Skeleton width="100%" height={56} borderRadius={28} style={{ marginTop: spacing[4] }} />
      </View>
    </View>
  );
}

/** Calendar grid skeleton */
export function SkeletonCalendar() {
  return (
    <View style={styles.calendarContainer}>
      {/* Month nav */}
      <View style={styles.calendarNav}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <SkeletonLine width="40%" height={20} />
        <Skeleton width={44} height={44} borderRadius={22} />
      </View>
      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {/* Day headers */}
        <View style={styles.calendarRow}>
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonLine key={`h-${i}`} width={24} height={12} style={styles.calendarCell} />
          ))}
        </View>
        {/* 5 rows of days */}
        {Array.from({ length: 5 }).map((_, row) => (
          <View key={`r-${row}`} style={styles.calendarRow}>
            {Array.from({ length: 7 }).map((_, col) => (
              <Skeleton
                key={`c-${row}-${col}`}
                width={36}
                height={36}
                borderRadius={18}
                style={styles.calendarCell}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

/** Friend card skeleton */
export function SkeletonFriendCard() {
  return (
    <View style={styles.friendCard}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.friendCardContent}>
        <SkeletonLine width="50%" height={16} />
        <SkeletonLine width="30%" height={12} style={{ marginTop: spacing[1] }} />
      </View>
      <Skeleton width={72} height={32} borderRadius={16} />
    </View>
  );
}

/** Social screen friends list skeleton */
export function SkeletonFriendsList() {
  return (
    <View>
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonFriendCard key={i} />
      ))}
    </View>
  );
}

/** Conversation list skeleton */
export function SkeletonConversations() {
  return (
    <View>
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={styles.conversationRow}>
          <Skeleton width={48} height={48} borderRadius={24} />
          <View style={styles.conversationContent}>
            <SkeletonLine width="45%" height={16} />
            <SkeletonLine width="70%" height={12} style={{ marginTop: spacing[2] }} />
          </View>
          <SkeletonLine width={40} height={10} />
        </View>
      ))}
    </View>
  );
}

/** Stats card skeleton */
export function SkeletonStatsCard() {
  return (
    <View style={styles.statsCard}>
      <SkeletonLine width={60} height={32} />
      <SkeletonLine width={80} height={14} style={{ marginTop: spacing[2] }} />
    </View>
  );
}

/** Reflect section skeleton */
export function SkeletonReflect() {
  return (
    <View style={styles.reflectContainer}>
      <SkeletonLine width="40%" height={24} />
      <SkeletonLine width="70%" height={14} style={{ marginTop: spacing[2] }} />
      <View style={styles.reflectCard}>
        <SkeletonLine width="60%" height={16} />
        <SkeletonLine width="80%" height={12} style={{ marginTop: spacing[3] }} />
        <View style={styles.reflectButtons}>
          <Skeleton width="30%" height={40} borderRadius={12} />
          <Skeleton width="30%" height={40} borderRadius={12} />
          <Skeleton width="30%" height={40} borderRadius={12} />
        </View>
        <Skeleton width="100%" height={48} borderRadius={12} style={{ marginTop: spacing[4] }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: spacing[4],
  },
  todayContainer: {
    flex: 1,
    padding: spacing[4],
  },
  todayFooter: {
    marginTop: 'auto',
    paddingTop: spacing[6],
  },
  calendarContainer: {
    padding: spacing[4],
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  calendarGrid: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: spacing[3],
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing[2],
  },
  calendarCell: {
    alignSelf: 'center',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  friendCardContent: {
    flex: 1,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  conversationContent: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: spacing[5],
    alignItems: 'center',
  },
  reflectContainer: {
    padding: spacing[4],
  },
  reflectCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: spacing[4],
    marginTop: spacing[4],
  },
  reflectButtons: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
  },
});
