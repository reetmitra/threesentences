/**
 * ThreeSixtyThree™ Three Sentences - Root Index
 *
 * Handles initial routing based on auth and onboarding state.
 * Shows loading screen on every app launch.
 */

import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { hasCompletedOnboarding } from '@/store/onboarding';
import { getSession } from '@/store/auth';
import { isProfileComplete } from '@/store/profile';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const MINIMUM_LOADING_TIME = 7000; // 7 seconds

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  useEffect(() => {
    async function checkAuthAndOnboarding() {
      const startTime = Date.now();

      try {
        // Check authentication first
        const session = await getSession();

        if (!session) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
          // Check onboarding state
          const completed = await hasCompletedOnboarding();
          setShouldShowOnboarding(!completed);

          // Check if profile setup is complete
          if (completed) {
            const profileComplete = await isProfileComplete(session.user.id);
            setNeedsProfileSetup(!profileComplete);
          }
        }
      } catch (error) {
        console.error('Error checking auth/onboarding state:', error);
        setIsAuthenticated(false);
      }

      // Ensure minimum loading time for branding
      const elapsed = Date.now() - startTime;
      const remaining = MINIMUM_LOADING_TIME - elapsed;

      if (remaining > 0) {
        setTimeout(() => setIsLoading(false), remaining);
      } else {
        setIsLoading(false);
      }
    }

    checkAuthAndOnboarding();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (shouldShowOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  // If profile setup is incomplete, redirect to interests selection
  if (needsProfileSetup) {
    return <Redirect href="/(auth)/interests" />;
  }

  return <Redirect href="/(tabs)" />;
}
