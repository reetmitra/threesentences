/**
 * Handles Supabase auth links that open the app (password-reset emails).
 * The client runs with detectSessionInUrl: false, so the one-time code in the
 * link is exchanged here (PKCE: it only works on the phone that asked), and a
 * recovery opens the new-password screen. Renders nothing.
 */

import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { router, useRootNavigationState } from 'expo-router';
import { supabase } from '@/config/supabase';
import { useToast } from '@/contexts/ToastContext';
import { LINK_FAILED, parseAuthLink } from '@/utils/authLinks';

export function AuthLinkHandler() {
  const url = Linking.useURL();
  const navReady = !!useRootNavigationState()?.key;
  const { showToast } = useToast();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!url || !navReady || handled.current === url) return;
    const link = parseAuthLink(url);
    if (!link) return;
    handled.current = url;

    if (link.kind === 'error') {
      showToast('error', link.message, 5000);
      return;
    }
    supabase.auth
      .exchangeCodeForSession(link.code)
      .then(({ data, error }) => {
        if (error) throw error;
        // auth-js returns redirectType at runtime but its public type omits it.
        if ('redirectType' in data && data.redirectType === 'PASSWORD_RECOVERY') {
          router.replace('/(auth)/reset-password');
        }
      })
      .catch(() => showToast('error', LINK_FAILED, 6000));
  }, [url, navReady, showToast]);

  return null;
}
