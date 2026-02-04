/**
 * ThreeSixtyThree™ Three Sentences - Message Bubble Component
 *
 * Animated chat message bubble with status indicators.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  FadeIn,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';
import { Check, CheckCheck } from 'lucide-react-native';
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
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
};

export function MessageBubble({
  message,
  currentUserId,
  showTimestamp = true,
  isLastInGroup = true,
  index = 0,
}: MessageBubbleProps) {
  const activeColors = colors.dark;
  const isOwn = isOwnMessage(message, currentUserId);

  // Animation values
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = Math.min(index * 30, 200);
    scale.value = withDelay(delay, withSpring(1, SPRING_CONFIG));
    opacity.value = withDelay(delay, withSpring(1, SPRING_CONFIG));
  }, [index, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
            <Check size={12} color={iconColor} strokeWidth={3} />
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
        ]}
      >
        <Text
          variant="base"
          style={[
            styles.messageText,
            { color: isOwn ? activeColors.background : activeColors.textPrimary },
          ]}
        >
          {message.content}
        </Text>
      </View>

      {showTimestamp && (
        <View style={[styles.metaContainer, isOwn && styles.metaContainerOwn]}>
          <Text variant="xs" color="tertiary" style={styles.timestamp}>
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
