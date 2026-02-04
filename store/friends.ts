/**
 * ThreeSixtyThree™ Three Sentences - Friends Store
 *
 * Manages friend connections, requests, and user search.
 * Uses AsyncStorage for local persistence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Friend,
  FriendRequest,
  UserInfo,
  UserSearchResult,
  FriendshipStatus,
  SocialStats,
  createFriendRequest,
  generateSocialId,
} from '@/types/social';

const STORAGE_KEYS = {
  FRIENDS: '@threesentences/friends',
  FRIEND_REQUESTS: '@threesentences/friend_requests',
  BLOCKED_USERS: '@threesentences/blocked_users',
} as const;

// Mock users for demo/testing (in production, this would come from a backend)
const DEMO_USERS: UserInfo[] = [
  { id: 'demo-1', name: 'Alex Chen', username: 'alexchen', profileImage: undefined },
  { id: 'demo-2', name: 'Jordan Smith', username: 'jordans', profileImage: undefined },
  { id: 'demo-3', name: 'Sam Wilson', username: 'samwilson', profileImage: undefined },
  { id: 'demo-4', name: 'Taylor Brown', username: 'taylorbrown', profileImage: undefined },
  { id: 'demo-5', name: 'Morgan Lee', username: 'morganlee', profileImage: undefined },
  { id: 'demo-6', name: 'Casey Davis', username: 'caseyd', profileImage: undefined },
  { id: 'demo-7', name: 'Riley Johnson', username: 'rileyj', profileImage: undefined },
  { id: 'demo-8', name: 'Avery Martinez', username: 'averym', profileImage: undefined },
];

/**
 * Get all friends
 */
export async function getFriends(): Promise<Friend[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (!data) return [];
    return JSON.parse(data) as Friend[];
  } catch (error) {
    console.error('Failed to get friends:', error);
    return [];
  }
}

/**
 * Get friend by ID
 */
export async function getFriendById(friendId: string): Promise<Friend | null> {
  const friends = await getFriends();
  return friends.find((f) => f.id === friendId) || null;
}

/**
 * Get all friend requests (both sent and received)
 */
export async function getFriendRequests(): Promise<FriendRequest[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS);
    if (!data) return [];
    return JSON.parse(data) as FriendRequest[];
  } catch (error) {
    console.error('Failed to get friend requests:', error);
    return [];
  }
}

/**
 * Get pending friend requests received by current user
 */
export async function getPendingRequests(currentUserId: string): Promise<FriendRequest[]> {
  const requests = await getFriendRequests();
  return requests.filter(
    (r) => r.toUserId === currentUserId && r.status === 'pending'
  );
}

/**
 * Get friend requests sent by current user
 */
export async function getSentRequests(currentUserId: string): Promise<FriendRequest[]> {
  const requests = await getFriendRequests();
  return requests.filter(
    (r) => r.fromUserId === currentUserId && r.status === 'pending'
  );
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(
  fromUser: UserInfo,
  toUser: UserInfo
): Promise<FriendRequest> {
  const requests = await getFriendRequests();

  // Check if request already exists
  const existing = requests.find(
    (r) =>
      (r.fromUserId === fromUser.id && r.toUserId === toUser.id) ||
      (r.fromUserId === toUser.id && r.toUserId === fromUser.id)
  );

  if (existing) {
    if (existing.status === 'pending') {
      throw new Error('Friend request already pending');
    }
    if (existing.status === 'accepted') {
      throw new Error('Already friends');
    }
  }

  // Check if already friends
  const friends = await getFriends();
  const alreadyFriends = friends.some(
    (f) => f.friendUser.id === toUser.id
  );

  if (alreadyFriends) {
    throw new Error('Already friends with this user');
  }

  const newRequest = createFriendRequest(fromUser, toUser);
  requests.push(newRequest);

  await AsyncStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
  return newRequest;
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(
  requestId: string,
  currentUserId: string
): Promise<Friend> {
  const requests = await getFriendRequests();
  const requestIndex = requests.findIndex((r) => r.id === requestId);

  if (requestIndex === -1) {
    throw new Error('Friend request not found');
  }

  const request = requests[requestIndex];

  if (request.toUserId !== currentUserId) {
    throw new Error('Cannot accept this request');
  }

  if (request.status !== 'pending') {
    throw new Error('Request is no longer pending');
  }

  // Update request status
  requests[requestIndex] = {
    ...request,
    status: 'accepted',
    respondedAt: new Date().toISOString(),
  };

  // Add to friends list
  const friends = await getFriends();
  const newFriend: Friend = {
    id: generateSocialId(),
    odUserId: currentUserId,
    friendUser: request.fromUser,
    friendsSince: new Date().toISOString(),
  };
  friends.push(newFriend);

  // Save both
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(requests)),
    AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends)),
  ]);

  return newFriend;
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(
  requestId: string,
  currentUserId: string
): Promise<void> {
  const requests = await getFriendRequests();
  const requestIndex = requests.findIndex((r) => r.id === requestId);

  if (requestIndex === -1) {
    throw new Error('Friend request not found');
  }

  const request = requests[requestIndex];

  if (request.toUserId !== currentUserId) {
    throw new Error('Cannot reject this request');
  }

  requests[requestIndex] = {
    ...request,
    status: 'rejected',
    respondedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
}

/**
 * Cancel a sent friend request
 */
export async function cancelFriendRequest(
  requestId: string,
  currentUserId: string
): Promise<void> {
  const requests = await getFriendRequests();
  const requestIndex = requests.findIndex((r) => r.id === requestId);

  if (requestIndex === -1) {
    throw new Error('Friend request not found');
  }

  const request = requests[requestIndex];

  if (request.fromUserId !== currentUserId) {
    throw new Error('Cannot cancel this request');
  }

  // Remove the request
  requests.splice(requestIndex, 1);

  await AsyncStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
}

/**
 * Remove a friend
 */
export async function removeFriend(friendId: string): Promise<void> {
  const friends = await getFriends();
  const updatedFriends = friends.filter((f) => f.id !== friendId);

  await AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(updatedFriends));
}

/**
 * Search for users
 */
export async function searchUsers(
  query: string,
  currentUserId: string
): Promise<UserSearchResult[]> {
  if (!query.trim()) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const friends = await getFriends();
  const requests = await getFriendRequests();

  // Filter demo users by query
  const matchingUsers = DEMO_USERS.filter(
    (user) =>
      user.id !== currentUserId &&
      (user.name.toLowerCase().includes(normalizedQuery) ||
        user.username.toLowerCase().includes(normalizedQuery))
  );

  // Map to search results with friendship status
  return matchingUsers.map((user) => {
    let friendshipStatus: FriendshipStatus = 'none';

    // Check if already friends
    if (friends.some((f) => f.friendUser.id === user.id)) {
      friendshipStatus = 'friends';
    } else {
      // Check for pending requests
      const sentRequest = requests.find(
        (r) =>
          r.fromUserId === currentUserId &&
          r.toUserId === user.id &&
          r.status === 'pending'
      );
      const receivedRequest = requests.find(
        (r) =>
          r.fromUserId === user.id &&
          r.toUserId === currentUserId &&
          r.status === 'pending'
      );

      if (sentRequest) {
        friendshipStatus = 'pending_sent';
      } else if (receivedRequest) {
        friendshipStatus = 'pending_received';
      }
    }

    return {
      user,
      friendshipStatus,
      mutualFriendsCount: Math.floor(Math.random() * 5), // Mock data
    };
  });
}

/**
 * Get friendship status with a user
 */
export async function getFriendshipStatus(
  currentUserId: string,
  otherUserId: string
): Promise<FriendshipStatus> {
  const friends = await getFriends();
  const requests = await getFriendRequests();

  if (friends.some((f) => f.friendUser.id === otherUserId)) {
    return 'friends';
  }

  const sentRequest = requests.find(
    (r) =>
      r.fromUserId === currentUserId &&
      r.toUserId === otherUserId &&
      r.status === 'pending'
  );

  if (sentRequest) return 'pending_sent';

  const receivedRequest = requests.find(
    (r) =>
      r.fromUserId === otherUserId &&
      r.toUserId === currentUserId &&
      r.status === 'pending'
  );

  if (receivedRequest) return 'pending_received';

  return 'none';
}

/**
 * Get social stats for a user
 */
export async function getSocialStats(currentUserId: string): Promise<SocialStats> {
  const [friends, requests] = await Promise.all([
    getFriends(),
    getPendingRequests(currentUserId),
  ]);

  return {
    friendsCount: friends.length,
    pendingRequestsCount: requests.length,
    unreadMessagesCount: 0, // This will come from chat store
  };
}

/**
 * Get suggested friends (demo implementation)
 */
export async function getSuggestedFriends(
  currentUserId: string,
  limit: number = 5
): Promise<UserSearchResult[]> {
  const friends = await getFriends();
  const friendIds = new Set(friends.map((f) => f.friendUser.id));

  const suggestions = DEMO_USERS
    .filter((user) => user.id !== currentUserId && !friendIds.has(user.id))
    .slice(0, limit)
    .map((user) => ({
      user,
      friendshipStatus: 'none' as FriendshipStatus,
      mutualFriendsCount: Math.floor(Math.random() * 3),
    }));

  return suggestions;
}

/**
 * Clear all friends data (for testing/reset)
 */
export async function clearFriendsData(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.FRIENDS),
    AsyncStorage.removeItem(STORAGE_KEYS.FRIEND_REQUESTS),
    AsyncStorage.removeItem(STORAGE_KEYS.BLOCKED_USERS),
  ]);
}
