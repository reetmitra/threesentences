/**
 * ThreeSixtyThree™ Three Sentences - Entry Input
 * 
 * Large multiline text input for daily journaling.
 * Minimal chrome - just the writing space.
 */

import React, { useEffect, useRef } from 'react';
import {
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors } from '@/theme/colors';
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
  const activeColors = colors.dark;
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
    <TextInput
      ref={inputRef}
      style={[
        styles.input,
        {
          backgroundColor: activeColors.paper,
          color: activeColors.textPrimary,
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
      cursorColor={activeColors.accent}
      accessibilityLabel="Journal entry input"
      accessibilityHint="Write your three sentences for today"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    padding: spacing[4],
    fontSize: 18,
    fontFamily: 'Newsreader_400Regular',
    lineHeight: 28,
    borderRadius: 12,
    minHeight: 200,
    ...Platform.select({
      ios: {
        paddingTop: spacing[4],
      },
    }),
  },
});
