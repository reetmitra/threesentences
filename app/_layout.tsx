/**
 * Three™ - Root Layout
 */

import React, { useEffect } from 'react';
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
  }, []);

  if (!fontsLoaded) return null;

  return (
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
  );
}
