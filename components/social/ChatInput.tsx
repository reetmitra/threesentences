/**
 * ThreeSixtyThree™ Three Sentences - Chat Input Component
 *
 * Animated message input with send button.
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TextInput, Pressable, Keyboard } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Send } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChatInputProps {
  onSend: (message: string) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const SPRING_CONFIG = {
  damping: 12,
  stiffness: 180,
};

export function ChatInput({
  onSend,
  onTypingStart,
  onTypingEnd,
  placeholder = 'Message...',
  disabled = false,
}: ChatInputProps) {
  const activeColors = colors.dark;
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animation values
  const sendButtonScale = useSharedValue(0);
  const sendButtonOpacity = useSharedValue(0);
  const inputFocus = useSharedValue(0);

  const hasMessage = message.trim().length > 0;

  // Update send button visibility
  React.useEffect(() => {
    if (hasMessage) {
      sendButtonScale.value = withSpring(1, SPRING_CONFIG);
      sendButtonOpacity.value = withTiming(1, { duration: 150 });
    } else {
      sendButtonScale.value = withSpring(0.5, SPRING_CONFIG);
      sendButtonOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [hasMessage, sendButtonScale, sendButtonOpacity]);

  const handleChangeText = useCallback((text: string) => {
    setMessage(text);

    // Handle typing indicators
    if (text.length > 0 && !typingTimeoutRef.current) {
      onTypingStart?.();
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout for typing end
    typingTimeoutRef.current = setTimeout(() => {
      onTypingEnd?.();
      typingTimeoutRef.current = null;
    }, 1500);
  }, [onTypingStart, onTypingEnd]);

  const handleSend = useCallback(() => {
    if (!hasMessage || disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate button press
    sendButtonScale.value = withSpring(0.8, { damping: 10 });
    setTimeout(() => {
      sendButtonScale.value = withSpring(1, SPRING_CONFIG);
    }, 100);

    onSend(message.trim());
    setMessage('');

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    onTypingEnd?.();
  }, [hasMessage, message, disabled, onSend, onTypingEnd, sendButtonScale]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    inputFocus.value = withTiming(1, { duration: 200 });
  }, [inputFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    inputFocus.value = withTiming(0, { duration: 200 });
  }, [inputFocus]);

  const inputContainerAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      inputFocus.value,
      [0, 1],
      [activeColors.border, activeColors.accent]
    ),
  }));

  const sendButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
    opacity: sendButtonOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      <Animated.View
        style={[
          styles.inputContainer,
          { backgroundColor: activeColors.surface },
          inputContainerAnimatedStyle,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: activeColors.textPrimary },
          ]}
          placeholder={placeholder}
          placeholderTextColor={activeColors.textTertiary}
          value={message}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline
          maxLength={1000}
          editable={!disabled}
          returnKeyType="default"
        />

        <AnimatedPressable
          onPress={handleSend}
          disabled={!hasMessage || disabled}
          style={[
            styles.sendButton,
            { backgroundColor: activeColors.accent },
            sendButtonAnimatedStyle,
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Send size={18} color={activeColors.background} strokeWidth={2.5} />
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    paddingBottom: spacing[4],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: spacing[4],
    paddingRight: spacing[2],
    paddingVertical: spacing[2],
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    maxHeight: 120,
    paddingVertical: spacing[1],
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[2],
  },
});
