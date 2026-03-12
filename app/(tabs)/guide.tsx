/**
 * Three™ - Insights Screen (formerly Guide)
 *
 * Dynamic dashboard: streaks, daily prompt, weekly summary,
 * quick access to reflect, and philosophy cards.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Sparkles,
  PenTool,
  Lightbulb,
  ArrowRight,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { StreakCounter } from '@/components/StreakCounter';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getEntryStats, hasEntryForToday, getEntriesForReflection } from '@/store/entries';
import { getPreferences } from '@/store/onboarding';
import { getDailyPrompt } from '@/constants/prompts';

export default function InsightsScreen() {
  const activeColors = colors.dark;
  const { userId } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalEntries: 0, currentStreak: 0, longestStreak: 0 });
  const [hasWrittenToday, setHasWrittenToday] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [promptEnabled, setPromptEnabled] = useState(false);
  const [weekEntries, setWeekEntries] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const dailyPrompt = getDailyPrompt(today);

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      const [entryStats, writtenToday, prefs, weekData] = await Promise.all([
        getEntryStats(userId),
        hasEntryForToday(userId),
        getPreferences(),
        getEntriesForReflection(userId, 7),
      ]);
      setStats(entryStats);
      setHasWrittenToday(writtenToday);
      setAiEnabled(prefs.aiReflectionEnabled);
      setPromptEnabled(prefs.dailyPromptEnabled);
      setWeekEntries(weekData.length);
    } catch (err) {
      console.error('Failed to load insights:', err);
      showToast('error', 'Could not load insights.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  // Day labels for the week bar chart
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayDayIndex = (new Date().getDay() + 6) % 7; // Mon=0

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: activeColors.background }]}
        edges={['top']}
      >
        <View style={styles.header}>
          <Text variant="2xl" weight="bold">Insights</Text>
        </View>
        <View style={styles.scrollContent}>
          <SkeletonCard style={{ height: 140, marginBottom: spacing[4] }} />
          <SkeletonCard style={{ height: 100, marginBottom: spacing[4] }} />
          <SkeletonCard style={{ height: 80 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={activeColors.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="2xl" weight="bold">
            Insights
          </Text>
          <Text variant="sm" color="secondary" style={styles.subtitle}>
            Your writing at a glance
          </Text>
        </View>

        {/* Streak + Progress */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <StreakCounter
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
            totalEntries={stats.totalEntries}
          />
        </Animated.View>

        {/* Daily Writing Prompt */}
        {promptEnabled && !hasWrittenToday && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Pressable
              style={[styles.card, { backgroundColor: activeColors.surface }]}
              onPress={() => router.push('/(tabs)/')}
            >
              <View style={styles.cardHeader}>
                <Lightbulb size={20} color={activeColors.accent} />
                <Text variant="sm" weight="medium" style={styles.cardHeaderText}>
                  TODAY'S PROMPT
                </Text>
              </View>
              <Text variant="base" color="secondary" style={styles.promptText}>
                "{dailyPrompt.text}"
              </Text>
              <View style={styles.cardAction}>
                <Text variant="sm" weight="medium" style={{ color: activeColors.accent }}>
                  Start Writing
                </Text>
                <ArrowRight size={16} color={activeColors.accent} />
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Write Today CTA (if no prompt but hasn't written) */}
        {!hasWrittenToday && !promptEnabled && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Pressable
              style={[styles.card, { backgroundColor: activeColors.surface }]}
              onPress={() => router.push('/(tabs)/')}
            >
              <View style={styles.cardHeader}>
                <PenTool size={20} color={activeColors.accent} />
                <Text variant="sm" weight="medium" style={styles.cardHeaderText}>
                  TODAY
                </Text>
              </View>
              <Text variant="base" color="secondary" style={{ marginBottom: spacing[3] }}>
                You haven't written today yet. Three sentences is all it takes.
              </Text>
              <View style={styles.cardAction}>
                <Text variant="sm" weight="medium" style={{ color: activeColors.accent }}>
                  Write Now
                </Text>
                <ArrowRight size={16} color={activeColors.accent} />
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Quick Reflect Access */}
        {aiEnabled && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Pressable
              style={[styles.card, { backgroundColor: activeColors.surface }]}
              onPress={() => router.push('/(tabs)/reflect')}
            >
              <View style={styles.cardHeader}>
                <Sparkles size={20} color={activeColors.accent} />
                <Text variant="sm" weight="medium" style={styles.cardHeaderText}>
                  AI REFLECTION
                </Text>
              </View>
              <Text variant="base" color="secondary" style={{ marginBottom: spacing[3] }}>
                Discover patterns and themes in your recent entries.
              </Text>
              <View style={styles.cardAction}>
                <Text variant="sm" weight="medium" style={{ color: activeColors.accent }}>
                  Generate Reflection
                </Text>
                <ArrowRight size={16} color={activeColors.accent} />
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Weekly Summary Bar Chart */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={[styles.card, { backgroundColor: activeColors.surface }]}>
            <Text variant="sm" weight="medium" color="secondary" style={styles.weeklyTitle}>
              THIS WEEK
            </Text>
            <Text variant="3xl" weight="bold" style={{ marginBottom: spacing[1] }}>
              {weekEntries}/7
            </Text>
            <Text variant="sm" color="secondary" style={{ marginBottom: spacing[4] }}>
              {weekEntries === 7
                ? 'Perfect week!'
                : weekEntries === 0
                  ? 'Start your week strong'
                  : `${7 - weekEntries} more to complete the week`}
            </Text>

            {/* Bar chart */}
            <View style={styles.barChart}>
              {dayLabels.map((label, i) => {
                const isFilled = i < weekEntries;
                const isToday = i === todayDayIndex;
                return (
                  <View key={i} style={styles.barItem}>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor: isFilled
                            ? activeColors.accent
                            : activeColors.surfaceHover,
                          height: isFilled ? 32 : 12,
                        },
                        isToday && !isFilled && {
                          borderWidth: 1,
                          borderColor: activeColors.accent,
                          backgroundColor: 'transparent',
                        },
                      ]}
                    />
                    <Text
                      variant="xs"
                      style={{
                        color: isToday ? activeColors.accent : activeColors.textTertiary,
                        marginTop: 4,
                      }}
                    >
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Philosophy Cards */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={[styles.philosophyCard, { backgroundColor: activeColors.surface }]}>
            <Text variant="base" weight="semibold" style={styles.philosophyTitle}>
              The 363 Way
            </Text>
            <Text variant="sm" color="secondary" style={styles.philosophyBody}>
              Commit to 363 days out of 365. Missed days are simply empty — not failures, not
              broken streaks. Return when you return, without shame.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <View style={[styles.philosophyCard, { backgroundColor: activeColors.surface }]}>
            <Text variant="base" weight="semibold" style={styles.philosophyTitle}>
              Presence Over Perfection
            </Text>
            <Text variant="sm" color="secondary" style={styles.philosophyBody}>
              Three sentences. No edits. No deletions. Your words stand as written, capturing
              how you felt in the moment. Done is better than perfect.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    marginBottom: spacing[4],
  },
  subtitle: {
    marginTop: spacing[1],
  },

  // Cards
  card: {
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  cardHeaderText: {
    marginLeft: spacing[2],
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  promptText: {
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: spacing[3],
  },

  // Weekly
  weeklyTitle: {
    letterSpacing: 1,
    marginBottom: spacing[2],
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 20,
    borderRadius: 4,
  },

  // Philosophy
  philosophyCard: {
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  philosophyTitle: {
    marginBottom: spacing[2],
  },
  philosophyBody: {
    lineHeight: 22,
  },
});
