/**
 * Three™ - Root Index
 *
 * Handles initial routing based on Supabase auth and onboarding state.
 * Shows loading screen on every app launch.
 */

import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { hasCompletedOnboarding, hasLaunchedBefore, markFirstLaunch } from '@/store/onboarding';
import { isProfileComplete } from '@/store/profile';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const FIRST_LAUNCH_LOADING_TIME = 2500; // 2.5s branded experience
const RETURNING_LOADING_TIME = 800;     // 0.8s fast return

export default function Index() {
  const { isSignedIn, isLoaded: authLoaded, userId } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [checksComplete, setChecksComplete] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      if (!authLoaded) return;

      const startTime = Date.now();

      // Fast launch for returning users
      const isReturning = await hasLaunchedBefore();
      const loadingTime = isReturning ? RETURNING_LOADING_TIME : FIRST_LAUNCH_LOADING_TIME;
      if (!isReturning) await markFirstLaunch();

      try {
        if (isSignedIn && userId) {
          // Check onboarding state
          const completed = await hasCompletedOnboarding();
          setShouldShowOnboarding(!completed);

          // Check if profile setup is complete
          if (completed) {
            const profileComplete = await isProfileComplete(userId);
            setNeedsProfileSetup(!profileComplete);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding state:', error);
      }

      setChecksComplete(true);

      // Ensure minimum loading time for branding
      const elapsed = Date.now() - startTime;
      const remaining = loadingTime - elapsed;

      if (remaining > 0) {
        setTimeout(() => setIsLoading(false), remaining);
      } else {
        setIsLoading(false);
      }
    }

    checkOnboarding();
  }, [authLoaded, isSignedIn, userId]);

  // Show loading while auth is loading or checks are in progress
  if (!authLoaded || isLoading || !checksComplete) {
    return <LoadingScreen />;
  }

  // Not signed in - go to login
  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  // Need onboarding
  if (shouldShowOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  // If profile setup is incomplete, redirect to profile setup
  if (needsProfileSetup) {
    return <Redirect href="/(auth)/profile-setup" />;
  }

  // All good - go to main app
  return <Redirect href="/(tabs)" />;
}
