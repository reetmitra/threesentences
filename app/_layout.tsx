/**
 * Three™ - Root Layout
 */

import React, { useEffect } from 'react';
import { LogBox, Platform, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  SchibstedGrotesk_400Regular,
  SchibstedGrotesk_600SemiBold,
  SchibstedGrotesk_700Bold,
} from '@expo-google-fonts/schibsted-grotesk';
import {
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_600SemiBold_Italic,
} from '@expo-google-fonts/newsreader';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';
import { colors } from '@/theme/colors';
import { ToastProvider } from '@/contexts/ToastContext';
import { configureNotificationHandler } from '@/services/notifications';
import { AuthLinkHandler } from '@/components/AuthLinkHandler';

// Hermes has no WebCrypto, so supabase-js uses PKCE's 'plain' challenge on
// "Forgot password?". Still device-bound: the verifier is known only to this
// phone and Supabase (sent over TLS), never in the email or the link.
LogBox.ignoreLogs(['WebCrypto API is not supported']);

export default function RootLayout() {
  const activeColors = colors.dark;

  const [fontsLoaded] = useFonts({
    SchibstedGrotesk_400Regular,
    SchibstedGrotesk_600SemiBold,
    SchibstedGrotesk_700Bold,
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_600SemiBold_Italic,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  useEffect(() => {
    configureNotificationHandler();
    // Password-recovery links are routed by AuthLinkHandler (PKCE code exchange).
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <StatusBar style="light" />
        {/* On web, phone-shaped screens get a centered column instead of
            stretching edge-to-edge on desktop windows. */}
        <View style={[styles.webFrame, { backgroundColor: activeColors.background }]}>
          <View style={styles.webColumn}>
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
          </View>
        </View>
        <AuthLinkHandler />
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webFrame: {
    flex: 1,
  },
  webColumn: {
    flex: 1,
    ...(Platform.OS === 'web'
      ? { width: '100%', maxWidth: 560, alignSelf: 'center' as const }
      : null),
  },
});
