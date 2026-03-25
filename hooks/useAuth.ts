/**
 * Three™ - Auth Hook
 *
 * Wraps Supabase Auth to provide a consistent auth interface across the app.
 */

import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';

interface AuthUser {
    id: string;
    email: string | undefined;
    name: string | undefined;       // Full name from user_metadata
    firstName: string | undefined;  // First word of name, for display
    username: string | undefined;
}

interface AuthState {
    session: Session | null;
    user: AuthUser | null;
    userId: string | null;
    isSignedIn: boolean;
    isLoaded: boolean;
    signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoaded(true);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const user: AuthUser | null = session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name as string | undefined,
            firstName: (session.user.user_metadata?.name as string | undefined)?.split(' ')[0],
            username: session.user.user_metadata?.username as string | undefined,
        }
        : null;

    return {
        session,
        user,
        userId: session?.user?.id ?? null,
        isSignedIn: !!session,
        isLoaded,
        signOut: async () => { await supabase.auth.signOut(); },
    };
}
