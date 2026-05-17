/**
 * Three™ - Auth Store
 *
 * Supabase-based authentication utilities.
 * The main auth logic is handled by the useAuth() hook in hooks/useAuth.ts.
 * This file provides a simple user cache for compatibility with screens that
 * need to access the user ID inside async callbacks.
 *
 * @deprecated Prefer useAuth() from @/hooks/useAuth in React components.
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

let cachedUser: User | null = null;

export function setCurrentUser(user: User | null): void {
    cachedUser = user;
}

/** @deprecated Use useAuth() from @/hooks/useAuth */
export function getCurrentUser(): User | null {
    return cachedUser;
}

/** @deprecated Use useAuth().isSignedIn from @/hooks/useAuth */
export async function getSession(): Promise<AuthSession | null> {
    if (cachedUser) {
        return { user: cachedUser };
    }
    return null;
}

export async function isAppleSignInAvailable(): Promise<boolean> {
    return true;
}
