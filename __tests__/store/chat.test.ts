/**
 * Three™ - Chat Store Tests
 *
 * Tests for Supabase-based messaging with Realtime.
 */

// Mock Supabase
jest.mock('@/config/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
        channel: jest.fn(() => ({
            on: jest.fn().mockReturnThis(),
            subscribe: jest.fn().mockReturnThis(),
            unsubscribe: jest.fn(),
        })),
    },
}));

import { supabase } from '@/config/supabase';
import {
    getConversations,
    getMessages,
    sendMessage,
    markMessagesAsRead,
    getUnreadCount,
    subscribeToMessages,
} from '@/store/chat';

const TEST_USER_ID = 'user_test123';
const OTHER_USER_ID = 'user_other456';

describe('Chat Store', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getConversations', () => {
        it('should return empty array when no messages exist', async () => {
            const mockFrom = supabase.from as jest.Mock;
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                or: jest.fn().mockReturnThis(),
                is: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: [], error: null }),
            });

            const result = await getConversations(TEST_USER_ID);
            expect(result).toEqual([]);
        });

        it('should group messages into conversations', async () => {
            const mockMessages = [
                {
                    id: 'msg-1',
                    sender_id: TEST_USER_ID,
                    receiver_id: OTHER_USER_ID,
                    group_id: null,
                    content: 'Hello',
                    is_read: true,
                    created_at: '2024-01-01T00:00:00Z',
                },
                {
                    id: 'msg-2',
                    sender_id: OTHER_USER_ID,
                    receiver_id: TEST_USER_ID,
                    group_id: null,
                    content: 'Hi!',
                    is_read: false,
                    created_at: '2024-01-01T01:00:00Z',
                },
            ];
            const mockProfile = {
                user_id: OTHER_USER_ID,
                name: 'Other User',
                username: 'other',
                profile_image: null,
            };

            const mockFrom = supabase.from as jest.Mock;
            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    or: jest.fn().mockReturnThis(),
                    is: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({ data: mockMessages, error: null }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    in: jest.fn().mockResolvedValue({ data: [mockProfile], error: null }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: { user_id: TEST_USER_ID, name: 'Me', username: 'me' },
                        error: null,
                    }),
                });

            const result = await getConversations(TEST_USER_ID);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(OTHER_USER_ID);
            expect(result[0].unreadCount).toBe(1);
        });
    });

    describe('getMessages', () => {
        it('should return messages for a conversation', async () => {
            const mockMessages = [
                {
                    id: 'msg-1',
                    sender_id: TEST_USER_ID,
                    receiver_id: OTHER_USER_ID,
                    content: 'Hello',
                    is_read: true,
                    created_at: '2024-01-01T00:00:00Z',
                },
            ];

            const mockFrom = supabase.from as jest.Mock;
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                or: jest.fn().mockReturnThis(),
                is: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: mockMessages, error: null }),
            });

            const result = await getMessages(TEST_USER_ID, OTHER_USER_ID);
            expect(result).toHaveLength(1);
            expect(result[0].content).toBe('Hello');
        });
    });

    describe('sendMessage', () => {
        it('should send a message', async () => {
            const mockNewMessage = {
                id: 'msg-new',
                sender_id: TEST_USER_ID,
                receiver_id: OTHER_USER_ID,
                content: 'New message',
                is_read: false,
                created_at: '2024-01-01T00:00:00Z',
            };

            const mockFrom = supabase.from as jest.Mock;
            mockFrom.mockReturnValue({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockNewMessage, error: null }),
            });

            const result = await sendMessage(TEST_USER_ID, OTHER_USER_ID, 'New message');
            expect(result.content).toBe('New message');
            expect(result.senderId).toBe(TEST_USER_ID);
        });

        it('should throw for empty content', async () => {
            await expect(sendMessage(TEST_USER_ID, OTHER_USER_ID, '')).rejects.toThrow(
                'Message cannot be empty'
            );
        });
    });

    describe('getUnreadCount', () => {
        it('should return unread message count', async () => {
            const mockFrom = supabase.from as jest.Mock;
            const mockEq = jest.fn().mockResolvedValue({ count: 5, error: null });
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn(() => ({ eq: mockEq })),
            });

            const result = await getUnreadCount(TEST_USER_ID);
            expect(result).toBe(5);
        });
    });

    describe('subscribeToMessages', () => {
        it('should create a realtime subscription', () => {
            const mockChannel = supabase.channel as jest.Mock;
            const onNewMessage = jest.fn();

            const unsubscribe = subscribeToMessages(TEST_USER_ID, onNewMessage);

            expect(mockChannel).toHaveBeenCalledWith(`messages:${TEST_USER_ID}`);
            expect(typeof unsubscribe).toBe('function');

            unsubscribe();
        });
    });
});
