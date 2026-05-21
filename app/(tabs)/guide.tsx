import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Sparkles, Edit3, ArrowRight } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { StreakCounter } from '@/components/StreakCounter';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/theme/colors';
import { spacing, edgePadding } from '@/theme/spacing';
import { getEntryStats, hasEntryForToday } from '@/store/entries';
import { getPreferences } from '@/store/onboarding';
import { getDailyPrompt } from '@/constants/prompts';

export default function InsightsScreen() {
  const c = colors.dark;
  const { userId } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalEntries: 0, currentStreak: 0, longestStreak: 0 });
  const [hasWrittenToday, setHasWrittenToday] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [promptEnabled, setPromptEnabled] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const dailyPrompt = getDailyPrompt(today);

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      const [entryStats, writtenToday, prefs] = await Promise.all([
        getEntryStats(userId),
        hasEntryForToday(userId),
        getPreferences(),
      ]);
      setStats(entryStats);
      setHasWrittenToday(writtenToday);
      setAiEnabled(prefs.aiReflectionEnabled);
      setPromptEnabled(prefs.dailyPromptEnabled);
    } catch {
      showToast('error', 'Could not load insights');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <View style={[styles.header, { paddingHorizontal: edgePadding.content }]}>
          <Text family="sansBold" variant="2xl" style={{ color: c.textPrimary }}>Insights</Text>
        </View>
        <View style={{ paddingHorizontal: edgePadding.content }}>
          <SkeletonCard style={{ height: 160, marginBottom: spacing[4] }} />
          <SkeletonCard style={{ height: 100, marginBottom: spacing[4] }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
      >
        <View style={styles.header}>
          <Text family="sansBold" variant="2xl" style={{ color: c.textPrimary }}>Insights</Text>
          <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5, marginTop: 4 }}>
            Your writing at a glance
          </Text>
        </View>

        <Animated.View entering={FadeInDown.duration(400)}>
          <StreakCounter
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
            totalEntries={stats.totalEntries}
          />
        </Animated.View>

        {!hasWrittenToday && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Pressable
              style={[styles.card, { backgroundColor: c.surface, borderColor: c.frame }]}
              onPress={() => router.push('/(tabs)/')}
            >
              <View style={styles.cardHeader}>
                <Edit3 size={18} color={c.textSecondary} strokeWidth={1.5} />
                <Text family="mono" variant="xs" uppercase style={[styles.cardEyebrow, { color: c.textSecondary }]}>
                  {promptEnabled ? "Today's prompt" : 'Today'}
                </Text>
              </View>
              {promptEnabled ? (
                <Text serif variant="base" style={{ color: c.textPrimary, marginBottom: spacing[4], lineHeight: 26 }}>
                  "{dailyPrompt.text}"
                </Text>
              ) : (
                <Text family="sans" variant="base" style={{ color: c.textSecondary, marginBottom: spacing[4] }}>
                  Three sentences is all it takes.
                </Text>
              )}
              <View style={styles.cardAction}>
                <Text family="sansSemibold" variant="sm" style={{ color: c.textBright }}>Begin</Text>
                <ArrowRight size={14} color={c.textBright} />
              </View>
            </Pressable>
          </Animated.View>
        )}

        {aiEnabled && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Pressable
              style={[styles.card, { backgroundColor: c.surface, borderColor: c.frame }]}
              onPress={() => router.push('/(tabs)/reflect')}
            >
              <View style={styles.cardHeader}>
                <Sparkles size={18} color={c.textSecondary} strokeWidth={1.5} />
                <Text family="mono" variant="xs" uppercase style={[styles.cardEyebrow, { color: c.textSecondary }]}>
                  AI Reflection
                </Text>
              </View>
              <Text family="sans" variant="base" style={{ color: c.textSecondary, marginBottom: spacing[4] }}>
                Discover patterns and themes in your recent entries.
              </Text>
              <View style={styles.cardAction}>
                <Text family="sansSemibold" variant="sm" style={{ color: c.textBright }}>Generate reflection</Text>
                <ArrowRight size={14} color={c.textBright} />
              </View>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={[styles.principleCard, { backgroundColor: c.surface, borderColor: c.frame }]}>
            <Text family="sansSemibold" variant="base" style={{ color: c.textPrimary, marginBottom: spacing[2] }}>
              The 363 Way
            </Text>
            <Text serif variant="sm" style={{ color: c.textSecondary, lineHeight: 22 }}>
              Commit to 363 days out of 365. Missed days are simply empty — not failures, not broken streaks. Return when you return, without shame.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(380).duration(400)}>
          <View style={[styles.principleCard, { backgroundColor: c.surface, borderColor: c.frame }]}>
            <Text family="sansSemibold" variant="base" style={{ color: c.textPrimary, marginBottom: spacing[2] }}>
              Presence Over Perfection
            </Text>
            <Text serif variant="sm" style={{ color: c.textSecondary, lineHeight: 22 }}>
              Three sentences. No edits. No deletions. Your words stand as written, capturing how you felt in the moment.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: edgePadding.content, paddingTop: spacing[4], paddingBottom: spacing[8] },
  header: { marginBottom: spacing[5] },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: spacing[4], marginBottom: spacing[4] },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] },
  cardEyebrow: { letterSpacing: 1.5 },
  cardAction: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  principleCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: spacing[4], marginBottom: spacing[3] },
});
