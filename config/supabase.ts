/**
 * Three™ - Supabase Client Configuration
 *
 * Initializes the Supabase client for database and real-time operations.
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

/**
 * Create Supabase client
 * Using untyped client for flexibility with RLS
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // We're using Clerk for auth, so disable Supabase Auth
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

/**
 * Set the Clerk JWT token for Supabase RLS
 * Call this after user signs in with Clerk
 */
export function setSupabaseToken(token: string | null) {
    currentToken = token;
}

/**
 * Get the current JWT token
 */
export function getSupabaseToken(): string | null {
    return currentToken;
}

/**
 * Create a Supabase client with the current auth token
 * Use this for authenticated requests with RLS
 */
export function getAuthenticatedSupabase(): SupabaseClient {
    if (!currentToken) {
        return supabase;
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
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

export default supabase;
