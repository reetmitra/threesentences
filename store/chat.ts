/**
 * ThreeSixtyThree™ Three Sentences - Chat Store
 *
 * Manages conversations and messages.
 * Uses AsyncStorage for local persistence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Conversation,
  Message,
  UserInfo,
  createConversation,
  createMessage,
  generateSocialId,
} from '@/types/social';

const STORAGE_KEYS = {
  CONVERSATIONS: '@threesentences/conversations',
  MESSAGES: '@threesentences/messages',
} as const;

/**
 * Get all conversations
 */
export async function getConversations(): Promise<Conversation[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!data) return [];
    const conversations = JSON.parse(data) as Conversation[];
    // Sort by most recent activity
    return conversations.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Failed to get conversations:', error);
    return [];
  }
}

/**
 * Get a conversation by ID
 */
export async function getConversationById(
  conversationId: string
): Promise<Conversation | null> {
  const conversations = await getConversations();
  return conversations.find((c) => c.id === conversationId) || null;
}

/**
 * Get or create a conversation with a user
 */
export async function getOrCreateConversation(
  currentUser: UserInfo,
  otherUser: UserInfo
): Promise<Conversation> {
  const conversations = await getConversations();

  // Find existing conversation
  const existing = conversations.find((c) =>
    c.participants.some((p) => p.id === otherUser.id)
  );

  if (existing) return existing;

  // Create new conversation
  const newConversation = createConversation(currentUser, otherUser);
  conversations.push(newConversation);

  await AsyncStorage.setItem(
    STORAGE_KEYS.CONVERSATIONS,
    JSON.stringify(conversations)
  );

  return newConversation;
}

/**
 * Get all messages for a conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!data) return [];
    const allMessages = JSON.parse(data) as Message[];
    return allMessages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (error) {
    console.error('Failed to get messages:', error);
    return [];
  }
}

/**
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> {
  if (!content.trim()) {
    throw new Error('Message cannot be empty');
  }

  // Get existing messages
  const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
  const allMessages: Message[] = data ? JSON.parse(data) : [];

  // Create new message
  const newMessage = createMessage(conversationId, senderId, content.trim());

  // Simulate sending delay and update status
  newMessage.status = 'sent';
  allMessages.push(newMessage);

  // Update conversation
  const conversations = await getConversations();
  const conversationIndex = conversations.findIndex((c) => c.id === conversationId);

  if (conversationIndex !== -1) {
    conversations[conversationIndex] = {
      ...conversations[conversationIndex],
      lastMessage: newMessage,
      updatedAt: new Date().toISOString(),
    };
  }

  // Save both
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages)),
    AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations)),
  ]);

  // Simulate delivery after a short delay
  setTimeout(async () => {
    await updateMessageStatus(newMessage.id, 'delivered');
  }, 500);

  return newMessage;
}

/**
 * Update message status
 */
export async function updateMessageStatus(
  messageId: string,
  status: Message['status']
): Promise<void> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
  if (!data) return;

  const allMessages: Message[] = JSON.parse(data);
  const messageIndex = allMessages.findIndex((m) => m.id === messageId);

  if (messageIndex !== -1) {
    allMessages[messageIndex] = {
      ...allMessages[messageIndex],
      status,
      ...(status === 'read' ? { readAt: new Date().toISOString() } : {}),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
  }
}

/**
 * Mark all messages in a conversation as read
 */
export async function markConversationAsRead(
  conversationId: string,
  currentUserId: string
): Promise<void> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
  if (!data) return;

  const allMessages: Message[] = JSON.parse(data);
  const now = new Date().toISOString();

  let updated = false;
  const updatedMessages = allMessages.map((message) => {
    if (
      message.conversationId === conversationId &&
      message.senderId !== currentUserId &&
      message.status !== 'read'
    ) {
      updated = true;
      return { ...message, status: 'read' as const, readAt: now };
    }
    return message;
  });

  if (updated) {
    // Update messages
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));

    // Update conversation unread count
    const conversations = await getConversations();
    const conversationIndex = conversations.findIndex((c) => c.id === conversationId);

    if (conversationIndex !== -1) {
      conversations[conversationIndex] = {
        ...conversations[conversationIndex],
        unreadCount: 0,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.CONVERSATIONS,
        JSON.stringify(conversations)
      );
    }
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
  if (!data) return;

  const allMessages: Message[] = JSON.parse(data);
  const updatedMessages = allMessages.filter((m) => m.id !== messageId);

  await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
}

/**
 * Delete a conversation and its messages
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  // Remove conversation
  const conversations = await getConversations();
  const updatedConversations = conversations.filter((c) => c.id !== conversationId);

  // Remove messages
  const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
  const allMessages: Message[] = data ? JSON.parse(data) : [];
  const updatedMessages = allMessages.filter((m) => m.conversationId !== conversationId);

  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updatedConversations)),
    AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages)),
  ]);
}

/**
 * Get total unread message count
 */
export async function getTotalUnreadCount(): Promise<number> {
  const conversations = await getConversations();
  return conversations.reduce((total, c) => total + c.unreadCount, 0);
}

/**
 * Set typing indicator
 */
export async function setTypingIndicator(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  const conversations = await getConversations();
  const conversationIndex = conversations.findIndex((c) => c.id === conversationId);

  if (conversationIndex !== -1) {
    conversations[conversationIndex] = {
      ...conversations[conversationIndex],
      isTyping,
      typingUserId: isTyping ? userId : undefined,
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.CONVERSATIONS,
      JSON.stringify(conversations)
    );
  }
}

/**
 * Simulate receiving a message (for demo purposes)
 */
export async function simulateIncomingMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
  const allMessages: Message[] = data ? JSON.parse(data) : [];

  const newMessage: Message = {
    id: generateSocialId(),
    conversationId,
    senderId,
    content,
    createdAt: new Date().toISOString(),
    status: 'delivered',
  };

  allMessages.push(newMessage);

  // Update conversation
  const conversations = await getConversations();
  const conversationIndex = conversations.findIndex((c) => c.id === conversationId);

  if (conversationIndex !== -1) {
    conversations[conversationIndex] = {
      ...conversations[conversationIndex],
      lastMessage: newMessage,
      unreadCount: conversations[conversationIndex].unreadCount + 1,
      updatedAt: new Date().toISOString(),
    };
  }

  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages)),
    AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations)),
  ]);

  return newMessage;
}

/**
 * Get recent conversations (limited)
 */
export async function getRecentConversations(limit: number = 10): Promise<Conversation[]> {
  const conversations = await getConversations();
  return conversations.slice(0, limit);
}

/**
 * Search messages
 */
export async function searchMessages(query: string): Promise<Message[]> {
  if (!query.trim()) return [];

  const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
  if (!data) return [];

  const allMessages: Message[] = JSON.parse(data);
  const normalizedQuery = query.toLowerCase();

  return allMessages.filter((m) =>
    m.content.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Clear all chat data
 */
export async function clearChatData(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.CONVERSATIONS),
    AsyncStorage.removeItem(STORAGE_KEYS.MESSAGES),
  ]);
}
