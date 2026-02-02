/**
 * ThreeSixtyThree™ Three Sentences - Button Component
 * 
 * White accent styling for the dark UI.
 */

import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  ViewStyle,
  View,
} from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { spacing, componentRadius } from '@/theme/spacing';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: ButtonProps) {
  const activeColors = colors.dark; // Always dark mode

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getBackgroundColor = () => {
    if (variant === 'ghost') return 'transparent';
    if (variant === 'outline') return 'transparent';
    if (disabled) return activeColors.surfaceHover;
    return activeColors.accent; // White
  };

  const getTextColor = () => {
    if (disabled) return activeColors.textTertiary;
    if (variant === 'primary') return activeColors.background; // Dark text on white button
    if (variant === 'outline') return activeColors.textPrimary;
    return activeColors.textSecondary; // Ghost
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? activeColors.textTertiary : activeColors.textPrimary;
    }
    return 'transparent';
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? activeColors.background : activeColors.textPrimary}
          size="small"
        />
      ) : (
        <Text
          variant="base"
          weight="semibold"
          style={{ color: getTextColor(), letterSpacing: 0.5 }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    borderRadius: componentRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
