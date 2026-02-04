/**
 * ThreeSixtyThree™ Three Sentences - Friend Card Component
 *
 * Animated card for displaying friends and friend requests.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  SlideInLeft,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  MessageCircle,
  UserPlus,
  UserMinus,
  Check,
  X,
  Clock,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import {
  UserInfo,
  FriendshipStatus,
  UserSearchResult,
  getInitials,
} from '@/types/social';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FriendCardProps {
  user: UserInfo;
  friendshipStatus?: FriendshipStatus;
  mutualFriendsCount?: number;
  onPress?: (user: UserInfo) => void;
  onMessage?: (user: UserInfo) => void;
  onAddFriend?: (user: UserInfo) => void;
  onAcceptRequest?: (user: UserInfo) => void;
  onRejectRequest?: (user: UserInfo) => void;
  onRemoveFriend?: (user: UserInfo) => void;
  showActions?: boolean;
  index?: number;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
};

export function FriendCard({
  user,
  friendshipStatus = 'none',
  mutualFriendsCount = 0,
  onPress,
  onMessage,
  onAddFriend,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  showActions = true,
  index = 0,
}: FriendCardProps) {
  const activeColors = colors.dark;

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  React.useEffect(() => {
    const delay = index * 40;
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, SPRING_CONFIG);
    }, delay);
  }, [index, opacity, translateY]);

  const handlePressIn = useCallback(() => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 20 });
    }
  }, [onPress, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(user);
    }
  }, [onPress, user]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const renderActionButtons = () => {
    if (!showActions) return null;

    switch (friendshipStatus) {
      case 'friends':
        return (
          <View style={styles.actionButtons}>
            {onMessage && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onMessage(user);
                }}
                style={[styles.iconButton, { backgroundColor: activeColors.accent }]}
              >
                <MessageCircle size={18} color={activeColors.background} strokeWidth={2} />
              </Pressable>
            )}
          </View>
        );

      case 'pending_sent':
        return (
          <View style={styles.statusBadge}>
            <Clock size={14} color={activeColors.textTertiary} strokeWidth={2} />
            <Text variant="xs" color="tertiary" style={styles.statusText}>
              Pending
            </Text>
          </View>
        );

      case 'pending_received':
        return (
          <View style={styles.actionButtons}>
            {onAcceptRequest && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onAcceptRequest(user);
                }}
                style={[styles.iconButton, { backgroundColor: activeColors.accent }]}
              >
                <Check size={18} color={activeColors.background} strokeWidth={3} />
              </Pressable>
            )}
            {onRejectRequest && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onRejectRequest(user);
                }}
                style={[styles.iconButton, { backgroundColor: activeColors.surfaceHover }]}
              >
                <X size={18} color={activeColors.textSecondary} strokeWidth={2} />
              </Pressable>
            )}
          </View>
        );

      case 'none':
      default:
        return (
          <View style={styles.actionButtons}>
            {onAddFriend && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onAddFriend(user);
                }}
                style={[styles.iconButton, { backgroundColor: activeColors.accent }]}
              >
                <UserPlus size={18} color={activeColors.background} strokeWidth={2} />
              </Pressable>
            )}
          </View>
        );
    }
  };

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]} layout={Layout.springify()}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        style={[styles.container, { backgroundColor: activeColors.surface }]}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: activeColors.accentSubtle }]}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
          ) : (
            <Text variant="lg" weight="bold" style={{ color: activeColors.accent }}>
              {getInitials(user.name)}
            </Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text variant="base" weight="semibold" numberOfLines={1}>
            {user.name}
          </Text>
          <Text variant="sm" color="secondary" numberOfLines={1}>
            @{user.username}
          </Text>
          {mutualFriendsCount > 0 && friendshipStatus !== 'friends' && (
            <Text variant="xs" color="tertiary" style={styles.mutualFriends}>
              {mutualFriendsCount} mutual friend{mutualFriendsCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Actions */}
        {renderActionButtons()}
      </AnimatedPressable>
    </Animated.View>
  );
}

/**
 * Compact friend request card for notifications
 */
interface FriendRequestCardProps {
  user: UserInfo;
  onAccept: () => void;
  onReject: () => void;
  index?: number;
}

export function FriendRequestCard({
  user,
  onAccept,
  onReject,
  index = 0,
}: FriendRequestCardProps) {
  const activeColors = colors.dark;

  return (
    <Animated.View
      entering={SlideInLeft.delay(index * 50).springify()}
      layout={Layout.springify()}
      style={[styles.requestCard, { backgroundColor: activeColors.surface }]}
    >
      <View style={[styles.requestAvatar, { backgroundColor: activeColors.accentSubtle }]}>
        {user.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.requestAvatarImage} />
        ) : (
          <Text variant="base" weight="bold" style={{ color: activeColors.accent }}>
            {getInitials(user.name)}
          </Text>
        )}
      </View>

      <View style={styles.requestContent}>
        <Text variant="sm" weight="semibold" numberOfLines={1}>
          {user.name}
        </Text>
        <Text variant="xs" color="secondary">
          wants to be friends
        </Text>
      </View>

      <View style={styles.requestActions}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onAccept();
          }}
          style={[styles.requestButton, { backgroundColor: activeColors.accent }]}
        >
          <Text variant="xs" weight="bold" style={{ color: activeColors.background }}>
            Accept
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onReject();
          }}
          style={[styles.requestButton, { backgroundColor: activeColors.surfaceHover }]}
        >
          <Text variant="xs" weight="medium" color="secondary">
            Decline
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing[4],
    marginVertical: spacing[1],
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  content: {
    flex: 1,
  },
  mutualFriends: {
    marginTop: spacing[1],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 12,
    backgroundColor: colors.dark.surfaceHover,
  },
  statusText: {
    marginLeft: spacing[1],
  },
  // Friend Request Card styles
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    marginHorizontal: spacing[4],
    marginVertical: spacing[1],
    borderRadius: 12,
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  requestAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  requestContent: {
    flex: 1,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  requestButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
  },
});
