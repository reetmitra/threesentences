/**
 * ThreeSixtyThree™ Three Sentences - Onboarding Layout
 */

import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function OnboardingLayout() {
  const activeColors = colors.dark;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: activeColors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
