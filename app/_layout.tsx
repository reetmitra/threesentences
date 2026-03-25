/**
 * Three™ - Root Layout
 */

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { ToastProvider } from '@/contexts/ToastContext';
import { configureNotificationHandler } from '@/services/notifications';

export default function RootLayout() {
  const activeColors = colors.dark;

  useEffect(() => {
    configureNotificationHandler();
  }, []);

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
