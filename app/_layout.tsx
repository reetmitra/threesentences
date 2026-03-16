/**
 * Three™ - Root Layout
 *
 * Dark-only mode with Clerk authentication provider.
 */

import React, { useEffect } from 'react';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { tokenCache } from '@/config/clerk';
import { setSupabaseToken } from '@/config/supabase';
import { ToastProvider } from '@/contexts/ToastContext';
import { configureNotificationHandler } from '@/services/notifications';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env.local file.'
  );
}

/**
 * Syncs Clerk JWT to Supabase so RLS-authenticated queries work.
 */
function SupabaseSync({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      setSupabaseToken(null);
      return;
    }

    const sync = async () => {
      try {
        // Try Supabase JWT template first, fall back to default session token
        let token = await getToken({ template: 'supabase' });
        if (!token) {
          token = await getToken();
        }
        setSupabaseToken(token);
      } catch {
        // Template may not exist — use default session token
        try {
          const token = await getToken();
          setSupabaseToken(token);
        } catch {
          setSupabaseToken(null);
        }
      }
    };

    sync();
    // Re-sync every 50s to keep token fresh (Clerk tokens expire ~60s)
    const interval = setInterval(sync, 50_000);
    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  return <>{children}</>;
}

export default function RootLayout() {
  const activeColors = colors.dark;

  useEffect(() => {
    configureNotificationHandler();
  }, []);

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <SupabaseSync>
          <SafeAreaProvider>
            <ToastProvider>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: activeColors.background },
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
                <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
                <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              </Stack>
            </ToastProvider>
          </SafeAreaProvider>
        </SupabaseSync>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
