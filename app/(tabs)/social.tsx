/**
 * ThreeSixtyThree™ Three Sentences - Social Screen
 *
 * Main social hub with friends list, requests, and user search.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Search,
  Users,
  MessageCircle,
  UserPlus,
  Bell,
  X,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { FriendCard, FriendRequestCard } from '@/components/social';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import {
  Friend,
  FriendRequest,
  UserInfo,
  UserSearchResult,
} from '@/types/social';
import {
  getFriends,
  getPendingRequests,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getSuggestedFriends,
} from '@/store/friends';
import { getOrCreateConversation } from '@/store/chat';
import { getCurrentUser } from '@/store/auth';
import { getProfile } from '@/store/profile';

type TabType = 'friends' | 'requests';

export default function SocialScreen() {
  const activeColors = colors.dark;
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<UserSearchResult[]>([]);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Animations
  const searchFocus = useSharedValue(0);
  const tabIndicatorPosition = useSharedValue(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    tabIndicatorPosition.value = withSpring(activeTab === 'friends' ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [activeTab, tabIndicatorPosition]);

  useEffect(() => {
    if (searchQuery.trim() && currentUser) {
      const delaySearch = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
      return () => clearTimeout(delaySearch);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, currentUser]);

  const loadData = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      const profile = await getProfile(user.id);
      const userInfo: UserInfo = {
        id: user.id,
        name: profile?.name || user.name || 'User',
        username: profile?.username || 'user',
        profileImage: profile?.profileImage,
      };
      setCurrentUser(userInfo);

      const [friendsList, requests, suggested] = await Promise.all([
        getFriends(),
        getPendingRequests(user.id),
        getSuggestedFriends(user.id),
      ]);

      setFriends(friendsList);
      setPendingRequests(requests);
      setSuggestedFriends(suggested);
    } catch (error) {
      console.error('Failed to load social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const performSearch = async (query: string) => {
    if (!currentUser) return;
    try {
      const results = await searchUsers(query, currentUser.id);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleMessage = async (user: UserInfo) => {
    if (!currentUser) return;
    try {
      const conversation = await getOrCreateConversation(currentUser, user);
      router.push({
        pathname: '/(tabs)/chat/[id]',
        params: { id: conversation.id },
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleAddFriend = async (user: UserInfo) => {
    if (!currentUser) return;
    try {
      await sendFriendRequest(currentUser, user);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Update search results to reflect pending status
      setSearchResults((prev) =>
        prev.map((r) =>
          r.user.id === user.id
            ? { ...r, friendshipStatus: 'pending_sent' }
            : r
        )
      );
      setSuggestedFriends((prev) =>
        prev.map((r) =>
          r.user.id === user.id
            ? { ...r, friendshipStatus: 'pending_sent' }
            : r
        )
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    if (!currentUser) return;
    try {
      await acceptFriendRequest(request.id, currentUser.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadData();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleRejectRequest = async (request: FriendRequest) => {
    if (!currentUser) return;
    try {
      await rejectFriendRequest(request.id, currentUser.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(
      isSearchFocused ? activeColors.accent : activeColors.border,
      { duration: 200 }
    ),
  }));

  const tabIndicatorStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      left: `${tabIndicatorPosition.value * 50}%`,
    };
  });

  const renderSearchResults = () => (
    <Animated.View entering={FadeIn.duration(200)} style={styles.searchResults}>
      <Text variant="sm" color="secondary" weight="medium" style={styles.sectionTitle}>
        SEARCH RESULTS
      </Text>
      {searchResults.length === 0 ? (
        <Text variant="base" color="tertiary" centered style={styles.emptyText}>
          No users found
        </Text>
      ) : (
        searchResults.map((result, index) => (
          <FriendCard
            key={result.user.id}
            user={result.user}
            friendshipStatus={result.friendshipStatus}
            mutualFriendsCount={result.mutualFriendsCount}
            onAddFriend={handleAddFriend}
            onMessage={handleMessage}
            index={index}
          />
        ))
      )}
    </Animated.View>
  );

  const renderFriends = () => (
    <View style={styles.section}>
      {friends.length === 0 ? (
        <View style={styles.emptyState}>
          <Users size={48} color={activeColors.textTertiary} strokeWidth={1.5} />
          <Text variant="lg" weight="medium" style={styles.emptyTitle}>
            No friends yet
          </Text>
          <Text variant="base" color="secondary" centered>
            Search for people to connect with
          </Text>
        </View>
      ) : (
        friends.map((friend, index) => (
          <FriendCard
            key={friend.id}
            user={friend.friendUser}
            friendshipStatus="friends"
            onMessage={handleMessage}
            index={index}
          />
        ))
      )}

      {suggestedFriends.length > 0 && friends.length < 5 && (
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <Text
            variant="sm"
            color="secondary"
            weight="medium"
            style={[styles.sectionTitle, { marginTop: spacing[6] }]}
          >
            SUGGESTED FRIENDS
          </Text>
          {suggestedFriends.map((result, index) => (
            <FriendCard
              key={result.user.id}
              user={result.user}
              friendshipStatus={result.friendshipStatus}
              mutualFriendsCount={result.mutualFriendsCount}
              onAddFriend={handleAddFriend}
              index={index}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );

  const renderRequests = () => (
    <View style={styles.section}>
      {pendingRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell size={48} color={activeColors.textTertiary} strokeWidth={1.5} />
          <Text variant="lg" weight="medium" style={styles.emptyTitle}>
            No pending requests
          </Text>
          <Text variant="base" color="secondary" centered>
            Friend requests will appear here
          </Text>
        </View>
      ) : (
        pendingRequests.map((request, index) => (
          <FriendRequestCard
            key={request.id}
            user={request.fromUser}
            onAccept={() => handleAcceptRequest(request)}
            onReject={() => handleRejectRequest(request)}
            index={index}
          />
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="2xl" weight="bold">
          Connect
        </Text>
        <Pressable
          onPress={() => router.push('/(tabs)/conversations')}
          style={styles.messagesButton}
        >
          <MessageCircle size={24} color={activeColors.textPrimary} strokeWidth={1.5} />
        </Pressable>
      </View>

      {/* Search Bar */}
      <Animated.View
        style={[
          styles.searchContainer,
          { backgroundColor: activeColors.surface },
          searchAnimatedStyle,
        ]}
      >
        <Search size={20} color={activeColors.textTertiary} strokeWidth={2} />
        <TextInput
          style={[styles.searchInput, { color: activeColors.textPrimary }]}
          placeholder="Search people..."
          placeholderTextColor={activeColors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <X size={18} color={activeColors.textTertiary} />
          </Pressable>
        )}
      </Animated.View>

      {/* Show search results when searching */}
      {searchQuery.trim() ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderSearchResults()}
        </ScrollView>
      ) : (
        <>
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <Pressable
              onPress={() => setActiveTab('friends')}
              style={styles.tab}
            >
              <Text
                variant="base"
                weight={activeTab === 'friends' ? 'semibold' : 'regular'}
                color={activeTab === 'friends' ? 'primary' : 'secondary'}
              >
                Friends
              </Text>
              {friends.length > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: activeColors.accentSubtle }]}>
                  <Text variant="xs" weight="medium">
                    {friends.length}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('requests')}
              style={styles.tab}
            >
              <Text
                variant="base"
                weight={activeTab === 'requests' ? 'semibold' : 'regular'}
                color={activeTab === 'requests' ? 'primary' : 'secondary'}
              >
                Requests
              </Text>
              {pendingRequests.length > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: activeColors.accent }]}>
                  <Text variant="xs" weight="bold" style={{ color: activeColors.background }}>
                    {pendingRequests.length}
                  </Text>
                </View>
              )}
            </Pressable>

            <Animated.View
              style={[
                styles.tabIndicator,
                { backgroundColor: activeColors.accent },
                tabIndicatorStyle,
              ]}
            />
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={activeColors.accent}
              />
            }
          >
            {activeTab === 'friends' ? renderFriends() : renderRequests()}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  messagesButton: {
    padding: spacing[2],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing[3],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    position: 'relative',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50%',
    height: 2,
    borderRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[8],
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    marginHorizontal: spacing[5],
    marginBottom: spacing[3],
    letterSpacing: 1,
  },
  searchResults: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[16],
    paddingHorizontal: spacing[6],
  },
  emptyTitle: {
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptyText: {
    paddingVertical: spacing[8],
  },
});
