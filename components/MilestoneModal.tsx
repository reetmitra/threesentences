/**
 * Three™ - Milestone Modal
 *
 * Celebrates streak milestones with animated count-up and themed messages.
 * Uses BottomSheet for consistent presentation.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Flame, Trophy, Star, Zap } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const MILESTONES: Record<number, { icon: 'flame' | 'star' | 'trophy' | 'zap'; message: string; subtitle: string }> = {
  3: { icon: 'flame', message: 'Three days strong!', subtitle: 'You\'re building momentum.' },
  7: { icon: 'flame', message: 'One week strong!', subtitle: 'The habit is forming.' },
  14: { icon: 'star', message: 'Two weeks!', subtitle: 'Consistency is your superpower.' },
  30: { icon: 'trophy', message: 'A full month!', subtitle: 'You\'re proving something to yourself.' },
  60: { icon: 'star', message: 'Sixty days!', subtitle: 'This is who you are now.' },
  100: { icon: 'zap', message: 'Triple digits!', subtitle: 'One hundred days of showing up.' },
  200: { icon: 'trophy', message: 'Two hundred days!', subtitle: 'Relentless.' },
  363: { icon: 'trophy', message: 'You did it.', subtitle: 'ThreeSixtyThree. The full commitment.' },
  365: { icon: 'zap', message: 'A full year!', subtitle: 'Beyond the goal. Beyond perfection.' },
};

/** Check if a streak count is a milestone */
export function isMilestone(streak: number): boolean {
  return streak in MILESTONES;
}

interface MilestoneModalProps {
  visible: boolean;
  streak: number;
  onClose: () => void;
}

const IconMap = {
  flame: Flame,
  star: Star,
  trophy: Trophy,
  zap: Zap,
};

export function MilestoneModal({ visible, streak, onClose }: MilestoneModalProps) {
  const activeColors = colors.dark;
  const milestone = MILESTONES[streak];

  const iconScale = useSharedValue(0);
  const numberScale = useSharedValue(0);

  useEffect(() => {
    if (visible && milestone) {
      iconScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.3, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 12, stiffness: 200 })
        )
      );
      numberScale.value = withDelay(
        500,
        withSpring(1, { damping: 10, stiffness: 180 })
      );
    } else {
      iconScale.value = 0;
      numberScale.value = 0;
    }
  }, [visible]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  if (!milestone) return null;

  const Icon = IconMap[milestone.icon];

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight={0.5}>
      <View style={styles.content}>
        {/* Animated icon */}
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <Icon size={48} color={activeColors.accent} strokeWidth={1.5} />
        </Animated.View>

        {/* Animated streak number */}
        <Animated.View style={numberStyle}>
          <Text variant="3xl" weight="bold" centered style={styles.streakNumber}>
            Day {streak}
          </Text>
        </Animated.View>

        {/* Message */}
        <Animated.View entering={FadeIn.delay(700).duration(400)}>
          <Text variant="xl" weight="semibold" centered style={styles.message}>
            {milestone.message}
          </Text>
          <Text variant="base" color="secondary" centered style={styles.subtitle}>
            {milestone.subtitle}
          </Text>
        </Animated.View>

        {/* Dismiss */}
        <Animated.View entering={FadeIn.delay(1000).duration(300)}>
          <Button
            title="Keep Going"
            onPress={onClose}
            style={styles.button}
          />
        </Animated.View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  streakNumber: {
    marginBottom: spacing[2],
  },
  message: {
    marginBottom: spacing[1],
  },
  subtitle: {
    marginBottom: spacing[6],
    lineHeight: 22,
  },
  button: {
    minWidth: 160,
  },
});
