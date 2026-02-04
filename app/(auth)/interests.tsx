/**
 * ThreeSixtyThree™ Three Sentences - Interest Selection Screen
 *
 * Allows users to select their interest categories during signup.
 * Features staggered entrance animations and smooth interactions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  interpolate,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { CategoryChip } from '@/components/CategoryChip';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { INTEREST_CATEGORIES, CategoryId } from '@/types/profile';
import { saveInterests, createProfile } from '@/store/profile';
import { getCurrentUser } from '@/store/auth';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function InterestsScreen() {
  const activeColors = colors.dark;
  const params = useLocalSearchParams<{ name?: string }>();

  const [selectedInterests, setSelectedInterests] = useState<CategoryId[]>([]);
  const [loading, setLoading] = useState(false);

  // Animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const buttonOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // Animate header entrance
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    headerTranslateY.value = withDelay(100, withSpring(0, { damping: 20 }));

    // Animate button entrance
    buttonOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));

    // Initialize profile if needed
    const initProfile = async () => {
      const user = getCurrentUser();
      if (user) {
        await createProfile(user.id, params.name || user.name);
      }
    };
    initProfile();
  }, [headerOpacity, headerTranslateY, buttonOpacity, params.name]);

  // Update progress bar based on selections
  useEffect(() => {
    const progress = Math.min(selectedInterests.length / 3, 1); // Full at 3 selections
    progressWidth.value = withSpring(progress, { damping: 15 });
  }, [selectedInterests, progressWidth]);

  const handleToggleInterest = useCallback((id: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id as CategoryId)) {
        return prev.filter((i) => i !== id);
      }
      return [...prev, id as CategoryId];
    });
  }, []);

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setLoading(true);
      const user = getCurrentUser();
      if (user) {
        await saveInterests(user.id, selectedInterests);
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({
        pathname: '/(auth)/profile-setup',
        params: { name: params.name },
      });
    } catch (error) {
      console.error('Failed to save interests:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressWidth.value, [0, 1], [0, 100])}%`,
  }));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
      edges={['top', 'bottom']}
    >
      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: activeColors.surface }]}>
        <Animated.View
          style={[
            styles.progressBar,
            { backgroundColor: activeColors.accent },
            progressAnimatedStyle,
          ]}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text variant="2xl" weight="bold" style={styles.title}>
            What interests you?
          </Text>
          <Text variant="base" color="secondary" style={styles.subtitle}>
            Select topics that resonate with your journey. This helps us build community around shared interests.
          </Text>
        </Animated.View>

        {/* Selection Counter */}
        <Animated.View
          entering={FadeIn.delay(300).duration(300)}
          style={styles.counterContainer}
        >
          <Text variant="sm" color="secondary">
            {selectedInterests.length} selected
          </Text>
          {selectedInterests.length >= 3 && (
            <Text variant="sm" style={{ color: activeColors.accent }}>
              {' '}Great choices!
            </Text>
          )}
        </Animated.View>

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          {INTEREST_CATEGORIES.map((category, index) => (
            <CategoryChip
              key={category.id}
              id={category.id}
              label={category.label}
              icon={category.icon}
              selected={selectedInterests.includes(category.id)}
              onPress={handleToggleInterest}
              index={index}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <Animated.View
        style={[
          styles.bottomSection,
          { borderTopColor: activeColors.border },
          buttonAnimatedStyle,
        ]}
      >
        <Button
          title={selectedInterests.length === 0 ? 'Select at least one' : 'Continue'}
          onPress={handleContinue}
          disabled={selectedInterests.length === 0}
          loading={loading}
          style={styles.continueButton}
        />
        <Text variant="xs" color="tertiary" centered style={styles.hint}>
          You can always change these later in Settings
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    height: 3,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[6],
    paddingBottom: spacing[8],
  },
  header: {
    marginBottom: spacing[4],
  },
  title: {
    marginBottom: spacing[3],
  },
  subtitle: {
    lineHeight: 24,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bottomSection: {
    padding: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
  },
  continueButton: {
    width: '100%',
  },
  hint: {
    marginTop: spacing[3],
  },
});
