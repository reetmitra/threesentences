/**
 * Three™ - Auth Store
 *
 * Clerk-based authentication utilities.
 * The main auth logic is handled by Clerk hooks (useAuth, useUser, useSignIn, useSignUp).
 * This file provides helper utilities for compatibility with existing code.
 */

export interface User {
    id: string;
    email: string;
    name?: string;
    imageUrl?: string;
}

export interface AuthSession {
    user: User;
}

/**
 * Note: With Clerk, authentication is handled via React hooks.
 * These functions are kept for backward compatibility with profile/store logic.
 * 
 * In components, use:
 * - useAuth() for isSignedIn, userId, signOut
 * - useUser() for user details
 * - useSignIn() for sign in flow
 * - useSignUp() for sign up flow
 */

// Current user is now managed by Clerk hooks
// This is kept for compatibility but should be avoided
let cachedUser: User | null = null;

/**
 * Set the current user (called after Clerk auth)
 */
export function setCurrentUser(user: User | null): void {
    cachedUser = user;
}

/**
 * Get the current authenticated user
 * @deprecated Use useUser() hook from @clerk/clerk-expo instead
 */
export function getCurrentUser(): User | null {
    return cachedUser;
}

/**
 * Check for existing session
 * @deprecated Use useAuth().isSignedIn from @clerk/clerk-expo instead
 */
export async function getSession(): Promise<AuthSession | null> {
    if (cachedUser) {
        return { user: cachedUser };
    }
    return null;
}

/**
 * Check if Apple Sign In is available
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
    // Clerk handles OAuth availability internally
    return true;
}
