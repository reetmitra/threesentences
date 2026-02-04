/**
 * Tests for Friends Store
 *
 * Tests friend management functions including
 * friend requests, accepting/rejecting, and search.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getFriends,
    getFriendById,
    getFriendRequests,
    getPendingRequests,
    getSentRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers,
    getFriendshipStatus,
    getSocialStats,
    clearFriendsData,
} from '@/store/friends';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('friends store', () => {
    const currentUserId = 'current-user';
    const currentUser = {
        id: currentUserId,
        name: 'Current User',
        username: 'currentuser',
    };
    const otherUser = {
        id: 'other-user',
        name: 'Other User',
        username: 'otheruser',
    };

    const mockFriend = {
        id: 'friend-1',
        friendId: 'other-user',
        userId: currentUserId,
        name: 'Friend One',
        username: 'friendone',
        addedAt: '2024-01-01T00:00:00.000Z',
    };

    const mockRequest = {
        id: 'request-1',
        fromUserId: 'other-user',
        fromUser: otherUser,
        toUserId: currentUserId,
        toUser: currentUser,
        status: 'pending' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getFriends', () => {
        it('returns empty array when no friends exist', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const friends = await getFriends();

            expect(friends).toEqual([]);
        });

        it('returns friends from storage', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockFriend]));

            const friends = await getFriends();

            expect(friends).toEqual([mockFriend]);
        });

        it('returns empty array on parse error', async () => {
            mockAsyncStorage.getItem.mockResolvedValue('invalid json');

            const friends = await getFriends();

            expect(friends).toEqual([]);
        });
    });

    describe('getFriendById', () => {
        it('returns friend when found', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockFriend]));

            const friend = await getFriendById('friend-1');

            expect(friend).toEqual(mockFriend);
        });

        it('returns null when friend not found', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockFriend]));

            const friend = await getFriendById('nonexistent');

            expect(friend).toBeNull();
        });
    });

    describe('getFriendRequests', () => {
        it('returns empty array when no requests exist', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const requests = await getFriendRequests();

            expect(requests).toEqual([]);
        });

        it('returns requests from storage', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockRequest]));

            const requests = await getFriendRequests();

            expect(requests).toEqual([mockRequest]);
        });
    });

    describe('getPendingRequests', () => {
        it('filters requests to only pending ones for current user', async () => {
            const requests = [
                mockRequest,
                { ...mockRequest, id: 'request-2', status: 'accepted' as const },
                { ...mockRequest, id: 'request-3', toUserId: 'someone-else' },
            ];
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(requests));

            const pending = await getPendingRequests(currentUserId);

            expect(pending).toHaveLength(1);
            expect(pending[0].id).toBe('request-1');
        });
    });

    describe('getSentRequests', () => {
        it('filters requests to only sent ones from current user', async () => {
            const sentRequest = {
                ...mockRequest,
                id: 'sent-1',
                fromUserId: currentUserId,
                toUserId: 'other-user',
            };
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockRequest, sentRequest]));

            const sent = await getSentRequests(currentUserId);

            expect(sent).toHaveLength(1);
            expect(sent[0].id).toBe('sent-1');
        });
    });

    describe('sendFriendRequest', () => {
        beforeEach(() => {
            mockAsyncStorage.getItem.mockResolvedValue(null);
            mockAsyncStorage.setItem.mockResolvedValue(undefined);
        });

        it('creates a new friend request', async () => {
            const request = await sendFriendRequest(currentUser, otherUser);

            expect(request.fromUserId).toBe(currentUserId);
            expect(request.toUserId).toBe(otherUser.id);
            expect(request.status).toBe('pending');
        });

        it('saves request to storage', async () => {
            await sendFriendRequest(currentUser, otherUser);

            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                '@threesentences/friend_requests',
                expect.any(String)
            );
        });

        it('throws error when request already exists', async () => {
            const existingRequest = {
                ...mockRequest,
                fromUserId: currentUserId,
                toUserId: otherUser.id,
            };
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([existingRequest]));

            await expect(
                sendFriendRequest(currentUser, otherUser)
            ).rejects.toThrow(/already pending/i);
        });
    });

    describe('acceptFriendRequest', () => {
        beforeEach(() => {
            mockAsyncStorage.getItem.mockImplementation((key) => {
                if (key === '@threesentences/friend_requests') {
                    return Promise.resolve(JSON.stringify([mockRequest]));
                }
                return Promise.resolve(null);
            });
            mockAsyncStorage.setItem.mockResolvedValue(undefined);
        });

        it('updates request status to accepted', async () => {
            await acceptFriendRequest('request-1', currentUserId);

            const setItemCalls = mockAsyncStorage.setItem.mock.calls;
            const requestsCall = setItemCalls.find(
                (call) => call[0] === '@threesentences/friend_requests'
            );
            expect(requestsCall).toBeTruthy();
            const savedRequests = JSON.parse(requestsCall![1]);
            expect(savedRequests[0].status).toBe('accepted');
        });

        it('adds both users as friends', async () => {
            await acceptFriendRequest('request-1', currentUserId);

            const setItemCalls = mockAsyncStorage.setItem.mock.calls;
            const friendsCall = setItemCalls.find(
                (call) => call[0] === '@threesentences/friends'
            );
            expect(friendsCall).toBeTruthy();
        });

        it('throws error when request not found', async () => {
            await expect(
                acceptFriendRequest('nonexistent', currentUserId)
            ).rejects.toThrow(/not found/i);
        });
    });

    describe('rejectFriendRequest', () => {
        beforeEach(() => {
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockRequest]));
            mockAsyncStorage.setItem.mockResolvedValue(undefined);
        });

        it('updates request status to rejected', async () => {
            await rejectFriendRequest('request-1', currentUserId);

            const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
            const savedRequests = JSON.parse(setItemCall[1]);
            expect(savedRequests[0].status).toBe('rejected');
        });

        it('throws error when request not found', async () => {
            await expect(
                rejectFriendRequest('nonexistent', currentUserId)
            ).rejects.toThrow(/not found/i);
        });
    });

    describe('removeFriend', () => {
        beforeEach(() => {
            mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockFriend]));
            mockAsyncStorage.setItem.mockResolvedValue(undefined);
        });

        it('removes friend from list', async () => {
            await removeFriend('friend-1');

            const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
            const savedFriends = JSON.parse(setItemCall[1]);
            expect(savedFriends).toHaveLength(0);
        });
    });

    describe('searchUsers', () => {
        it('returns matching demo users', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const results = await searchUsers('alex', currentUserId);

            expect(results.length).toBeGreaterThan(0);
            expect(results[0].user.username.toLowerCase()).toContain('alex');
        });

        it('returns empty array for empty query', async () => {
            const results = await searchUsers('', currentUserId);

            expect(results).toEqual([]);
        });

        it('excludes current user from results', async () => {
            mockAsyncStorage.getItem.mockResolvedValue(null);

            const results = await searchUsers('user', 'demo-1');

            const hasCurrentUser = results.some((r) => r.user.id === 'demo-1');
            expect(hasCurrentUser).toBe(false);
        });
    });

    describe('getSocialStats', () => {
        it('returns correct counts', async () => {
            mockAsyncStorage.getItem.mockImplementation((key) => {
                if (key === '@threesentences/friends') {
                    return Promise.resolve(JSON.stringify([mockFriend, mockFriend]));
                }
                if (key === '@threesentences/friend_requests') {
                    return Promise.resolve(JSON.stringify([mockRequest]));
                }
                return Promise.resolve(null);
            });

            const stats = await getSocialStats(currentUserId);

            expect(stats.friendsCount).toBe(2);
            expect(stats.pendingRequestsCount).toBe(1);
        });
    });

    describe('clearFriendsData', () => {
        it('removes all social data from storage', async () => {
            mockAsyncStorage.multiRemove.mockResolvedValue(undefined);

            await clearFriendsData();

            expect(mockAsyncStorage.multiRemove).toHaveBeenCalled();
        });
    });
});
