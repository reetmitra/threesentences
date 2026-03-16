/**
 * Three™ - Supabase Client Configuration
 *
 * Initializes the Supabase client for database and real-time operations.
 * Integrates with Clerk JWT for authenticated RLS queries.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env.local'
    );
}

// Store the current JWT token for Clerk integration
let currentToken: string | null = null;
let cachedAuthClient: SupabaseClient | null = null;

/**
 * Base Supabase client (unauthenticated, used for Realtime subscriptions)
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

/**
 * Set the Clerk JWT token for Supabase RLS.
 * Invalidates the cached authenticated client so the next call
 * to getAuthenticatedSupabase() picks up the new token.
 */
export function setSupabaseToken(token: string | null) {
    if (token !== currentToken) {
        currentToken = token;
        cachedAuthClient = null; // Force recreation on next access
    }
}

/**
 * Get a Supabase client with the current Clerk auth token.
 * Caches the client and only recreates when the token changes.
 * Falls back to the base (anon) client when no token is set.
 */
export function getAuthenticatedSupabase(): SupabaseClient {
    if (!currentToken) {
        return supabase;
    }

    if (!cachedAuthClient) {
        cachedAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
            },
            global: {
                headers: {
                    Authorization: `Bearer ${currentToken}`,
                },
            },
        });
    }

    return cachedAuthClient;
}

export default supabase;
