/**
 * ThreeSixtyThree™ Three Sentences - Input Component
 * 
 * Styled text input for dark UI.
 */

import React from 'react';
import { TextInput, TextInputProps, StyleSheet, ViewStyle, View, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, componentRadius } from '@/theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: boolean;
  containerStyle?: ViewStyle;
}

export function Input({
  style,
  label,
  error,
  containerStyle,
  ...props
}: InputProps) {
  const activeColors = colors.dark; // Always dark mode

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: activeColors.textSecondary }
          ]}
        >
          {label}
        </Text>
      )}
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
    </View>
  );
}



const styles = StyleSheet.create({
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[2],
    fontWeight: '500',
  },
  input: {
    paddingHorizontal: spacing[3],
    height: 50,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    borderWidth: 1,
    justifyContent: 'center', // Flex property for container
  },
});
