/**
 * Three™ - Chat Store
 *
 * Manages direct messages and group chats.
 * Uses Supabase for persistence with Realtime subscriptions.
 */

import { supabase } from '@/config/supabase';
import {
  Conversation,
  Message,
  UserInfo,
} from '@/types/social';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Database types
 */
interface DbMessage {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  group_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface DbProfile {
  user_id: string;
  name: string;
  username: string;
  profile_image: string | null;
}

/**
 * Active Realtime subscription
 */
let messageSubscription: RealtimeChannel | null = null;

/**
 * Convert DB profile to UserInfo
 */
function profileToUserInfo(profile: DbProfile): UserInfo {
  return {
    id: profile.user_id,
    name: profile.name,
    username: profile.username,
    profileImage: profile.profile_image ?? undefined,
  };
}

/**
 * Convert DB message to app Message type
 */
function mapToMessage(dbMessage: DbMessage): Message {
  return {
    id: dbMessage.id,
    conversationId: dbMessage.receiver_id || dbMessage.group_id || '',
    senderId: dbMessage.sender_id,
    content: dbMessage.content,
    createdAt: dbMessage.created_at,
    readAt: dbMessage.is_read ? dbMessage.created_at : undefined,
    status: dbMessage.is_read ? 'read' : 'delivered',
  };
}

// ============================================
// Conversations (Direct Messages)
// ============================================

/**
 * Get all conversations for a user
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    // Get all messages where user is sender or receiver
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .is('group_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }

    if (!messages || messages.length === 0) return [];

    // Group messages by conversation partner
    const conversationMap = new Map<string, DbMessage[]>();
    const partnerIds = new Set<string>();

    messages.forEach((msg: DbMessage) => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!partnerId) return;

      partnerIds.add(partnerId);
      const existing = conversationMap.get(partnerId) || [];
      existing.push(msg);
      conversationMap.set(partnerId, existing);
    });

    // Fetch partner profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, username, profile_image')
      .in('user_id', Array.from(partnerIds));

    const profileMap = new Map(
      (profiles || []).map((p: DbProfile) => [p.user_id, p])
    );

    // Get current user profile
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('user_id, name, username, profile_image')
      .eq('user_id', userId)
      .single();

    const currentUserInfo: UserInfo = currentProfile
      ? profileToUserInfo(currentProfile as DbProfile)
      : { id: userId, name: 'Me', username: 'me' };

    // Build conversations
    const conversations: Conversation[] = [];

    conversationMap.forEach((msgs, partnerId) => {
      const partnerProfile = profileMap.get(partnerId);
      const partnerInfo: UserInfo = partnerProfile
        ? profileToUserInfo(partnerProfile)
        : { id: partnerId, name: 'Unknown', username: 'unknown' };

      const sortedMsgs = msgs.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastMsg = sortedMsgs[0];
      const unreadCount = msgs.filter(
        (m) => !m.is_read && m.sender_id !== userId
      ).length;

      conversations.push({
        id: partnerId, // Use partner ID as conversation ID for DMs
        participants: [currentUserInfo, partnerInfo],
        lastMessage: lastMsg ? mapToMessage(lastMsg) : undefined,
        unreadCount,
        createdAt: sortedMsgs[sortedMsgs.length - 1].created_at,
        updatedAt: lastMsg.created_at,
      });
    });

    // Sort by most recent
    return conversations.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Failed to get conversations:', error);
    return [];
  }
}

/**
 * Get a conversation by partner ID
 */
export async function getConversationById(
  userId: string,
  partnerId: string
): Promise<Conversation | null> {
  const conversations = await getConversations(userId);
  return conversations.find((c) => c.id === partnerId) || null;
}

/**
 * Get or create a conversation with a user
 */
export async function getOrCreateConversation(
  currentUser: UserInfo,
  otherUser: UserInfo
): Promise<Conversation> {
  // Check if conversation exists
  const existing = await getConversationById(currentUser.id, otherUser.id);
  if (existing) return existing;

  // Return a new conversation shell (messages will create it)
  return {
    id: otherUser.id,
    participants: [currentUser, otherUser],
    unreadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// Messages
// ============================================

/**
 * Get messages for a direct conversation
 */
export async function getMessages(
  userId: string,
  partnerId: string
): Promise<Message[]> {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
      )
      .is('group_id', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to get messages:', error);
      return [];
    }

    return (messages || []).map((m: DbMessage) => mapToMessage(m));
  } catch (error) {
    console.error('Failed to get messages:', error);
    return [];
  }
}

/**
 * Send a message
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message> {
  if (!content.trim()) {
    throw new Error('Message cannot be empty');
  }

  const { data: newMessage, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: content.trim(),
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to send message:', error);
    throw new Error('Failed to send message');
  }

  return mapToMessage(newMessage as DbMessage);
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  userId: string,
  partnerId: string
): Promise<void> {
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', partnerId)
    .eq('receiver_id', userId)
    .eq('is_read', false);
}

/**
 * Get unread message count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }

  return count || 0;
}

// ============================================
// Group Messages
// ============================================

/**
 * Get messages for a group
 */
export async function getGroupMessages(groupId: string): Promise<Message[]> {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to get group messages:', error);
      return [];
    }

    return (messages || []).map((m: DbMessage) => ({
      ...mapToMessage(m),
      conversationId: groupId,
    }));
  } catch (error) {
    console.error('Failed to get group messages:', error);
    return [];
  }
}

/**
 * Send a message to a group
 */
export async function sendGroupMessage(
  senderId: string,
  groupId: string,
  content: string
): Promise<Message> {
  if (!content.trim()) {
    throw new Error('Message cannot be empty');
  }

  const { data: newMessage, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      group_id: groupId,
      content: content.trim(),
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to send group message:', error);
    throw new Error('Failed to send message');
  }

  return {
    ...mapToMessage(newMessage as DbMessage),
    conversationId: groupId,
  };
}

// ============================================
// Realtime Subscriptions
// ============================================

/**
 * Subscribe to new messages for a user
 */
export function subscribeToMessages(
  userId: string,
  onNewMessage: (message: Message) => void
): () => void {
  // Unsubscribe from previous subscription
  if (messageSubscription) {
    messageSubscription.unsubscribe();
  }

  messageSubscription = supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        const newMessage = mapToMessage(payload.new as DbMessage);
        onNewMessage(newMessage);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    if (messageSubscription) {
      messageSubscription.unsubscribe();
      messageSubscription = null;
    }
  };
}

/**
 * Subscribe to messages in a specific conversation
 */
export function subscribeToConversation(
  userId: string,
  partnerId: string,
  onNewMessage: (message: Message) => void
): () => void {
  const channel = supabase
    .channel(`conversation:${userId}:${partnerId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        const msg = payload.new as DbMessage;
        // Only handle messages in this conversation
        if (
          (msg.sender_id === userId && msg.receiver_id === partnerId) ||
          (msg.sender_id === partnerId && msg.receiver_id === userId)
        ) {
          onNewMessage(mapToMessage(msg));
        }
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

/**
 * Subscribe to group messages
 */
export function subscribeToGroupMessages(
  groupId: string,
  onNewMessage: (message: Message) => void
): () => void {
  const channel = supabase
    .channel(`group:${groupId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${groupId}`,
      },
      (payload) => {
        const newMessage = {
          ...mapToMessage(payload.new as DbMessage),
          conversationId: groupId,
        };
        onNewMessage(newMessage);
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

// ============================================
// Utility
// ============================================

/**
 * Delete a message (own messages only)
 */
export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', userId);

  if (error) {
    console.error('Failed to delete message:', error);
    throw new Error('Failed to delete message');
  }
}

/**
 * Clear all chat data for testing
 */
export async function clearChatData(userId: string): Promise<void> {
  await supabase
    .from('messages')
    .delete()
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
}
