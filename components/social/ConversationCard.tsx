/**
 * ThreeSixtyThree™ Three Sentences - Conversation Card Component
 *
 * Animated conversation preview card for chat list.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import {
  Conversation,
  UserInfo,
  formatMessageTime,
  getInitials,
  getOtherParticipant,
} from '@/types/social';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ConversationCardProps {
  conversation: Conversation;
  currentUserId: string;
  onPress: (conversation: Conversation) => void;
  index?: number;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
};

export function ConversationCard({
  conversation,
  currentUserId,
  onPress,
  index = 0,
}: ConversationCardProps) {
  const activeColors = colors.dark;
  const otherUser = getOtherParticipant(conversation, currentUserId);

  // Animation values
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);

  React.useEffect(() => {
    const delay = index * 50;
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
      translateX.value = withSpring(0, SPRING_CONFIG);
    }, delay);
  }, [index, opacity, translateX]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(conversation);
  }, [conversation, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  if (!otherUser) return null;

  const hasUnread = conversation.unreadCount > 0;
  const lastMessagePreview = conversation.lastMessage?.content || 'No messages yet';
  const lastMessageTime = conversation.lastMessage
    ? formatMessageTime(conversation.lastMessage.createdAt)
    : '';

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.container,
        { backgroundColor: activeColors.surface },
        animatedStyle,
      ]}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: activeColors.accentSubtle }]}>
        {otherUser.profileImage ? (
          <Image source={{ uri: otherUser.profileImage }} style={styles.avatarImage} />
        ) : (
          <Text variant="lg" family="sansBold" style={{ color: activeColors.accent }}>
            {getInitials(otherUser.name)}
          </Text>
        )}
        {conversation.isTyping && (
          <View style={[styles.typingIndicator, { backgroundColor: activeColors.accent }]} />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            variant="base"
            family={hasUnread ? 'sansBold' : 'sans'}
            numberOfLines={1}
            style={styles.name}
          >
            {otherUser.name}
          </Text>
          <Text variant="xs" color="tertiary">
            {lastMessageTime}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          {conversation.isTyping ? (
            <Text variant="sm" style={{ color: activeColors.accent }}>
              typing...
            </Text>
          ) : (
            <Text
              variant="sm"
              color={hasUnread ? 'primary' : 'secondary'}
              numberOfLines={1}
              style={styles.preview}
            >
              {lastMessagePreview}
            </Text>
          )}

          {hasUnread && (
            <View style={[styles.badge, { backgroundColor: activeColors.accent }]}>
              <Text
                variant="xs"
                family="sansBold"
                style={{ color: activeColors.background }}
              >
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    marginHorizontal: spacing[4],
    marginVertical: spacing[1],
    borderRadius: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  typingIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.dark.surface,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  name: {
    flex: 1,
    marginRight: spacing[2],
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    marginRight: spacing[2],
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
  },
});
