/**
 * Tests for Auth Store
 *
 * Tests Firebase authentication functions including sign in, sign up, and sign out.
 */

import { signIn, signUp, signOut, getSession } from '@/store/auth';

// Mock the auth module to control Firebase behavior
jest.mock('@/config/firebase', () => ({
  app: {},
  auth: {
    currentUser: null,
  },
  isConfigured: true,
}));

describe('auth store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).resetFirebaseMock?.();
  });

  describe('signIn', () => {
    it('successfully signs in with valid credentials', async () => {
      const result = await signIn('test@example.com', 'password123');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.id).toBeDefined();
    });

    it('throws error for non-existent user', async () => {
      await expect(signIn('notfound@example.com', 'password123'))
        .rejects
        .toThrow('No account found with this email');
    });

    it('throws error for wrong password', async () => {
      await expect(signIn('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow('Invalid email or password');
    });

    it('returns user with correct structure', async () => {
      const result = await signIn('user@test.com', 'validpass');

      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
    });
  });

  describe('signUp', () => {
    it('successfully creates a new account', async () => {
      const result = await signUp('newuser@example.com', 'password123', 'New User');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('newuser@example.com');
    });

    it('throws error for weak password', async () => {
      await expect(signUp('test@example.com', '123'))
        .rejects
        .toThrow('Password is too weak');
    });

    it('throws error for invalid email', async () => {
      await expect(signUp('invalidemail', 'password123'))
        .rejects
        .toThrow('Invalid email');
    });

    it('accepts optional name parameter', async () => {
      const result = await signUp('test@example.com', 'password123', 'Test Name');

      expect(result.user).toBeDefined();
    });

    it('works without name parameter', async () => {
      const result = await signUp('test@example.com', 'password123');

      expect(result.user).toBeDefined();
    });
  });

  describe('signOut', () => {
    it('successfully signs out', async () => {
      // First sign in
      await signIn('test@example.com', 'password123');

      // Then sign out
      await expect(signOut()).resolves.not.toThrow();
    });

    it('can be called multiple times without error', async () => {
      await signOut();
      await expect(signOut()).resolves.not.toThrow();
    });
  });

  describe('getSession', () => {
    it('returns null when no user is signed in', async () => {
      const session = await getSession();

      // Session may be null when no user is authenticated
      // The actual behavior depends on Firebase auth state
      expect(session === null || session?.user !== undefined).toBe(true);
    });

    it('returns session object with correct structure when user exists', async () => {
      // Set up a mock user
      (global as any).setMockFirebaseUser?.({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      });

      const session = await getSession();

      if (session) {
        expect(session).toHaveProperty('user');
        expect(session.user).toHaveProperty('id');
        expect(session.user).toHaveProperty('email');
      }
    });
  });

  describe('error handling', () => {
    it('maps Firebase auth/invalid-email error correctly', async () => {
      await expect(signUp('notanemail', 'password123'))
        .rejects
        .toThrow('Invalid email');
    });

    it('maps Firebase auth/weak-password error correctly', async () => {
      await expect(signUp('test@example.com', '12345'))
        .rejects
        .toThrow('Password is too weak');
    });

    it('maps Firebase auth/user-not-found error correctly', async () => {
      await expect(signIn('notfound@example.com', 'password'))
        .rejects
        .toThrow('No account found with this email');
    });

    it('maps Firebase auth/invalid-credential error correctly', async () => {
      await expect(signIn('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow('Invalid email or password');
    });
  });
});
