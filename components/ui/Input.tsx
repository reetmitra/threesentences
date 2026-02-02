/**
 * ThreeSixtyThree™ Three Sentences - Input Component
 * 
 * Styled text input for dark UI.
 */

import React from 'react';
import { TextInput, TextInputProps, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, componentRadius } from '@/theme/spacing';

interface InputProps extends TextInputProps {
  error?: boolean;
  containerStyle?: ViewStyle;
}

export function Input({
  style,
  error,
  containerStyle,
  ...props
}: InputProps) {
  const activeColors = colors.dark; // Always dark mode

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: activeColors.surface,
          color: activeColors.textPrimary,
          borderColor: error ? activeColors.error : activeColors.border,
          borderRadius: componentRadius.input,
        },
        style,
      ]}
      placeholderTextColor={activeColors.textTertiary}
      selectionColor={activeColors.accent}
      cursorColor={activeColors.accent}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    borderWidth: 1,
  },
});
