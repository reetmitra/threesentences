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
import { useAuth } from '@/hooks/useAuth';
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
import {
  Dumbbell,
  Heart,
  UtensilsCrossed,
  Briefcase,
  Compass,
  BookOpen,
  ChevronUp,
  ChevronDown,
  LucideIcon,
} from 'lucide-react-native';
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
import { createProfile, updateProfile } from '@/store/profile';

// Map group icon names to lucide components
const GROUP_ICON_MAP: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  heart: Heart,
  utensils: UtensilsCrossed,
  briefcase: Briefcase,
  compass: Compass,
  'book-open': BookOpen,
};

const MIN_INTERESTS = PROFILE_CONSTRAINTS.interests.minCount;

export default function InterestsScreen() {
  const c = colors.dark;
  const params = useLocalSearchParams<{ name?: string }>();
  const { user } = useAuth();

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

    // Initialize profile row with name from signup metadata.
    // Use the same fallback chain as handleContinue so the row is never name=''.
    const initProfile = async () => {
      if (user?.id) {
        const userName =
          params.name ||
          user.name ||
          user.firstName ||
          user.email?.split('@')[0] ||
          'User';
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
        // Resolve display name: full metadata name → first name → email prefix → fallback
        // This guarantees name is never empty so validateProfile always passes,
        // even for accounts created before user_metadata was stored at signup.
        const resolvedName =
          user.name ||
          user.firstName ||
          user.email?.split('@')[0] ||
          'User';

        // Username fallback: metadata → email prefix (stripped to alphanumeric)
        const resolvedUsername =
          user.username ||
          user.email?.split('@')[0]?.replace(/[^a-z0-9_]/gi, '').toLowerCase() ||
          `user${user.id.slice(0, 6)}`;

        await updateProfile(user.id, {
          name: resolvedName,
          username: resolvedUsername,
          interests: selectedInterests,
          isComplete: true,
        });
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
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
      style={[styles.container, { backgroundColor: c.background }]}
      edges={['top', 'bottom']}
    >
      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: c.surface }]}>
        <Animated.View
          style={[
            styles.progressBar,
            { backgroundColor: c.textBright },
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
          <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5, marginBottom: spacing[2] }}>
            Interests
          </Text>
          <Text family="sansSemibold" variant="2xl" style={[styles.title, { color: c.textPrimary }]}>
            What defines you?
          </Text>
          <Text serif variant="base" style={[styles.subtitle, { color: c.textSecondary }]}>
            Select interests that reflect your lifestyle. This helps connect you with
            like-minded individuals.
          </Text>
        </Animated.View>

        {/* Selection Counter */}
        <Animated.View
          entering={FadeIn.delay(300).duration(300)}
          style={styles.counterContainer}
        >
          <Text family="mono" variant="sm" style={{ color: c.textSecondary }}>
            {selectedInterests.length} of {MIN_INTERESTS}+ selected
          </Text>
          {isEnoughSelected && (
            <Text family="mono" variant="sm" style={{ color: c.textBright }}>
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
                  style={[styles.groupHeader, { borderColor: c.frame }]}
                >
                  <View style={styles.groupHeaderLeft}>
                    {(() => {
                      const IconComp = GROUP_ICON_MAP[group.icon] || Briefcase;
                      return <IconComp size={18} color={c.textSecondary} strokeWidth={2} />;
                    })()}
                    <Text family="sansSemibold" variant="base" style={[styles.groupTitle, { color: c.textPrimary }]}>
                      {group.label}
                    </Text>
                    {selectedCount > 0 && (
                      <View
                        style={[
                          styles.selectedBadge,
                          { backgroundColor: c.textBright },
                        ]}
                      >
                        <Text family="sansSemibold" variant="xs" style={{ color: c.paper }}>
                          {selectedCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  {isExpanded
                    ? <ChevronUp size={20} color={c.textSecondary} strokeWidth={2} />
                    : <ChevronDown size={20} color={c.textSecondary} strokeWidth={2} />
                  }
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
                                ? c.textBright
                                : c.surface,
                              borderColor: isSelected
                                ? c.textBright
                                : c.frame,
                            },
                          ]}
                        >
                          <Text
                            family={isSelected ? 'sansSemibold' : 'sans'}
                            variant="sm"
                            style={{
                              color: isSelected ? c.paper : c.textPrimary,
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
          { borderTopColor: c.frame },
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
        <Text family="mono" variant="xs" style={[styles.hint, { color: c.textTertiary, textAlign: 'center' }]}>
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
