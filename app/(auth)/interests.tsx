/**
 * Three™ - Interest Selection Screen
 *
 * Allows users to select their elite interests during signup.
 * Features grouped categories with staggered entrance animations.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  interpolate,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import {
  INTEREST_CATEGORIES,
  INTEREST_GROUPS,
  InterestId,
  InterestCategoryGroup,
  PROFILE_CONSTRAINTS,
} from '@/types/profile';
import { saveInterests, createProfile } from '@/store/profile';

const MIN_INTERESTS = PROFILE_CONSTRAINTS.interests.minCount;

export default function InterestsScreen() {
  const activeColors = colors.dark;
  const params = useLocalSearchParams<{ name?: string }>();
  const { user } = useUser();

  const [selectedInterests, setSelectedInterests] = useState<InterestId[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<InterestCategoryGroup>>(
    new Set(['fitness', 'wellness']) // Start with first two expanded
  );

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
      if (user?.id) {
        const userName = params.name || user.firstName || undefined;
        await createProfile(user.id, userName);
      }
    };
    initProfile();
  }, [headerOpacity, headerTranslateY, buttonOpacity, params.name, user]);

  // Update progress bar based on selections
  useEffect(() => {
    const progress = Math.min(selectedInterests.length / MIN_INTERESTS, 1);
    progressWidth.value = withSpring(progress, { damping: 15 });
  }, [selectedInterests, progressWidth]);

  const handleToggleInterest = useCallback((id: InterestId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= PROFILE_CONSTRAINTS.interests.maxCount) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const handleToggleGroup = useCallback((group: InterestCategoryGroup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }, []);

  const handleContinue = async () => {
    if (selectedInterests.length < MIN_INTERESTS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setLoading(true);
      if (user?.id) {
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

  // Get interests for a specific group
  const getInterestsForGroup = (group: InterestCategoryGroup) => {
    return INTEREST_CATEGORIES.filter((i) => i.group === group);
  };

  // Count selected in a group
  const getSelectedCountForGroup = (group: InterestCategoryGroup) => {
    return selectedInterests.filter((id) =>
      INTEREST_CATEGORIES.find((i) => i.id === id)?.group === group
    ).length;
  };

  const isEnoughSelected = selectedInterests.length >= MIN_INTERESTS;

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
            What defines you?
          </Text>
          <Text variant="base" color="secondary" style={styles.subtitle}>
            Select interests that reflect your lifestyle. This helps connect you with
            like-minded individuals.
          </Text>
        </Animated.View>

        {/* Selection Counter */}
        <Animated.View
          entering={FadeIn.delay(300).duration(300)}
          style={styles.counterContainer}
        >
          <Text variant="sm" color="secondary">
            {selectedInterests.length} of {MIN_INTERESTS}+ selected
          </Text>
          {isEnoughSelected && (
            <Text variant="sm" style={{ color: activeColors.accent }}>
              {' '}
              Ready to continue
            </Text>
          )}
        </Animated.View>

        {/* Interest Groups */}
        {(Object.keys(INTEREST_GROUPS) as InterestCategoryGroup[]).map(
          (groupKey, groupIndex) => {
            const group = INTEREST_GROUPS[groupKey];
            const interests = getInterestsForGroup(groupKey);
            const isExpanded = expandedGroups.has(groupKey);
            const selectedCount = getSelectedCountForGroup(groupKey);

            return (
              <Animated.View
                key={groupKey}
                entering={FadeInDown.delay(200 + groupIndex * 100).duration(400)}
                style={styles.groupContainer}
              >
                {/* Group Header */}
                <Pressable
                  onPress={() => handleToggleGroup(groupKey)}
                  style={[styles.groupHeader, { borderColor: activeColors.border }]}
                >
                  <View style={styles.groupHeaderLeft}>
                    <Feather
                      name={group.icon as any}
                      size={18}
                      color={activeColors.textSecondary}
                    />
                    <Text variant="base" weight="semibold" style={styles.groupTitle}>
                      {group.label}
                    </Text>
                    {selectedCount > 0 && (
                      <View
                        style={[
                          styles.selectedBadge,
                          { backgroundColor: activeColors.accent },
                        ]}
                      >
                        <Text variant="xs" weight="semibold" style={{ color: '#000' }}>
                          {selectedCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={activeColors.textSecondary}
                  />
                </Pressable>

                {/* Group Interests */}
                {isExpanded && (
                  <View style={styles.interestsGrid}>
                    {interests.map((interest) => {
                      const isSelected = selectedInterests.includes(interest.id);
                      return (
                        <Pressable
                          key={interest.id}
                          onPress={() => handleToggleInterest(interest.id)}
                          style={[
                            styles.interestChip,
                            {
                              backgroundColor: isSelected
                                ? activeColors.accent
                                : activeColors.surface,
                              borderColor: isSelected
                                ? activeColors.accent
                                : activeColors.border,
                            },
                          ]}
                        >
                          <Text
                            variant="sm"
                            weight={isSelected ? 'semibold' : 'regular'}
                            style={{
                              color: isSelected ? '#000' : activeColors.textPrimary,
                            }}
                          >
                            {interest.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </Animated.View>
            );
          }
        )}
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
          title={
            selectedInterests.length < MIN_INTERESTS
              ? `Select at least ${MIN_INTERESTS}`
              : 'Continue'
          }
          onPress={handleContinue}
          disabled={selectedInterests.length < MIN_INTERESTS}
          loading={loading}
          style={styles.continueButton}
        />
        <Text variant="xs" color="tertiary" centered style={styles.hint}>
          You can always update these later
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
  groupContainer: {
    marginBottom: spacing[3],
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupTitle: {
    marginLeft: spacing[3],
  },
  selectedBadge: {
    marginLeft: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: spacing[3],
    gap: spacing[2],
  },
  interestChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1,
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
