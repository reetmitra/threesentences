import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { Calendar } from '@/components/Calendar';
import { StreakCounter } from '@/components/StreakCounter';
import { RangeSelector } from '@/components/patterns/RangeSelector';
import { MoodChart } from '@/components/patterns/MoodChart';
import { HabitGrid } from '@/components/patterns/HabitGrid';
import { DayDetail } from '@/components/patterns/DayDetail';
import { SkeletonCalendar, SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/theme/colors';
import { spacing, edgePadding } from '@/theme/spacing';
import { getEntryForDate, getEntryStats } from '@/store/entries';
import { getActiveHabits } from '@/store/habits';
import { getPreferences } from '@/store/onboarding';
import { getCachedPatterns, getPatterns } from '@/store/patterns';
import { getCachedSettings } from '@/store/settings';
import { Entry, getTodayDateString, parseDateString } from '@/types/entry';
import {
  PatternDay,
  RangeDays,
  DEFAULT_RANGE,
  buildRange,
  monthRange,
  isFullHabitDay,
} from '@/types/patterns';
import { Habit } from '@/types/tracking';

const LOAD_ERROR = "Couldn't load your patterns.";

/** Shows cached data instantly, then refreshes. Resolves false when the refresh failed. */
async function loadWithCache(
  range: { from: string; to: string },
  apply: (days: PatternDay[]) => void,
): Promise<boolean> {
  const cached = await getCachedPatterns(range.from, range.to);
  if (cached) apply(cached);
  try {
    apply(await getPatterns(range.from, range.to));
    return true;
  } catch {
    return false;
  }
}

export default function PatternsScreen() {
  const { userId, isLoaded } = useAuth();
  const c = colors.dark;
  const { showToast } = useToast();
  const trackers = getCachedSettings().trackers;

  const today = getTodayDateString();
  const [range, setRange] = useState<RangeDays>(DEFAULT_RANGE);
  const [monthStart, setMonthStart] = useState(() => {
    const t = parseDateString(getTodayDateString());
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth() + 1;

  const [rangeDays, setRangeDays] = useState<PatternDay[]>([]);
  const [monthDays, setMonthDays] = useState<PatternDay[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState({ totalEntries: 0, currentStreak: 0, longestStreak: 0 });
  const [aiEnabled, setAiEnabled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [habitsLoaded, setHabitsLoaded] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const selectedRef = useRef<string | null>(null);

  // Drop results from a superseded range/month so a slow response can't overwrite a newer one.
  const rangeKey = useRef('');
  const monthKey = useRef('');

  const loadRange = useCallback(async (): Promise<boolean> => {
    const r = buildRange(getTodayDateString(), range);
    rangeKey.current = `${r.from}:${r.to}`;
    const key = rangeKey.current;
    return loadWithCache(r, (d) => { if (rangeKey.current === key) setRangeDays(d); });
  }, [range]);

  const loadMonth = useCallback(async (): Promise<boolean> => {
    const r = monthRange(year, month);
    monthKey.current = `${r.from}:${r.to}`;
    const key = monthKey.current;
    return loadWithCache(r, (d) => { if (monthKey.current === key) setMonthDays(d); });
  }, [year, month]);

  const loadExtras = useCallback(async () => {
    if (!userId) return;
    try {
      const [s, h, prefs] = await Promise.all([
        getEntryStats(userId),
        getActiveHabits(),
        getPreferences(),
      ]);
      setStats(s);
      setStatsLoaded(true);
      setHabits(h);
      setHabitsLoaded(true);
      setAiEnabled(prefs.aiReflectionEnabled);
      setPrefsLoaded(true);
    } catch {
      // Secondary data; keep what is shown.
    } finally {
      setStatsLoaded(true);
      setHabitsLoaded(true);
      setPrefsLoaded(true);
    }
  }, [userId]);

  /** Refreshes range + month together; toasts at most once per cycle. */
  const refreshAll = useCallback(async () => {
    if (!isLoaded) return;
    const [rangeOk, monthOk] = await Promise.all([loadRange(), loadMonth(), loadExtras()]);
    setLoaded(true); // only after a real cycle, never on the pre-auth early return
    if (!rangeOk || !monthOk) showToast('error', LOAD_ERROR);
  }, [isLoaded, loadRange, loadMonth, loadExtras, showToast]);

  // Mount + every focus.
  // Also re-runs when range/month change identity: one cycle, one toast.
  useFocusEffect(useCallback(() => {
    // Selection is cleared on focus so the panel never shows stale entry state.
    setSelectedDate(null);
    setSelectedEntry(null);
    selectedRef.current = null;
    refreshAll();
  }, [refreshAll]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  const handleSelectDate = useCallback(async (date: string) => {
    if (!userId) return;
    selectedRef.current = date;
    setSelectedDate(date);
    setSelectedEntry(null);
    try {
      const entry = await getEntryForDate(userId, date);
      if (selectedRef.current === date) setSelectedEntry(entry);
    } catch {
      if (selectedRef.current === date) showToast('error', 'Could not load entry');
    }
  }, [userId, showToast]);

  const clearSelection = () => {
    selectedRef.current = null;
    setSelectedDate(null);
    setSelectedEntry(null);
  };

  const todayMonth = parseDateString(today);
  const canGoNext = !(year === todayMonth.getFullYear() && month === todayMonth.getMonth() + 1);

  const goToPreviousMonth = () => {
    setMonthStart(new Date(year, month - 2, 1));
    clearSelection();
  };

  const goToNextMonth = () => {
    if (!canGoNext) return;
    setMonthStart(new Date(year, month, 1));
    clearSelection();
  };

  const entryDates = useMemo(
    () => new Set(monthDays.filter((d) => d.hasEntry).map((d) => d.date)),
    [monthDays],
  );
  const fullHabitDates = useMemo(
    () => new Set(monthDays.filter(isFullHabitDay).map((d) => d.date)),
    [monthDays],
  );
  const selectedDay = selectedDate
    ? monthDays.find((d) => d.date === selectedDate) ?? null
    : null;

  // A day known to have an entry must not flash "No entry" while it loads (or offline).
  const entryPending = !selectedEntry && !!selectedDay?.hasEntry;

  // Range data is ready once a real load cycle finished or cache supplied days.
  const rangeReady = loaded || rangeDays.length > 0;

  const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
      >
        <View style={styles.header}>
          <Text family="sansBold" variant="2xl" style={{ color: c.textPrimary }}>
            Patterns
          </Text>
          <View style={styles.rangeWrap}>
            <RangeSelector value={range} onChange={setRange} />
          </View>
        </View>

        <View style={styles.monthNav}>
          <Pressable
            onPress={goToPreviousMonth}
            style={[styles.navButton, { backgroundColor: c.surface, borderColor: c.frame }]}
            accessibilityLabel="Previous month"
          >
            <Icon name="arrowL" size={20} color={c.textPrimary} />
          </Pressable>

          <Text family="sansSemibold" variant="base" style={{ color: c.textPrimary }}>
            {monthLabel}
          </Text>

          <Pressable
            onPress={goToNextMonth}
            style={[
              styles.navButton,
              { backgroundColor: c.surface, borderColor: c.frame },
              !canGoNext && styles.navButtonDisabled,
            ]}
            disabled={!canGoNext}
            accessibilityLabel="Next month"
          >
            <Icon name="caret" size={20} color={canGoNext ? c.textPrimary : c.textTertiary} />
          </Pressable>
        </View>

        <View style={[styles.calendarContainer, { backgroundColor: c.surface, borderColor: c.frame }]}>
          {loaded || monthDays.length > 0 ? (
            <Calendar
              year={year}
              month={month}
              entryDates={entryDates}
              fullHabitDates={fullHabitDates}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
          ) : (
            <SkeletonCalendar />
          )}
        </View>

        {selectedDate && entryPending && <SkeletonCard style={styles.entrySkeleton} />}
        {selectedDate && !entryPending && (
          <DayDetail
            date={selectedDate}
            entry={selectedEntry}
            day={selectedDay}
            habits={habits}
            isToday={selectedDate === today}
            onOpenToday={() => router.push('/(tabs)')}
          />
        )}

        {trackers.mood && (
          <View style={styles.section}>
            <Text family="mono" variant="xs" uppercase style={[styles.eyebrow, { color: c.textSecondary }]}>
              Mood
            </Text>
            {rangeReady ? <MoodChart days={rangeDays} range={range} /> : <SkeletonCard style={styles.cardSkeleton} />}
          </View>
        )}

        {trackers.habits && (
          <View style={styles.section}>
            <Text family="mono" variant="xs" uppercase style={[styles.eyebrow, { color: c.textSecondary }]}>
              Habits
            </Text>
            {habitsLoaded && rangeReady ? (
              <HabitGrid habits={habits} days={rangeDays} range={range} />
            ) : (
              <SkeletonCard style={styles.cardSkeleton} />
            )}
          </View>
        )}

        {/* Always visible so the feature is discoverable pre-opt-in; the Reflect
            screen itself shows the enable-in-settings state when disabled. */}
        <Pressable
          style={[styles.card, { backgroundColor: c.surface, borderColor: c.frame }]}
          onPress={() => router.push('/(tabs)/reflect')}
        >
          <View style={styles.cardHeader}>
            <Icon name="spark" size={18} color={c.textSecondary} strokeWidth={1.5} />
            <Text family="mono" variant="xs" uppercase style={[styles.eyebrow, { color: c.textSecondary }]}>
              AI Reflection
            </Text>
          </View>
          {prefsLoaded ? (
            <>
              <Text family="sans" variant="base" style={{ color: c.textSecondary, marginBottom: spacing[4] }}>
                {aiEnabled
                  ? 'Discover patterns and themes in your recent entries.'
                  : 'Enable AI to discover patterns in your entries.'}
              </Text>
              <View style={styles.cardAction}>
                <Text family="sansSemibold" variant="sm" style={{ color: c.textBright }}>
                  {aiEnabled ? 'Generate reflection' : 'Learn more'}
                </Text>
                <ArrowRight size={14} color={c.textBright} />
              </View>
            </>
          ) : (
            <SkeletonCard style={styles.cardSkeleton} />
          )}
        </Pressable>

        <View style={styles.section}>
          <Text family="mono" variant="xs" uppercase style={[styles.eyebrow, { color: c.textSecondary }]}>
            363 Progress
          </Text>
          {statsLoaded ? (
            <StreakCounter
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
              totalEntries={stats.totalEntries}
            />
          ) : (
            <SkeletonCard style={styles.cardSkeleton} />
          )}
        </View>

        <View style={styles.section}>
          <Text family="mono" variant="xs" uppercase style={[styles.eyebrow, { color: c.textSecondary }]}>
            About the practice
          </Text>
          <View style={[styles.principleCard, { backgroundColor: c.surface, borderColor: c.frame }]}>
            <Text family="sansSemibold" variant="base" style={{ color: c.textPrimary, marginBottom: spacing[2] }}>
              The 363 Way
            </Text>
            <Text serif variant="sm" style={{ color: c.textSecondary, lineHeight: 22 }}>
              Commit to 363 days out of 365. Missed days are simply empty — not failures, not broken streaks. Return when you return, without shame.
            </Text>
          </View>
          <View style={[styles.principleCard, { backgroundColor: c.surface, borderColor: c.frame }]}>
            <Text family="sansSemibold" variant="base" style={{ color: c.textPrimary, marginBottom: spacing[2] }}>
              Presence Over Perfection
            </Text>
            <Text serif variant="sm" style={{ color: c.textSecondary, lineHeight: 22 }}>
              Three sentences, locked when your day ends. No deletions. Your words stand as written, capturing how you felt in the moment.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: edgePadding.content, paddingTop: spacing[4], paddingBottom: spacing[8] },
  header: { marginBottom: spacing[5] },
  rangeWrap: { marginTop: spacing[3] },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] },
  navButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  navButtonDisabled: { opacity: 0.4 },
  calendarContainer: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: spacing[3], marginBottom: spacing[4] },
  entrySkeleton: { height: 120, marginBottom: spacing[4] },
  cardSkeleton: { height: 80 },
  section: { marginTop: spacing[5] },
  eyebrow: { letterSpacing: 1.5, marginBottom: spacing[3] },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: spacing[4], marginTop: spacing[5] },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] },
  cardAction: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  principleCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: spacing[4], marginBottom: spacing[3] },
});
