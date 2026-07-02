/**
 * ThreeSixtyThree™ Three Sentences - Message Bubble Component
 *
 * Animated chat message bubble with status indicators.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { CheckCheck } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Message, formatTimestamp, isOwnMessage } from '@/types/social';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  showTimestamp?: boolean;
  isLastInGroup?: boolean;
  index?: number;
  failed?: boolean;
  onRetry?: () => void;
}

const FADE_UP_CONFIG = { duration: 240, easing: Easing.out(Easing.ease) };

export function MessageBubble({
  message,
  currentUserId,
  showTimestamp = true,
  isLastInGroup = true,
  index = 0,
  failed = false,
  onRetry,
}: MessageBubbleProps) {
  const activeColors = colors.dark;
  const isOwn = isOwnMessage(message, currentUserId);

  // Animation values — pt-fade-up: opacity 0→1, translateY 12→0, 240ms ease-out
  const translateY = useSharedValue(12);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = Math.min(index * 30, 200);
    opacity.value = withDelay(delay, withTiming(1, FADE_UP_CONFIG));
    translateY.value = withDelay(delay, withTiming(0, FADE_UP_CONFIG));
  }, [index, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const renderStatusIcon = () => {
    if (!isOwn) return null;

    const iconColor = message.status === 'read'
      ? activeColors.accent
      : activeColors.textTertiary;

    switch (message.status) {
      case 'sending':
        return (
          <View style={styles.statusIcon}>
            <View style={[styles.sendingDot, { backgroundColor: activeColors.textTertiary }]} />
          </View>
        );
      case 'sent':
        return (
          <View style={styles.statusIcon}>
            <Icon name="check" size={12} color={iconColor} strokeWidth={3} />
          </View>
        );
      case 'delivered':
      case 'read':
        return (
          <View style={styles.statusIcon}>
            <CheckCheck size={12} color={iconColor} strokeWidth={3} />
          </View>
        );
      case 'failed':
        return (
          <View style={styles.statusIcon}>
            <Text variant="xs" style={{ color: activeColors.error }}>!</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isOwn ? styles.containerOwn : styles.containerOther,
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwn
            ? [styles.bubbleOwn, { backgroundColor: activeColors.accent }]
            : [styles.bubbleOther, { backgroundColor: activeColors.surface }],
          !isLastInGroup && (isOwn ? styles.bubbleOwnContinued : styles.bubbleOtherContinued),
          failed && { borderWidth: 1, borderColor: activeColors.warn, backgroundColor: 'transparent' },
        ]}
      >
        <Text
          variant="base"
          style={[
            styles.messageText,
            // Failed bubbles drop the light accent background, so the usual
            // dark-on-light text color would be invisible there.
            { color: isOwn && !failed ? activeColors.background : activeColors.textPrimary },
          ]}
        >
          {message.content}
        </Text>
      </View>

      {failed && isOwn && (
        <Pressable onPress={onRetry} hitSlop={8}>
          <Text variant="xs" style={{ fontFamily: 'IBMPlexMono_400Regular', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2, color: activeColors.warn }}>✕ Failed · tap to retry</Text>
        </Pressable>
      )}

      {showTimestamp && (
        <View style={[styles.metaContainer, isOwn && styles.metaContainerOwn]}>
          <Text variant="xs" color="secondary" style={styles.timestamp}>
            {formatTimestamp(message.createdAt)}
          </Text>
          {renderStatusIcon()}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing[1],
    maxWidth: '80%',
  },
  containerOwn: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  containerOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 20,
  },
  bubbleOwn: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  bubbleOwnContinued: {
    borderBottomRightRadius: 20,
  },
  bubbleOtherContinued: {
    borderBottomLeftRadius: 20,
  },
  messageText: {
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
    paddingHorizontal: spacing[1],
    gap: spacing[1],
  },
  metaContainerOwn: {
    flexDirection: 'row-reverse',
  },
  timestamp: {
    fontSize: 10,
  },
  statusIcon: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
