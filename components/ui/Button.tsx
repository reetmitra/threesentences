import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { componentRadius, spacing } from '@/theme/spacing';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) {
  const c = colors.dark;

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Disabled stays readable (>= 4.5:1): a quiet surface pill with dim words,
  // not a half-transparent one that fades the label into the ground.
  const bg = variant === 'primary'
    ? (disabled ? c.surface : c.textBright)
    : 'transparent';

  const textColor = variant === 'primary'
    ? (disabled ? c.textSecondary : c.paper)
    : (disabled ? c.textSecondary : c.textPrimary);

  const borderColor = variant === 'outline' ? (disabled ? c.textSecondary : c.textPrimary) : 'transparent';

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={textColor} size="small" />
        : <Text family="sansSemibold" variant="base" numberOfLines={1} style={{ color: textColor }}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: componentRadius.button,
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
