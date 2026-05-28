/**
 * ThreeSixtyThree™ Three Sentences - Social Screen
 *
 * Main social hub with friends list, requests, and user search.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Users } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { FriendCard, FriendRequestCard } from '@/components/social';
import { SkeletonFriendsList } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/theme/colors';
import { spacing, edgePadding } from '@/theme/spacing';
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
import { useAuth } from '@/hooks/useAuth';
import { getProfile } from '@/store/profile';

type TabType = 'friends' | 'requests';

export default function SocialScreen() {
  const c = colors.dark;
  const { showToast } = useToast();
  const { userId, user } = useAuth();
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
  const [newFriendId, setNewFriendId] = useState<string | null>(null);
  const newFriendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animations
  const searchFocus = useSharedValue(0);
  const tabIndicatorPosition = useSharedValue(0);

  useEffect(() => {
    if (userId) loadData();
  }, [userId]);

  useEffect(() => {
    tabIndicatorPosition.value = withSpring(activeTab === 'friends' ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [activeTab, tabIndicatorPosition]);

  useEffect(() => {
    if (searchQuery.trim() && userId) {
      const delaySearch = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
      return () => clearTimeout(delaySearch);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, userId]);

  const loadData = async () => {
    try {
      if (!userId) return;

      const profile = await getProfile(userId);
      const userInfo: UserInfo = {
        id: userId,
        name: profile?.name || user?.name || 'User',
        username: profile?.username || 'user',
        profileImage: profile?.profileImage,
      };
      setCurrentUser(userInfo);

      const [friendsList, requests, suggested] = await Promise.all([
        getFriends(userId),
        getPendingRequests(userId),
        getSuggestedFriends(userId),
      ]);

      setFriends(friendsList);
      setPendingRequests(requests);
      setSuggestedFriends(suggested);
    } catch (error) {
      console.error('Failed to load social data:', error);
      showToast('error', 'Could not load social data.');
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
    if (!userId) return;
    try {
      const results = await searchUsers(query, userId);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      showToast('error', 'Search failed. Try again.');
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
      showToast('error', 'Could not start conversation.');
    }
  };

  const handleAddFriend = async (user: UserInfo) => {
    if (!currentUser) return;
    try {
      await sendFriendRequest(currentUser.id, user.id);
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

    // Optimistic: remove request immediately
    setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));

    // Optimistic: add the new friend at the TOP of the list
    const optimisticFriend: Friend = {
      id: request.id,
      odUserId: currentUser.id,
      friendUser: request.fromUser,
      friendsSince: new Date().toISOString(),
    };
    setFriends((prev) => [optimisticFriend, ...prev]);

    // Mark as new so FriendCard plays FadeInUp
    if (newFriendTimerRef.current) clearTimeout(newFriendTimerRef.current);
    setNewFriendId(request.fromUser.id);
    newFriendTimerRef.current = setTimeout(() => setNewFriendId(null), 500);

    try {
      await acceptFriendRequest(request.id, currentUser.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Refresh in background to sync server state without visual disruption
      loadData();
    } catch (error) {
      // Roll back on failure
      setFriends((prev) => prev.filter((f) => f.id !== request.id));
      setPendingRequests((prev) => [...prev, request]);
      setNewFriendId(null);
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
      isSearchFocused ? c.textBright : c.frame,
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
      <Text family="mono" variant="xs" uppercase style={[styles.sectionTitle, { color: c.textSecondary, letterSpacing: 1 }]}>
        Search Results
      </Text>
      {searchResults.length === 0 ? (
        <Text family="sans" variant="base" centered style={[styles.emptyText, { color: c.textTertiary }]}>
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
      {loading ? (
        <SkeletonFriendsList />
      ) : friends.length === 0 ? (
        <View style={styles.emptyState}>
          <Users size={48} color={c.textTertiary} strokeWidth={1.5} />
          <Text family="sansSemibold" variant="lg" style={[styles.emptyTitle, { color: c.textPrimary }]}>
            No friends yet
          </Text>
          <Text family="sans" variant="base" centered style={{ color: c.textSecondary }}>
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
            isNew={friend.friendUser.id === newFriendId}
          />
        ))
      )}

      {suggestedFriends.length > 0 && friends.length < 5 && (
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <Text
            family="mono"
            variant="xs"
            uppercase
            style={[styles.sectionTitle, { marginTop: spacing[6], color: c.textSecondary, letterSpacing: 1 }]}
          >
            Suggested Friends
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
          <Icon name="bell" size={48} color={c.textTertiary} strokeWidth={1.5} />
          <Text family="sansSemibold" variant="lg" style={[styles.emptyTitle, { color: c.textPrimary }]}>
            No pending requests
          </Text>
          <Text family="sans" variant="base" centered style={{ color: c.textSecondary }}>
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
      style={[styles.container, { backgroundColor: c.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text family="sansBold" variant="2xl" style={{ color: c.textPrimary }}>The Circle</Text>
          <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5, marginTop: 4 }}>Friends · Requests</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/conversations')}
          style={styles.messagesButton}
        >
          <Icon name="chat" size={24} color={c.textPrimary} strokeWidth={1.5} />
        </Pressable>
      </View>

      {/* Search Bar */}
      <Animated.View
        style={[
          styles.searchContainer,
          { backgroundColor: c.surface },
          searchAnimatedStyle,
        ]}
      >
        <Icon name="search" size={20} color={c.textTertiary} strokeWidth={2} />
        <TextInput
          style={[styles.searchInput, { color: c.textPrimary }]}
          placeholder="Search people..."
          placeholderTextColor={c.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Icon name="close" size={18} color={c.textTertiary} />
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
                family={activeTab === 'friends' ? 'sansSemibold' : 'sans'}
                variant="base"
                style={{ color: activeTab === 'friends' ? c.textPrimary : c.textSecondary }}
              >
                Friends
              </Text>
              {friends.length > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: c.surfaceHi }]}>
                  <Text family="monoMedium" variant="xs" style={{ color: c.background }}>
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
                family={activeTab === 'requests' ? 'sansSemibold' : 'sans'}
                variant="base"
                style={{ color: activeTab === 'requests' ? c.textPrimary : c.textSecondary }}
              >
                Requests
              </Text>
              {pendingRequests.length > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: c.textBright }]}>
                  <Text family="monoMedium" variant="xs" style={{ color: c.background }}>
                    {pendingRequests.length}
                  </Text>
                </View>
              )}
            </Pressable>

            <Animated.View
              style={[
                styles.tabIndicator,
                { backgroundColor: c.textBright },
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
                tintColor={c.textBright}
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
    fontSize: 16,
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
    paddingHorizontal: edgePadding.content,
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
