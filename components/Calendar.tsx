/**
 * ThreeSixtyThree™ Three Sentences - Calendar Component
 * 
 * Monthly calendar grid showing entry dates.
 * Days with entries are marked with white dot.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getTodayDateString, formatDateString } from '@/types/entry';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface CalendarProps {
  year: number;
  month: number; // 1-12
  entryDates: Set<string>; // Set of YYYY-MM-DD strings
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

interface DayCell {
  date: string | null;
  day: number | null;
  isToday: boolean;
  hasEntry: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export function Calendar({
  year,
  month,
  entryDates,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const activeColors = colors.dark;
  const todayStr = getTodayDateString();

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: DayCell[] = [];

    // Empty cells before first day
    for (let i = 0; i < startingDay; i++) {
      days.push({
        date: null,
        day: null,
        isToday: false,
        hasEntry: false,
        isPast: false,
        isFuture: false,
      });
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = formatDateString(date);
      const isToday = dateStr === todayStr;
      const isPast = dateStr < todayStr;
      const isFuture = dateStr > todayStr;

      days.push({
        date: dateStr,
        day,
        isToday,
        hasEntry: entryDates.has(dateStr),
        isPast,
        isFuture,
      });
    }

    return days;
  }, [year, month, entryDates, todayStr]);

  // Split into weeks
  const weeks = useMemo(() => {
    const result: DayCell[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    // Pad last week if needed
    const lastWeek = result[result.length - 1];
    while (lastWeek && lastWeek.length < 7) {
      lastWeek.push({
        date: null,
        day: null,
        isToday: false,
        hasEntry: false,
        isPast: false,
        isFuture: false,
      });
    }
    return result;
  }, [calendarDays]);

  const renderDay = (cell: DayCell, index: number) => {
    if (cell.day === null) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }

    const isSelected = cell.date === selectedDate;
    const canSelect = cell.hasEntry;

    return (
      <Pressable
        key={cell.date}
        style={[
          styles.dayCell,
          cell.isToday && [styles.todayCell, { borderColor: activeColors.accent }],
          isSelected && { backgroundColor: activeColors.surfaceHover },
        ]}
        onPress={() => canSelect && cell.date && onSelectDate(cell.date)}
        disabled={!canSelect}
        accessibilityRole="button"
        accessibilityLabel={`${cell.day}, ${cell.hasEntry ? 'has entry' : 'no entry'}${cell.isToday ? ', today' : ''}`}
        accessibilityState={{ selected: isSelected, disabled: !canSelect }}
      >
        <Text
          variant="base"
          weight={cell.isToday ? 'bold' : 'regular'}
          style={[
            styles.dayText,
            { color: activeColors.textPrimary },
            cell.isFuture && { color: activeColors.textTertiary },
            !cell.hasEntry && cell.isPast && { color: activeColors.textTertiary },
          ]}
        >
          {cell.day}
        </Text>
        {cell.hasEntry && (
          <View
            style={[styles.entryDot, { backgroundColor: activeColors.accent }]}
          />
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={`header-${index}`} style={styles.weekdayCell}>
            <Text variant="sm" color="secondary" weight="medium">
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <View key={`week-${weekIndex}`} style={styles.weekRow}>
          {week.map((day, dayIndex) => renderDay(day, dayIndex))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[2],
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing[2],
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 2,
    minHeight: 44,
    minWidth: 44,
  },
  todayCell: {
    borderWidth: 2,
  },
  dayText: {
    textAlign: 'center',
  },
  entryDot: {
    position: 'absolute',
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
