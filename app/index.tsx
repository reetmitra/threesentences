/**
 * ThreeSixtyThree™ Three Sentences - Root Index
 * 
 * Handles initial routing based on onboarding state.
 */

import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { Redirect } from 'expo-router';
import { hasCompletedOnboarding } from '@/store/onboarding';
import { colors } from '@/theme/colors';

export default function Index() {
  const scheme = useColorScheme() ?? 'dark';
  const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];

  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const completed = await hasCompletedOnboarding();
        setShouldShowOnboarding(!completed);
      } catch (error) {
        console.error('Error checking onboarding state:', error);
        // Default to showing onboarding if there's an error
        setShouldShowOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboarding();
  }, []);

  // Show loading spinner while checking onboarding state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: activeColors.background }]}>
        <ActivityIndicator size="large" color={activeColors.accent} />
      </View>
    );
  }

  // Redirect based on onboarding state
  if (shouldShowOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
