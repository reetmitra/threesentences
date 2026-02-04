/**
 * ThreeSixtyThree™ Three Sentences - Category Chip Component
 *
 * Animated selectable chip for interest categories.
 * Uses React Native Reanimated for smooth spring animations.
 */

import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Brain,
  Dumbbell,
  Palette,
  Target,
  Heart,
  Briefcase,
  TrendingUp,
  Activity,
  BookOpen,
  Sun,
  Compass,
  Users,
  LucideIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Map icon names to lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  brain: Brain,
  dumbbell: Dumbbell,
  palette: Palette,
  target: Target,
  heart: Heart,
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  activity: Activity,
  'book-open': BookOpen,
  sun: Sun,
  compass: Compass,
  users: Users,
};

interface CategoryChipProps {
  id: string;
  label: string;
  icon: string;
  selected: boolean;
  onPress: (id: string) => void;
  index?: number; // For staggered animations
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.8,
};

export function CategoryChip({
  id,
  label,
  icon,
  selected,
  onPress,
  index = 0,
}: CategoryChipProps) {
  const activeColors = colors.dark;
  const scale = useSharedValue(1);
  const selection = useSharedValue(selected ? 1 : 0);
  const entrance = useSharedValue(0);

  // Entrance animation on mount
  React.useEffect(() => {
    const delay = index * 50; // Stagger delay
    const timeout = setTimeout(() => {
      entrance.value = withSpring(1, {
        damping: 12,
        stiffness: 100,
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [entrance, index]);

  // Update selection animation when selected prop changes
  React.useEffect(() => {
    selection.value = withSpring(selected ? 1 : 0, SPRING_CONFIG);
  }, [selected, selection]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.92, SPRING_CONFIG);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(
      selected
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Medium
    );
    onPress(id);
  }, [id, onPress, selected]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      selection.value,
      [0, 1],
      [activeColors.surface, activeColors.accent]
    );

    const borderColor = interpolateColor(
      selection.value,
      [0, 1],
      [activeColors.border, activeColors.accent]
    );

    return {
      transform: [
        { scale: scale.value },
        { translateY: interpolate(entrance.value, [0, 1], [20, 0]) },
      ],
      opacity: entrance.value,
      backgroundColor,
      borderColor,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      selection.value,
      [0, 1],
      [activeColors.textPrimary, activeColors.background]
    );

    return { color };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(selected ? 1.1 : 1, {
            duration: 200,
            easing: Easing.out(Easing.cubic),
          }),
        },
      ],
    };
  });

  const IconComponent = ICON_MAP[icon] || Target;
  const iconColor = selected ? activeColors.background : activeColors.textPrimary;

  return (
    <AnimatedPressable
      style={[styles.container, animatedContainerStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${label}, ${selected ? 'selected' : 'not selected'}`}
    >
      <Animated.View style={animatedIconStyle}>
        <IconComponent size={20} color={iconColor} strokeWidth={2} />
      </Animated.View>
      <Animated.Text style={[styles.label, animatedTextStyle]}>
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

/**
 * Hobby chip - smaller, removable variant
 */
interface HobbyChipProps {
  label: string;
  onRemove?: () => void;
  index?: number;
}

export function HobbyChip({ label, onRemove, index = 0 }: HobbyChipProps) {
  const activeColors = colors.dark;
  const scale = useSharedValue(1);
  const entrance = useSharedValue(0);

  React.useEffect(() => {
    const delay = index * 30;
    const timeout = setTimeout(() => {
      entrance.value = withSpring(1, {
        damping: 14,
        stiffness: 120,
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [entrance, index]);

  const handlePressIn = useCallback(() => {
    if (onRemove) {
      scale.value = withSpring(0.9, SPRING_CONFIG);
    }
  }, [onRemove, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, [scale]);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRemove();
    }
  }, [onRemove]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: interpolate(entrance.value, [0, 1], [10, 0]) },
    ],
    opacity: entrance.value,
  }));

  return (
    <AnimatedPressable
      style={[
        styles.hobbyChip,
        { backgroundColor: activeColors.accentSubtle, borderColor: activeColors.border },
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handleRemove}
      disabled={!onRemove}
      accessibilityRole={onRemove ? 'button' : 'text'}
      accessibilityLabel={onRemove ? `Remove ${label}` : label}
    >
      <Text variant="sm" style={{ color: activeColors.textPrimary }}>
        {label}
      </Text>
      {onRemove && (
        <Text variant="sm" style={[styles.removeIcon, { color: activeColors.textSecondary }]}>
          ×
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 24,
    borderWidth: 1.5,
    marginRight: spacing[2],
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  hobbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 16,
    borderWidth: 1,
    marginRight: spacing[2],
    marginBottom: spacing[2],
    gap: spacing[1],
  },
  removeIcon: {
    marginLeft: spacing[1],
    fontSize: 18,
    fontWeight: '400',
  },
});
