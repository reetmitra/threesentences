/**
 * Handles Supabase auth links that open the app (password-reset emails).
 * The client runs with detectSessionInUrl: false, so the one-time code in the
 * link is exchanged here (PKCE: it only redeems on the phone that asked), and
 * a recovery opens the new-password screen. expo-router itself skips these
 * links (app/+native-intent.tsx), so this is the only navigation. Renders nothing.
 */

import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { supabase } from '@/config/supabase';
import { useToast } from '@/contexts/ToastContext';
import { LINK_FAILED, parseAuthLink } from '@/utils/authLinks';

export function AuthLinkHandler() {
  const url = Linking.useURL();
  const { showToast } = useToast();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!url || handled.current === url) return;
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
        const recovery = 'redirectType' in data && data.redirectType === 'PASSWORD_RECOVERY';
        // Any other email link (sign-up confirmation) has just signed you in: '/' routes onward.
        router.replace(recovery ? '/(auth)/reset-password' : '/');
      })
      .catch(() => showToast('error', LINK_FAILED, 6000));
  }, [url, showToast]);

  return null;
}
