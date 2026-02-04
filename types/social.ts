/**
 * ThreeSixtyThree™ Three Sentences - Social & Chat Types
 *
 * Data models for friends, conversations, and messaging.
 */

/**
 * Friend request status
 */
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

/**
 * Friendship status between users
 */
export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

/**
 * Basic user info for display in social contexts
 */
export interface UserInfo {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
}

/**
 * Friend request
 */
export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: UserInfo;
  toUser: UserInfo;
  status: FriendRequestStatus;
  createdAt: string;
  respondedAt?: string;
}

/**
 * Friend relationship
 */
export interface Friend {
  id: string;
  odUserId: string;
  friendUser: UserInfo;
  friendsSince: string;
  lastInteraction?: string;
}

/**
 * Message in a conversation
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

/**
 * Conversation between users
 */
export interface Conversation {
  id: string;
  participants: UserInfo[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isTyping?: boolean;
  typingUserId?: string;
}

/**
 * Search result for finding users
 */
export interface UserSearchResult {
  user: UserInfo;
  friendshipStatus: FriendshipStatus;
  mutualFriendsCount: number;
}

/**
 * Social stats for a user
 */
export interface SocialStats {
  friendsCount: number;
  pendingRequestsCount: number;
  unreadMessagesCount: number;
}

/**
 * Generate a unique ID
 */
export function generateSocialId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create a new message
 */
export function createMessage(
  conversationId: string,
  senderId: string,
  content: string
): Message {
  return {
    id: generateSocialId(),
    conversationId,
    senderId,
    content,
    createdAt: new Date().toISOString(),
    status: 'sending',
  };
}

/**
 * Create a new conversation
 */
export function createConversation(
  currentUser: UserInfo,
  otherUser: UserInfo
): Conversation {
  const now = new Date().toISOString();
  return {
    id: generateSocialId(),
    participants: [currentUser, otherUser],
    unreadCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a friend request
 */
export function createFriendRequest(
  fromUser: UserInfo,
  toUser: UserInfo
): FriendRequest {
  return {
    id: generateSocialId(),
    fromUserId: fromUser.id,
    toUserId: toUser.id,
    fromUser,
    toUser,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Format time for chat display
 */
export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format time for message timestamps
 */
export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Get the other participant in a conversation
 */
export function getOtherParticipant(
  conversation: Conversation,
  currentUserId: string
): UserInfo | undefined {
  return conversation.participants.find((p) => p.id !== currentUserId);
}

/**
 * Check if message is from current user
 */
export function isOwnMessage(message: Message, currentUserId: string): boolean {
  return message.senderId === currentUserId;
}
