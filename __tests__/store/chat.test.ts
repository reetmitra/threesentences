/**
 * Tests for Chat Store
 *
 * Tests chat management functions including
 * conversations, messages, and message status.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getConversations,
    getConversationById,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    markConversationAsRead,
    deleteMessage,
    deleteConversation,
    getTotalUnreadCount,
    getRecentConversations,
    clearChatData,
} from '@/store/chat';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('chat store', () => {
    const currentUser = {
        id: 'current-user',
        name: 'Current User',
        username: 'currentuser',
    };
    const otherUser = {
        id: 'other-user',
        name: 'Other User',
        username: 'otheruser',
    };

    const mockConversation = {
        id: 'conv-1',
        participants: [currentUser, otherUser],
        lastMessage: undefined,
        unreadCount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const mockMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: currentUser.id,
        content: 'Hello!',
        createdAt: '2024-01-01T00:00:00.000Z',
        status: 'sent' as const,
        isRead: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getConversations', () => {
        it('returns empty array when no conversations exist', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const conversations = await getConversations();

            expect(conversations).toEqual([]);
        });

        it('returns conversations sorted by most recent', async () => {
            const older = { ...mockConversation, id: 'older', updatedAt: '2024-01-01T00:00:00.000Z' };
            const newer = { ...mockConversation, id: 'newer', updatedAt: '2024-01-02T00:00:00.000Z' };
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([older, newer]));

            const conversations = await getConversations();

            expect(conversations[0].id).toBe('newer');
            expect(conversations[1].id).toBe('older');
        });

        it('returns empty array on parse error', async () => {
            mockAsyncStorage.getItem.mockResolvedValue('invalid json');

            const conversations = await getConversations();

            expect(conversations).toEqual([]);
        });
    });

    describe('getConversationById', () => {
        it('returns conversation when found', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockConversation]));

            const conversation = await getConversationById('conv-1');

            expect(conversation).toEqual(mockConversation);
        });

        it('returns null when conversation not found', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockConversation]));

            const conversation = await getConversationById('nonexistent');

            expect(conversation).toBeNull();
        });
    });

    describe('getOrCreateConversation', () => {
        beforeEach(() => {
            mockAsyncStorage.setItem.mockResolvedValue(undefined);
        });

        it('returns existing conversation if one exists', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockConversation]));

            const conversation = await getOrCreateConversation(currentUser, otherUser);

            expect(conversation.id).toBe(mockConversation.id);
            expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
        });

        it('creates new conversation if none exists', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const conversation = await getOrCreateConversation(currentUser, otherUser);

            expect(conversation.participants).toHaveLength(2);
            expect(mockAsyncStorage.setItem).toHaveBeenCalled();
        });
    });

    describe('getMessages', () => {
        it('returns empty array when no messages exist', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const messages = await getMessages('conv-1');

            expect(messages).toEqual([]);
        });

        it('filters messages by conversation ID', async () => {
            const messages = [
                mockMessage,
                { ...mockMessage, id: 'msg-2', conversationId: 'other-conv' },
            ];
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(messages));

            const filtered = await getMessages('conv-1');

            expect(filtered).toHaveLength(1);
            expect(filtered[0].id).toBe('msg-1');
        });

        it('sorts messages by creation time', async () => {
            const older = { ...mockMessage, id: 'older', createdAt: '2024-01-01T00:00:00.000Z' };
            const newer = { ...mockMessage, id: 'newer', createdAt: '2024-01-02T00:00:00.000Z' };
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([newer, older]));

            const messages = await getMessages('conv-1');

            expect(messages[0].id).toBe('older');
            expect(messages[1].id).toBe('newer');
        });
    });

    describe('sendMessage', () => {
        beforeEach(() => {
            mockAsyncStorage.getItem.mockImplementation((key) => {
                if (key === '@threesentences/messages') return Promise.resolve(null);
                if (key === '@threesentences/conversations') {
                    return Promise.resolve(JSON.stringify([mockConversation]));
                }
                return Promise.resolve(null);
            });
            mockAsyncStorage.setItem.mockResolvedValue(undefined);
        });

        it('creates and saves a new message', async () => {
            const message = await sendMessage('conv-1', currentUser.id, 'Hello!');

            expect(message.content).toBe('Hello!');
            expect(message.senderId).toBe(currentUser.id);
            expect(message.status).toBe('sent');
        });

        it('trims message content', async () => {
            const message = await sendMessage('conv-1', currentUser.id, '  Hello!  ');

            expect(message.content).toBe('Hello!');
        });

        it('throws error for empty message', async () => {
            await expect(
                sendMessage('conv-1', currentUser.id, '')
            ).rejects.toThrow(/empty/i);
        });

        it('throws error for whitespace-only message', async () => {
            await expect(
                sendMessage('conv-1', currentUser.id, '   ')
            ).rejects.toThrow(/empty/i);
        });

        it('updates conversation lastMessage', async () => {
            await sendMessage('conv-1', currentUser.id, 'Hello!');

            const setItemCalls = mockAsyncStorage.setItem.mock.calls;
            const conversationsCall = setItemCalls.find(
                (call) => call[0] === '@threesentences/conversations'
            );
            expect(conversationsCall).toBeTruthy();
        });
    });

    describe('markConversationAsRead', () => {
        beforeEach(() => {
            mockAsyncStorage.getItem.mockImplementation((key) => {
                if (key === '@threesentences/messages') {
                    return Promise.resolve(JSON.stringify([mockMessage]));
                }
                if (key === '@threesentences/conversations') {
                    return Promise.resolve(JSON.stringify([mockConversation]));
                }
                return Promise.resolve(null);
            });
            mockAsyncStorage.setItem.mockResolvedValue(undefined);
        });

        it('marks conversation messages as read', async () => {
            await markConversationAsRead('conv-1', currentUser.id);

            expect(mockAsyncStorage.setItem).toHaveBeenCalled();
        });
    });

    describe('deleteMessage', () => {
        beforeEach(() => {
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockMessage]));
            mockAsyncStorage.setItem.mockResolvedValue(undefined);
        });

        it('removes message from storage', async () => {
            await deleteMessage('msg-1');

            const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
            const savedMessages = JSON.parse(setItemCall[1]);
            expect(savedMessages).toHaveLength(0);
        });
    });

    describe('deleteConversation', () => {
        beforeEach(() => {
            mockAsyncStorage.getItem.mockImplementation((key) => {
                if (key === '@threesentences/conversations') {
                    return Promise.resolve(JSON.stringify([mockConversation]));
                }
                if (key === '@threesentences/messages') {
                    return Promise.resolve(JSON.stringify([mockMessage]));
                }
                return Promise.resolve(null);
            });
            mockAsyncStorage.setItem.mockResolvedValue(undefined);
        });

        it('removes conversation and its messages', async () => {
            await deleteConversation('conv-1');

            expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2);
        });
    });

    describe('getTotalUnreadCount', () => {
        it('returns total unread count', async () => {
            const conversations = [
                { ...mockConversation, unreadCount: 2 },
                { ...mockConversation, id: 'conv-2', unreadCount: 3 },
            ];
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(conversations));

            const count = await getTotalUnreadCount();

            expect(count).toBe(5);
        });
    });

    describe('getRecentConversations', () => {
        it('returns limited number of conversations', async () => {
            const conversations = Array(10).fill(null).map((_, i) => ({
                ...mockConversation,
                id: `conv-${i}`,
                updatedAt: new Date(2024, 0, i + 1).toISOString(),
            }));
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(conversations));

            const recent = await getRecentConversations(5);

            expect(recent).toHaveLength(5);
        });
    });

    describe('clearChatData', () => {
        it('removes all chat data from storage', async () => {
            mockAsyncStorage.multiRemove.mockResolvedValue(undefined);

            await clearChatData();

            expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
                '@threesentences/conversations',
                '@threesentences/messages',
            ]);
        });
    });
});
