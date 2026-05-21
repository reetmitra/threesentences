/**
 * Three™ - Milestone Modal
 *
 * Celebrates streak milestones with animated count-up and themed messages.
 */

import React, { useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing, componentRadius } from '@/theme/spacing';

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

export function MilestoneModal({ visible, streak, onClose }: MilestoneModalProps) {
  const c = colors.dark;
  const milestone = MILESTONES[streak];

  const numberScale = useSharedValue(0);

  useEffect(() => {
    if (visible && milestone) {
      numberScale.value = withDelay(
        500,
        withSpring(1, { damping: 10, stiffness: 180 })
      );
    } else {
      numberScale.value = 0;
    }
  }, [visible]);

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  if (!milestone) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View
          style={[styles.sheet, { backgroundColor: c.surface, borderColor: c.frame }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Animated streak number */}
          <Animated.View style={numberStyle}>
            <Text
              family="serifSemiboldItalic"
              fixedSize
              style={{ fontSize: 80, color: c.textPrimary, marginBottom: spacing[2] }}
            >
              {streak}
            </Text>
          </Animated.View>

          {/* Message */}
          <Animated.View entering={FadeIn.delay(700).duration(400)}>
            <Text family="sansSemibold" variant="xl" style={{ color: c.textPrimary, marginBottom: spacing[2] }}>
              {milestone.message}
            </Text>
            <Text serif variant="base" style={{ color: c.textSecondary, lineHeight: 26, marginBottom: spacing[6] }}>
              {milestone.subtitle}
            </Text>
          </Animated.View>

          {/* Dismiss */}
          <Animated.View entering={FadeIn.delay(1000).duration(300)}>
            <Button title="Continue" onPress={onClose} />
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6,6,8,0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: componentRadius.bottomSheet,
    borderTopRightRadius: componentRadius.bottomSheet,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    padding: spacing[6],
    paddingBottom: spacing[8],
  },
});
