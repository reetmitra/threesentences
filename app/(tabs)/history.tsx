/**
 * ThreeSixtyThree™ Three Sentences - History Screen
 *
 * Calendar view of past entries.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { Text } from '@/components/ui/Text';
import { Calendar } from '@/components/Calendar';
import { EntryCard } from '@/components/EntryCard';
import { DailyRules } from '@/components/DailyRules';
import { SkeletonCalendar } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getEntryDatesForMonth, getEntryForDate } from '@/store/entries';
import { Entry } from '@/types/entry';

export default function HistoryScreen() {
  const { userId } = useAuth();
  const activeColors = colors.dark;
  const { showToast } = useToast();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const [entryDates, setEntryDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntryDates = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const dates = await getEntryDatesForMonth(userId, year, month);
      setEntryDates(dates);
    } catch (error) {
      console.error('Failed to load entry dates:', error);
      showToast('error', 'Could not load your history.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, year, month]);

  useEffect(() => {
    loadEntryDates();
  }, [loadEntryDates]);

  useFocusEffect(
    useCallback(() => {
      loadEntryDates();
      setSelectedDate(null);
      setSelectedEntry(null);
    }, [loadEntryDates])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEntryDates();
    setRefreshing(false);
  }, [loadEntryDates]);

  const handleSelectDate = useCallback(async (date: string) => {
    if (!userId) return;
    setSelectedDate(date);
    try {
      const entry = await getEntryForDate(userId, date);
      setSelectedEntry(entry);
    } catch (error) {
      console.error('Failed to load entry:', error);
      showToast('error', 'Could not load this entry.');
      setSelectedEntry(null);
    }
  }, [userId]);

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedEntry(null);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const now = new Date();
    if (nextMonth <= new Date(now.getFullYear(), now.getMonth() + 1, 0)) {
      setCurrentDate(nextMonth);
      setSelectedDate(null);
      setSelectedEntry(null);
    }
  };

  const canGoNext = () => {
    const now = new Date();
    return !(year === now.getFullYear() && month === now.getMonth() + 1);
  };

  const formatMonthHeader = () => {
    return currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

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
          <Text variant="2xl" weight="bold" style={styles.headerTitle}>
            PROJECT 363
          </Text>
          <Text variant="sm" color="secondary" style={styles.subtitle}>
            363 DAYS TO BETTER
          </Text>
        </View>

        {isLoading ? (
          <SkeletonCalendar />
        ) : (
          <>
            {/* Month navigation */}
            <View style={styles.monthNav}>
              <Pressable
                onPress={goToPreviousMonth}
                style={[styles.navButton, { backgroundColor: activeColors.surface }]}
                accessibilityLabel="Previous month"
              >
                <ChevronLeft size={24} color={activeColors.textPrimary} />
              </Pressable>

              <Text variant="lg" weight="semibold" style={styles.monthTitle}>
                {formatMonthHeader()}
              </Text>

              <Pressable
                onPress={goToNextMonth}
                style={[
                  styles.navButton,
                  { backgroundColor: activeColors.surface },
                  !canGoNext() && styles.navButtonDisabled,
                ]}
                disabled={!canGoNext()}
                accessibilityLabel="Next month"
              >
                <ChevronRight
                  size={24}
                  color={canGoNext() ? activeColors.textPrimary : activeColors.textTertiary}
                />
              </Pressable>
            </View>

            {/* Calendar */}
            <View style={[styles.calendarContainer, { backgroundColor: activeColors.surface }]}>
              <Calendar
                year={year}
                month={month}
                entryDates={entryDates}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </View>

            {/* Selected entry */}
            {selectedEntry ? (
              <View style={styles.entrySection}>
                <EntryCard entry={selectedEntry} showDate />
              </View>
            ) : selectedDate ? (
              <View style={styles.noEntryMessage}>
                <Text variant="base" color="secondary" centered>
                  Rest day
                </Text>
                <Text variant="sm" color="tertiary" centered style={styles.noEntryHint}>
                  Empty days are part of the journey.{'\n'}
                  The 363 philosophy embraces grace.
                </Text>
              </View>
            ) : (
              <View style={styles.selectPrompt}>
                <Text variant="base" color="secondary" centered>
                  Tap a date with a dot to view that entry.
                </Text>
              </View>
            )}

            {/* Entry count */}
            {entryDates.size > 0 && (
              <View style={[styles.statsSection, { borderTopColor: activeColors.border }]}>
                <Text variant="sm" color="tertiary" centered>
                  {entryDates.size} {entryDates.size === 1 ? 'entry' : 'entries'} this month
                </Text>
              </View>
            )}

            {/* Daily Rules Footer */}
            <DailyRules />
          </>
        )}
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
  headerTitle: {
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: spacing[1],
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  monthTitle: {
    textAlign: 'center',
  },
  calendarContainer: {
    borderRadius: 16,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  entrySection: {
    marginTop: spacing[2],
  },
  noEntryMessage: {
    marginTop: spacing[4],
    paddingVertical: spacing[6],
  },
  noEntryHint: {
    marginTop: spacing[2],
  },
  selectPrompt: {
    marginTop: spacing[4],
    paddingVertical: spacing[4],
  },
  statsSection: {
    marginTop: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
