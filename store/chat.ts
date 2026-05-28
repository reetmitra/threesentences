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
  conversation_id: string | null;
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

interface DbConversation {
  id: string;
  user_a_id: string;
  user_b_id: string;
  last_message_content: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  unread_count_a: number;
  unread_count_b: number;
  created_at: string;
  updated_at: string | null;
}

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
    conversationId: dbMessage.conversation_id || dbMessage.group_id || '',
    senderId: dbMessage.sender_id,
    content: dbMessage.content,
    createdAt: dbMessage.created_at,
    readAt: dbMessage.is_read ? dbMessage.created_at : undefined,
    status: dbMessage.is_read ? 'read' : 'delivered',
  };
}

/**
 * Build a Conversation from a DB conversation row and resolved participant info.
 */
function mapDbConversationToConversation(
  row: DbConversation,
  userId: string,
  otherUserInfo: UserInfo
): Conversation {
  const isUserA = userId === row.user_a_id;
  const unreadCount = isUserA ? row.unread_count_a : row.unread_count_b;
  const updatedAt = row.updated_at ?? row.last_message_at ?? row.created_at;

  let lastMessage: Message | undefined;
  if (row.last_message_at && row.last_message_content && row.last_message_sender_id) {
    lastMessage = {
      id: '',
      conversationId: row.id,
      senderId: row.last_message_sender_id,
      content: row.last_message_content,
      createdAt: row.last_message_at,
      status: 'delivered',
    };
  }

  return {
    id: row.id,
    participants: [{ id: userId, name: '', username: '' }, otherUserInfo],
    lastMessage,
    unreadCount,
    createdAt: row.created_at,
    updatedAt,
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
    const { data: rows, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }

    if (!rows || rows.length === 0) return [];

    const dbRows = rows as DbConversation[];

    // Collect the IDs of all the other participants
    const partnerIds = dbRows.map((row) =>
      row.user_a_id === userId ? row.user_b_id : row.user_a_id
    );

    // Batch-fetch partner profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, username, profile_image')
      .in('user_id', partnerIds);

    const profileMap = new Map<string, DbProfile>(
      ((profiles ?? []) as DbProfile[]).map((p) => [p.user_id, p])
    );

    // Build conversations
    const conversations: Conversation[] = dbRows.map((row) => {
      const partnerId = row.user_a_id === userId ? row.user_b_id : row.user_a_id;
      const partnerProfile = profileMap.get(partnerId);
      const otherUserInfo: UserInfo = partnerProfile
        ? profileToUserInfo(partnerProfile)
        : { id: partnerId, name: 'Unknown', username: 'unknown' };

      return mapDbConversationToConversation(row, userId, otherUserInfo);
    });

    // Sort by updatedAt descending
    return conversations.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (err) {
    console.error('Failed to get conversations:', err);
    return [];
  }
}

/**
 * Get or create a conversation with another user via RPC
 */
export async function getOrCreateConversation(
  currentUser: UserInfo,
  otherUser: UserInfo
): Promise<Conversation> {
  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    p_user_id_1: currentUser.id,
    p_user_id_2: otherUser.id,
  });

  if (error) {
    console.error('Failed to get or create conversation:', error);
    throw new Error('Failed to get or create conversation');
  }

  const row = data as DbConversation;
  const isUserA = currentUser.id === row.user_a_id;
  const unreadCount = isUserA ? row.unread_count_a : row.unread_count_b;
  const updatedAt = row.updated_at ?? row.last_message_at ?? row.created_at;

  return {
    id: row.id,
    participants: [currentUser, otherUser],
    unreadCount,
    createdAt: row.created_at,
    updatedAt,
  };
}

// ============================================
// Messages
// ============================================

/**
 * Get messages for a conversation with pagination cursor support
 */
export async function getMessages(
  conversationId: string,
  cursor: string | null
): Promise<{ messages: Message[]; nextCursor: string | null }> {
  try {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error('Failed to get messages:', error);
      return { messages: [], nextCursor: null };
    }

    const dbRows = (rows ?? []) as DbMessage[];

    // Map to Message, overriding conversationId from the param
    const messages: Message[] = dbRows
      .map((m) => ({
        ...mapToMessage(m),
        conversationId,
        status: (m.is_read ? 'read' : 'delivered') as Message['status'],
      }))
      .reverse(); // Oldest first (ascending)

    // nextCursor is the created_at of the oldest returned message (first in DESC = last in ASC)
    const nextCursor =
      dbRows.length === 30 ? dbRows[dbRows.length - 1].created_at : null;

    return { messages, nextCursor };
  } catch (err) {
    console.error('Failed to get messages:', err);
    return { messages: [], nextCursor: null };
  }
}

/**
 * Send a DM via RPC
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> {
  const { data, error } = await supabase.rpc('send_dm', {
    p_conversation_id: conversationId,
    p_sender_id: senderId,
    p_content: content,
  });

  if (error) {
    console.error('Failed to send message:', error);
    throw new Error('Failed to send message');
  }

  const row = data as DbMessage;
  return {
    id: row.id,
    conversationId,
    senderId: row.sender_id,
    content: row.content,
    createdAt: row.created_at,
    status: 'sent',
  };
}

/**
 * Mark all messages in a conversation as read for a user
 */
export async function markAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    await supabase.rpc('mark_conversation_read', {
      p_conversation_id: conversationId,
      p_user_id: userId,
    });
  } catch (err) {
    // Non-critical — silently swallow
    console.warn('mark_conversation_read failed (non-critical):', err);
  }
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

    return ((messages ?? []) as DbMessage[]).map((m) => ({
      ...mapToMessage(m),
      conversationId: groupId,
    }));
  } catch (err) {
    console.error('Failed to get group messages:', err);
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
 * Subscribe to conversation list updates for a user.
 * Watches UPDATE on the conversations table (no column filter — both user_a and user_b).
 */
export function subscribeToConversations(
  userId: string,
  onUpdate: (conversation: Conversation) => void
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
      },
      (payload) => {
        const row = payload.new as DbConversation;
        if (row.user_a_id !== userId && row.user_b_id !== userId) return;

        const partnerId = row.user_a_id === userId ? row.user_b_id : row.user_a_id;
        const otherUserInfo: UserInfo = { id: partnerId, name: '', username: '' };
        onUpdate(mapDbConversationToConversation(row, userId, otherUserInfo));
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const row = payload.new as DbMessage;
        onNewMessage({
          id: row.id,
          conversationId,
          senderId: row.sender_id,
          content: row.content,
          createdAt: row.created_at,
          status: 'delivered',
        });
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
  const channel: RealtimeChannel = supabase
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
        const newMessage: Message = {
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
// Typing Indicators (Broadcast)
// ============================================

/**
 * Broadcast a typing indicator event (fire-and-forget, no await)
 */
export function broadcastTyping(
  conversationId: string,
  userId: string,
  isTyping: boolean
): void {
  const channel = supabase.channel(`typing:${conversationId}`);
  void channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { userId, isTyping },
  });
}

/**
 * Subscribe to typing indicator events for a conversation
 */
export function subscribeToTyping(
  conversationId: string,
  onTyping: (userId: string, isTyping: boolean) => void
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`typing:${conversationId}`)
    .on('broadcast', { event: 'typing' }, (payload) => {
      const { userId, isTyping } = payload.payload as {
        userId: string;
        isTyping: boolean;
      };
      onTyping(userId, isTyping);
    })
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
 * Clear all chat data for a user (utility / testing)
 */
export async function clearChatData(userId: string): Promise<void> {
  await supabase
    .from('messages')
    .delete()
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
}
