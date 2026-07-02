/**
 * ThreeSixtyThree™ Three Sentences - Input Component
 *
 * Styled text input for dark UI.
 */

import React, { forwardRef, useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, ViewStyle, View, Platform } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, componentRadius } from '@/theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: boolean;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { style, label, error, containerStyle, onFocus, onBlur, ...props },
  ref
) {
  const c = colors.dark;
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          family="mono"
          variant="xs"
          uppercase
          style={{ color: c.textSecondary, letterSpacing: 1.5, marginBottom: spacing[2] }}
        >
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          {
            backgroundColor: c.surface,
            color: c.textPrimary,
            borderColor: error ? (c as any).error ?? c.textBright : focused ? c.textBright : c.frame,
            borderWidth: focused ? 1 : StyleSheet.hairlineWidth,
            borderRadius: componentRadius.input,
          },
          // The bright border already marks focus; recolor the browser's
          // default blue focus ring instead of stacking it on top.
          Platform.OS === 'web' && ({ outlineColor: c.creamLo, outlineWidth: 1 } as any),
          style,
        ]}
        placeholderTextColor={c.textTertiary}
        selectionColor={(c as any).accent ?? c.textBright}
        cursorColor={(c as any).accent ?? c.textBright}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </View>
  );
});



const styles = StyleSheet.create({
  input: {
    paddingHorizontal: spacing[3],
    height: 50,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    justifyContent: 'center',
  },
});
