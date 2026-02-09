/**
 * Tests for Auth Store
 *
 * Tests Clerk-based authentication utilities.
 * Note: Most auth is now handled by Clerk React hooks.
 * This file tests the backward compatibility functions.
 */

import { getCurrentUser, setCurrentUser, getSession } from '@/store/auth';

describe('auth store', () => {
  beforeEach(() => {
    // Reset cached user before each test
    setCurrentUser(null);
  });

  describe('getCurrentUser', () => {
    it('returns null when no user is set', () => {
      const user = getCurrentUser();
      expect(user).toBeNull();
    });

    it('returns the cached user when set', () => {
      const mockUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      setCurrentUser(mockUser);
      const user = getCurrentUser();

      expect(user).toEqual(mockUser);
    });
  });

  describe('setCurrentUser', () => {
    it('sets the current user', () => {
      const mockUser = {
        id: 'user-456',
        email: 'user@test.com',
        name: 'Another User',
      };

      setCurrentUser(mockUser);
      expect(getCurrentUser()).toEqual(mockUser);
    });

    it('can clear the current user by setting null', () => {
      setCurrentUser({
        id: 'user-123',
        email: 'test@example.com',
      });

      setCurrentUser(null);
      expect(getCurrentUser()).toBeNull();
    });
  });

  describe('getSession', () => {
    it('returns null when no user is cached', async () => {
      const session = await getSession();
      expect(session).toBeNull();
    });

    it('returns session with user when user is cached', async () => {
      const mockUser = {
        id: 'session-user-123',
        email: 'session@example.com',
        name: 'Session User',
      };

      setCurrentUser(mockUser);
      const session = await getSession();

      expect(session).not.toBeNull();
      expect(session?.user).toEqual(mockUser);
    });
  });

  describe('backward compatibility', () => {
    it('User type has correct shape', () => {
      const user = {
        id: 'test-id',
        email: 'test@test.com',
        name: 'Test',
        imageUrl: 'https://example.com/image.jpg',
      };

      setCurrentUser(user);
      const result = getCurrentUser();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('imageUrl');
    });
  });
});
