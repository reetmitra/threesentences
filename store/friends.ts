/**
 * Three™ - Friends Store
 *
 * Manages friend connections, requests, and user discovery.
 * Uses Supabase for backend persistence and authentication.
 */

import { supabase } from '@/config/supabase';
import {
  Friend,
  FriendRequest,
  UserInfo,
  UserSearchResult,
  FriendshipStatus,
  SocialStats,
} from '@/types/social';

/**
 * Database types
 */
interface DbFriend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

interface DbProfile {
  user_id: string;
  name: string;
  username: string;
  profile_image: string | null;
  interests: string[];
}

/**
 * Convert database profile to UserInfo
 */
function profileToUserInfo(profile: DbProfile): UserInfo {
  return {
    id: profile.user_id,
    name: profile.name,
    username: profile.username,
    profileImage: profile.profile_image ?? undefined,
  };
}

// ============================================
// Friend Fetching
// ============================================

/**
 * Get all accepted friends for a user
 */
export async function getFriends(userId: string): Promise<Friend[]> {
  try {
    // Get friendships where user is either user_id or friend_id and status is accepted
    const { data: friendships, error } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) {
      console.error('Failed to get friends:', error);
      return [];
    }

    if (!friendships || friendships.length === 0) return [];

    // Get the friend user IDs (the other person in each friendship)
    const friendUserIds = friendships.map((f: DbFriend) =>
      f.user_id === userId ? f.friend_id : f.user_id
    );

    // Fetch profiles for all friends
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, name, username, profile_image, interests')
      .in('user_id', friendUserIds);

    if (profilesError) {
      console.error('Failed to get friend profiles:', profilesError);
      return [];
    }

    // Map to Friend objects
    const profileMap = new Map(
      (profiles || []).map((p: DbProfile) => [p.user_id, p])
    );

    return friendships.map((f: DbFriend) => {
      const friendUserId = f.user_id === userId ? f.friend_id : f.user_id;
      const profile = profileMap.get(friendUserId);

      return {
        id: f.id,
        odUserId: userId,
        friendUser: profile ? profileToUserInfo(profile) : {
          id: friendUserId,
          name: 'Unknown',
          username: 'unknown',
        },
        friendsSince: f.created_at,
      };
    });
  } catch (error) {
    console.error('Failed to get friends:', error);
    return [];
  }
}

/**
 * Get friend by friendship ID
 */
export async function getFriendById(
  userId: string,
  friendshipId: string
): Promise<Friend | null> {
  const friends = await getFriends(userId);
  return friends.find((f) => f.id === friendshipId) || null;
}

// ============================================
// Friend Requests
// ============================================

/**
 * Get all pending friend requests (both sent and received)
 */
export async function getFriendRequests(userId: string): Promise<FriendRequest[]> {
  try {
    const { data: requests, error } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'pending');

    if (error) {
      console.error('Failed to get friend requests:', error);
      return [];
    }

    if (!requests || requests.length === 0) return [];

    // Get all user IDs involved
    const allUserIds = new Set<string>();
    requests.forEach((r: DbFriend) => {
      allUserIds.add(r.user_id);
      allUserIds.add(r.friend_id);
    });

    // Fetch profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, username, profile_image, interests')
      .in('user_id', Array.from(allUserIds));

    const profileMap = new Map(
      (profiles || []).map((p: DbProfile) => [p.user_id, p])
    );

    return requests.map((r: DbFriend) => {
      const fromProfile = profileMap.get(r.user_id);
      const toProfile = profileMap.get(r.friend_id);

      // Map DB status to FriendRequestStatus ('blocked' -> not shown in requests, so map to 'rejected')
      const status = r.status === 'blocked' ? 'rejected' as const : r.status;

      return {
        id: r.id,
        fromUserId: r.user_id,
        toUserId: r.friend_id,
        fromUser: fromProfile ? profileToUserInfo(fromProfile) : {
          id: r.user_id,
          name: 'Unknown',
          username: 'unknown',
        },
        toUser: toProfile ? profileToUserInfo(toProfile) : {
          id: r.friend_id,
          name: 'Unknown',
          username: 'unknown',
        },
        status,
        createdAt: r.created_at,
        respondedAt: r.updated_at !== r.created_at ? r.updated_at : undefined,
      };
    });
  } catch (error) {
    console.error('Failed to get friend requests:', error);
    return [];
  }
}

/**
 * Get pending requests received by current user
 */
export async function getPendingRequests(userId: string): Promise<FriendRequest[]> {
  const requests = await getFriendRequests(userId);
  return requests.filter((r) => r.toUserId === userId && r.status === 'pending');
}

/**
 * Get friend requests sent by current user
 */
export async function getSentRequests(userId: string): Promise<FriendRequest[]> {
  const requests = await getFriendRequests(userId);
  return requests.filter((r) => r.fromUserId === userId && r.status === 'pending');
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(
  fromUserId: string,
  toUserId: string
): Promise<FriendRequest> {
  // Check if friendship already exists
  const { data: existing } = await supabase
    .from('friends')
    .select('*')
    .or(
      `and(user_id.eq.${fromUserId},friend_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_id.eq.${fromUserId})`
    )
    .maybeSingle();

  if (existing) {
    const status = (existing as DbFriend).status;
    if (status === 'pending') {
      throw new Error('Friend request already pending');
    }
    if (status === 'accepted') {
      throw new Error('Already friends');
    }
  }

  // Create friend request
  const { data: newRequest, error } = await supabase
    .from('friends')
    .insert({
      user_id: fromUserId,
      friend_id: toUserId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to send friend request:', error);
    throw new Error('Failed to send friend request');
  }

  // Fetch profiles for the response
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, name, username, profile_image, interests')
    .in('user_id', [fromUserId, toUserId]);

  const profileMap = new Map(
    (profiles || []).map((p: DbProfile) => [p.user_id, p])
  );

  const fromProfile = profileMap.get(fromUserId);
  const toProfile = profileMap.get(toUserId);

  return {
    id: newRequest.id,
    fromUserId,
    toUserId,
    fromUser: fromProfile ? profileToUserInfo(fromProfile) : {
      id: fromUserId,
      name: 'Unknown',
      username: 'unknown',
    },
    toUser: toProfile ? profileToUserInfo(toProfile) : {
      id: toUserId,
      name: 'Unknown',
      username: 'unknown',
    },
    status: 'pending',
    createdAt: newRequest.created_at,
  };
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(
  requestId: string,
  userId: string
): Promise<Friend> {
  // Verify the request exists and is for this user
  const { data: request, error: fetchError } = await supabase
    .from('friends')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();

  if (fetchError || !request) {
    throw new Error('Friend request not found');
  }

  if ((request as DbFriend).friend_id !== userId) {
    throw new Error('Cannot accept this request');
  }

  if ((request as DbFriend).status !== 'pending') {
    throw new Error('Request is no longer pending');
  }

  // Update status to accepted
  const { error: updateError } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', requestId);

  if (updateError) {
    throw new Error('Failed to accept friend request');
  }

  // Get friend's profile
  const { data: friendProfile } = await supabase
    .from('profiles')
    .select('user_id, name, username, profile_image, interests')
    .eq('user_id', (request as DbFriend).user_id)
    .maybeSingle();

  return {
    id: requestId,
    odUserId: userId,
    friendUser: friendProfile ? profileToUserInfo(friendProfile as DbProfile) : {
      id: (request as DbFriend).user_id,
      name: 'Unknown',
      username: 'unknown',
    },
    friendsSince: new Date().toISOString(),
  };
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(
  requestId: string,
  userId: string
): Promise<void> {
  const { data: request, error: fetchError } = await supabase
    .from('friends')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();

  if (fetchError || !request) {
    throw new Error('Friend request not found');
  }

  if ((request as DbFriend).friend_id !== userId) {
    throw new Error('Cannot reject this request');
  }

  // Delete the request (or update to rejected)
  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', requestId);

  if (error) {
    throw new Error('Failed to reject friend request');
  }
}

/**
 * Cancel a sent friend request
 */
export async function cancelFriendRequest(
  requestId: string,
  userId: string
): Promise<void> {
  const { data: request, error: fetchError } = await supabase
    .from('friends')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();

  if (fetchError || !request) {
    throw new Error('Friend request not found');
  }

  if ((request as DbFriend).user_id !== userId) {
    throw new Error('Cannot cancel this request');
  }

  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', requestId);

  if (error) {
    throw new Error('Failed to cancel friend request');
  }
}

/**
 * Remove a friend
 */
export async function removeFriend(
  friendshipId: string,
  userId: string
): Promise<void> {
  const { data: friendship, error: fetchError } = await supabase
    .from('friends')
    .select('*')
    .eq('id', friendshipId)
    .maybeSingle();

  if (fetchError || !friendship) {
    throw new Error('Friendship not found');
  }

  const dbFriend = friendship as DbFriend;
  if (dbFriend.user_id !== userId && dbFriend.friend_id !== userId) {
    throw new Error('Cannot remove this friend');
  }

  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', friendshipId);

  if (error) {
    throw new Error('Failed to remove friend');
  }
}

// ============================================
// User Search & Discovery
// ============================================

/**
 * Search for users by name or username
 */
export async function searchUsers(
  query: string,
  currentUserId: string
): Promise<UserSearchResult[]> {
  if (!query.trim()) return [];

  const normalizedQuery = query.toLowerCase().trim();

  try {
    // Search profiles by name or username
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, name, username, profile_image, interests')
      .neq('user_id', currentUserId)
      .or(`name.ilike.*${normalizedQuery}*,username.ilike.*${normalizedQuery}*`)
      .limit(20);

    if (error) {
      console.error('Failed to search users:', error);
      return [];
    }

    if (!profiles || profiles.length === 0) return [];

    // Get current user's friendships to determine status
    const { data: friendships } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

    const friendshipMap = new Map<string, DbFriend>();
    (friendships || []).forEach((f: DbFriend) => {
      const otherUserId = f.user_id === currentUserId ? f.friend_id : f.user_id;
      friendshipMap.set(otherUserId, f);
    });

    return profiles.map((profile: DbProfile) => {
      const friendship = friendshipMap.get(profile.user_id);
      let friendshipStatus: FriendshipStatus = 'none';

      if (friendship) {
        if (friendship.status === 'accepted') {
          friendshipStatus = 'friends';
        } else if (friendship.status === 'pending') {
          friendshipStatus = friendship.user_id === currentUserId
            ? 'pending_sent'
            : 'pending_received';
        }
      }

      return {
        user: profileToUserInfo(profile),
        friendshipStatus,
        mutualFriendsCount: 0, // Could be calculated with more queries
      };
    });
  } catch (error) {
    console.error('Failed to search users:', error);
    return [];
  }
}

/**
 * Get friendship status with a specific user
 */
export async function getFriendshipStatus(
  currentUserId: string,
  otherUserId: string
): Promise<FriendshipStatus> {
  try {
    const { data: friendship } = await supabase
      .from('friends')
      .select('*')
      .or(
        `and(user_id.eq.${currentUserId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${currentUserId})`
      )
      .maybeSingle();

    if (!friendship) return 'none';

    const dbFriend = friendship as DbFriend;
    if (dbFriend.status === 'accepted') return 'friends';
    if (dbFriend.status === 'pending') {
      return dbFriend.user_id === currentUserId ? 'pending_sent' : 'pending_received';
    }

    return 'none';
  } catch {
    return 'none';
  }
}

/**
 * Get social stats for a user
 */
export async function getSocialStats(userId: string): Promise<SocialStats> {
  const [friends, pendingRequests] = await Promise.all([
    getFriends(userId),
    getPendingRequests(userId),
  ]);

  // Get unread messages count
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false);

  return {
    friendsCount: friends.length,
    pendingRequestsCount: pendingRequests.length,
    unreadMessagesCount: unreadCount || 0,
  };
}

/**
 * Get suggested friends based on shared interests
 */
export async function getSuggestedFriends(
  userId: string,
  limit: number = 5
): Promise<UserSearchResult[]> {
  try {
    // Get current user's profile to know their interests
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('interests')
      .eq('user_id', userId)
      .maybeSingle();

    const userInterests = (currentProfile?.interests as string[]) || [];

    // Get existing friends and pending requests to exclude
    const { data: friendships } = await supabase
      .from('friends')
      .select('user_id, friend_id')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    const excludeIds = new Set([userId]);
    (friendships || []).forEach((f: { user_id: string; friend_id: string }) => {
      excludeIds.add(f.user_id);
      excludeIds.add(f.friend_id);
    });

    // Find users with overlapping interests
    let query = supabase
      .from('profiles')
      .select('user_id, name, username, profile_image, interests')
      .limit(limit * 2);

    const excludeArray = Array.from(excludeIds);
    if (excludeArray.length > 0) {
      query = query.not('user_id', 'in', `(${excludeArray.join(',')})`);
    }

    const { data: profiles, error } = await query;

    if (error || !profiles) return [];

    // Score by shared interests and sort
    const scored = profiles.map((profile: DbProfile) => {
      const sharedInterests = profile.interests.filter(
        (i) => userInterests.includes(i)
      );
      return {
        profile,
        sharedCount: sharedInterests.length,
      };
    });

    scored.sort((a, b) => b.sharedCount - a.sharedCount);

    return scored.slice(0, limit).map(({ profile }) => ({
      user: profileToUserInfo(profile),
      friendshipStatus: 'none' as FriendshipStatus,
      mutualFriendsCount: 0,
    }));
  } catch (error) {
    console.error('Failed to get suggested friends:', error);
    return [];
  }
}

/**
 * Clear all friends data (for testing)
 */
export async function clearFriendsData(userId: string): Promise<void> {
  await supabase
    .from('friends')
    .delete()
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
}
