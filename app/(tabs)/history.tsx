import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/useAuth';
import { Text } from '@/components/ui/Text';
import { Calendar } from '@/components/Calendar';
import { EntryCard } from '@/components/EntryCard';
import { SkeletonCalendar } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/theme/colors';
import { spacing, edgePadding } from '@/theme/spacing';
import { getEntryDatesForMonth, getEntryForDate } from '@/store/entries';
import { Entry } from '@/types/entry';

export default function HistoryScreen() {
  const { userId } = useAuth();
  const c = colors.dark;
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
    } catch {
      showToast('error', 'Could not load history');
    } finally {
      setIsLoading(false);
    }
  }, [userId, year, month]);

  useEffect(() => { loadEntryDates(); }, [loadEntryDates]);
  useFocusEffect(useCallback(() => {
    loadEntryDates();
    setSelectedDate(null);
    setSelectedEntry(null);
  }, [loadEntryDates]));

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
    } catch {
      showToast('error', 'Could not load entry');
      setSelectedEntry(null);
    }
  }, [userId]);

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedEntry(null);
  };

  const goToNextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const now = new Date();
    if (next <= new Date(now.getFullYear(), now.getMonth() + 1, 0)) {
      setCurrentDate(next);
      setSelectedDate(null);
      setSelectedEntry(null);
    }
  };

  const canGoNext = () => {
    const now = new Date();
    return !(year === now.getFullYear() && month === now.getMonth() + 1);
  };

  const formatMonthHeader = () =>
    currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
            History
          </Text>
          <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5, marginTop: 4 }}>
            363 days to better
          </Text>
        </View>

        {isLoading ? (
          <SkeletonCalendar />
        ) : (
          <>
            <View style={styles.monthNav}>
              <Pressable
                onPress={goToPreviousMonth}
                style={[styles.navButton, { backgroundColor: c.surface, borderColor: c.frame, borderWidth: StyleSheet.hairlineWidth }]}
                accessibilityLabel="Previous month"
              >
                <Icon name="arrowL" size={20} color={c.textPrimary} />
              </Pressable>

              <Text family="sansSemibold" variant="base" style={{ color: c.textPrimary }}>
                {formatMonthHeader()}
              </Text>

              <Pressable
                onPress={goToNextMonth}
                style={[
                  styles.navButton,
                  { backgroundColor: c.surface, borderColor: c.frame, borderWidth: StyleSheet.hairlineWidth },
                  !canGoNext() && styles.navButtonDisabled,
                ]}
                disabled={!canGoNext()}
                accessibilityLabel="Next month"
              >
                <Icon name="caret" size={20} color={canGoNext() ? c.textPrimary : c.textTertiary} />
              </Pressable>
            </View>

            <View style={[styles.calendarContainer, { backgroundColor: c.surface, borderColor: c.frame, borderWidth: StyleSheet.hairlineWidth }]}>
              <Calendar
                year={year}
                month={month}
                entryDates={entryDates}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </View>

            {selectedEntry ? (
              <View style={styles.entrySection}>
                <EntryCard entry={selectedEntry} showDate />
              </View>
            ) : selectedDate ? (
              <View style={styles.noEntryMessage}>
                <Text family="sansSemibold" variant="base" centered style={{ color: c.textSecondary }}>
                  Rest day.
                </Text>
                <Text serif variant="sm" centered style={{ color: c.textTertiary, marginTop: 6 }}>
                  Empty days are part of the journey.
                </Text>
              </View>
            ) : (
              <View style={styles.selectPrompt}>
                <Text family="mono" variant="xs" centered style={{ color: c.textTertiary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Tap a date to read that entry
                </Text>
              </View>
            )}

            {entryDates.size > 0 && (
              <View style={[styles.statsSection, { borderTopColor: c.frame }]}>
                <Text family="mono" variant="xs" centered style={{ color: c.textTertiary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {entryDates.size} {entryDates.size === 1 ? 'entry' : 'entries'} this month
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: edgePadding.content, paddingTop: spacing[4], paddingBottom: spacing[8] },
  header: { marginBottom: spacing[5] },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] },
  navButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  navButtonDisabled: { opacity: 0.4 },
  calendarContainer: { borderRadius: 16, padding: spacing[3], marginBottom: spacing[4] },
  entrySection: { marginTop: spacing[2] },
  noEntryMessage: { marginTop: spacing[4], paddingVertical: spacing[6] },
  selectPrompt: { marginTop: spacing[4], paddingVertical: spacing[4] },
  statsSection: { marginTop: spacing[6], paddingTop: spacing[4], borderTopWidth: StyleSheet.hairlineWidth },
});
