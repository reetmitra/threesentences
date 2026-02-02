/**
 * ThreeSixtyThree™ Three Sentences - Entry Input
 * 
 * Large multiline text input for daily journaling.
 * Minimal chrome - just the writing space.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  TextInput,
  StyleSheet,
  useColorScheme,
  View,
  Platform,
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface EntryInputProps {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export function EntryInput({
  value,
  onChangeText,
  editable = true,
  placeholder = 'Write your three sentences...',
  autoFocus = false,
}: EntryInputProps) {
  const scheme = useColorScheme() ?? 'dark';
  const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];
  const inputRef = useRef<TextInput>(null);

  // Auto-focus on mount if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            backgroundColor: activeColors.surface,
            color: activeColors.textPrimary,
            borderColor: activeColors.border,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={activeColors.textTertiary}
        multiline
        textAlignVertical="top"
        editable={editable}
        autoFocus={autoFocus}
        autoCapitalize="sentences"
        autoCorrect
        spellCheck
        selectionColor={activeColors.accent}
        accessibilityLabel="Journal entry input"
        accessibilityHint="Write your three sentences for today"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    flex: 1,
    padding: spacing[4],
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.primary,
    lineHeight: typography.fontSize.lg * 1.6,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 200,
    ...Platform.select({
      ios: {
        paddingTop: spacing[4],
      },
    }),
  },
});
