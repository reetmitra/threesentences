/**
 * Three™ - Friends Store Tests
 *
 * Tests for Supabase-based friend management.
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
            neq: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
            limit: jest.fn().mockReturnThis(),
            not: jest.fn().mockReturnThis(),
        })),
    },
}));

import { supabase } from '@/config/supabase';
import {
    getFriends,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    searchUsers,
    getFriendshipStatus,
    getSocialStats,
} from '@/store/friends';

const TEST_USER_ID = 'user_test123';
const OTHER_USER_ID = 'user_other456';

describe('Friends Store', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getFriends', () => {
        it('should return empty array when no friends exist', async () => {
            const mockFrom = supabase.from as jest.Mock;
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                or: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            });

            const result = await getFriends(TEST_USER_ID);
            expect(result).toEqual([]);
        });

        it('should return friends with profile info', async () => {
            const mockFriendship = {
                id: 'friendship-1',
                user_id: TEST_USER_ID,
                friend_id: OTHER_USER_ID,
                status: 'accepted',
                created_at: '2024-01-01T00:00:00Z',
            };
            const mockProfile = {
                user_id: OTHER_USER_ID,
                name: 'Test Friend',
                username: 'testfriend',
                profile_image: null,
                interests: [],
            };

            const mockFrom = supabase.from as jest.Mock;
            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    or: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({ data: [mockFriendship], error: null }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    in: jest.fn().mockResolvedValue({ data: [mockProfile], error: null }),
                });

            const result = await getFriends(TEST_USER_ID);
            expect(result).toHaveLength(1);
            expect(result[0].friendUser.name).toBe('Test Friend');
        });
    });

    describe('sendFriendRequest', () => {
        it('should create a new friend request', async () => {
            const mockNewRequest = {
                id: 'request-1',
                user_id: TEST_USER_ID,
                friend_id: OTHER_USER_ID,
                status: 'pending',
                created_at: '2024-01-01T00:00:00Z',
            };

            const mockFrom = supabase.from as jest.Mock;
            mockFrom
                // Check existing
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    or: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
                })
                // Insert
                .mockReturnValueOnce({
                    insert: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({ data: mockNewRequest, error: null }),
                })
                // Get profiles
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    in: jest.fn().mockResolvedValue({ data: [], error: null }),
                });

            const result = await sendFriendRequest(TEST_USER_ID, OTHER_USER_ID);
            expect(result.fromUserId).toBe(TEST_USER_ID);
            expect(result.toUserId).toBe(OTHER_USER_ID);
            expect(result.status).toBe('pending');
        });

        it('should throw if request already pending', async () => {
            const mockFrom = supabase.from as jest.Mock;
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                or: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { status: 'pending' },
                    error: null,
                }),
            });

            await expect(sendFriendRequest(TEST_USER_ID, OTHER_USER_ID)).rejects.toThrow(
                'Friend request already pending'
            );
        });
    });

    describe('getFriendshipStatus', () => {
        it('should return "none" when no relationship exists', async () => {
            const mockFrom = supabase.from as jest.Mock;
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                or: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            });

            const result = await getFriendshipStatus(TEST_USER_ID, OTHER_USER_ID);
            expect(result).toBe('none');
        });

        it('should return "friends" for accepted relationship', async () => {
            const mockFrom = supabase.from as jest.Mock;
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                or: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: TEST_USER_ID, friend_id: OTHER_USER_ID, status: 'accepted' },
                    error: null,
                }),
            });

            const result = await getFriendshipStatus(TEST_USER_ID, OTHER_USER_ID);
            expect(result).toBe('friends');
        });

        it('should return "pending_sent" for outgoing request', async () => {
            const mockFrom = supabase.from as jest.Mock;
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                or: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: TEST_USER_ID, friend_id: OTHER_USER_ID, status: 'pending' },
                    error: null,
                }),
            });

            const result = await getFriendshipStatus(TEST_USER_ID, OTHER_USER_ID);
            expect(result).toBe('pending_sent');
        });
    });

    describe('searchUsers', () => {
        it('should return empty array for empty query', async () => {
            const result = await searchUsers('', TEST_USER_ID);
            expect(result).toEqual([]);
        });

        it('should search profiles by name/username', async () => {
            const mockProfile = {
                user_id: OTHER_USER_ID,
                name: 'Test User',
                username: 'testuser',
                profile_image: null,
                interests: [],
            };

            const mockFrom = supabase.from as jest.Mock;
            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    neq: jest.fn().mockReturnThis(),
                    or: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue({ data: [mockProfile], error: null }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnThis(),
                    or: jest.fn().mockResolvedValue({ data: [], error: null }),
                });

            const result = await searchUsers('test', TEST_USER_ID);
            expect(result).toHaveLength(1);
            expect(result[0].user.username).toBe('testuser');
        });
    });
});
