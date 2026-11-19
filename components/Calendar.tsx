/**
 * ThreeSixtyThree™ Three Sentences - Calendar Component
 * 
 * Monthly calendar grid showing entry dates.
 * Nights you wrote are lit with a moonlight dot; all-habits days get a moonlight ring.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { getTodayDateString, formatDateString } from '@/types/entry';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DOT = 6;

interface CalendarProps {
  year: number;
  month: number; // 1-12
  entryDates: Set<string>; // Set of YYYY-MM-DD strings
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  /** Days where every answered habit was done; drawn with a thin ring. */
  fullHabitDates?: Set<string>;
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
  fullHabitDates,
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
    // Any past day or today opens; entries, mood and habits all live there.
    const canSelect = !cell.isFuture;
    const isFullHabitDay = fullHabitDates?.has(cell.date ?? '') ?? false;

    return (
      <Pressable
        key={cell.date}
        style={[
          styles.dayCell,
          cell.isToday && [styles.todayCell, { borderColor: activeColors.textPrimary }],
          isSelected && { backgroundColor: activeColors.surfaceHi },
        ]}
        onPress={() => canSelect && cell.date && onSelectDate(cell.date)}
        disabled={!canSelect}
        accessibilityRole="button"
        accessibilityLabel={`${cell.day}, ${cell.hasEntry ? 'has entry' : 'no entry'}${isFullHabitDay ? ', all habits done' : ''}${cell.isToday ? ', today' : ''}`}
        accessibilityState={{ selected: isSelected, disabled: !canSelect }}
      >
        {isFullHabitDay && <View style={styles.fullHabitRing} />}
        <Text
          variant="base"
          style={[
            styles.dayText,
            cell.isToday
              ? { color: activeColors.textBright }
              : cell.hasEntry
              ? { color: activeColors.textPrimary }
              : cell.isFuture
              ? { color: activeColors.textTertiary } // disabled
              : { color: activeColors.textSecondary }, // tappable past day
          ]}
        >
          {cell.day}
        </Text>
        {cell.hasEntry ? (
          <View style={styles.entryDot} />
        ) : (
          // Decorative placeholder (keeps rows aligned); "no entry" is told by the
          // missing filled dot and the accessibility label, so it stays faint.
          <View style={styles.noEntryDot} />
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
            <Text family="mono" variant="xs" style={{ color: activeColors.textSecondary, letterSpacing: 1 }}>
              {day.toUpperCase()}
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
  container: {},
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
    // No minWidth: seven 44pt cells plus margins need 336pt, more than the card gives
    // on any iPhone under ~430pt wide. Cells share the row (flex: 1) and stay 44pt tall.
    margin: 0,
    minHeight: 44,
  },
  todayCell: {
    borderWidth: 1,
  },
  fullHabitRing: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    bottom: spacing[1],
    left: spacing[1],
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.dark.moon,
  },
  // Same size so a row's numerals sit on one baseline: lit (moonlight) = you wrote that night.
  entryDot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.dark.moon,
    marginTop: 3,
  },
  noEntryDot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 1,
    borderColor: colors.dark.frame,
    marginTop: 3,
  },
  dayText: {
    textAlign: 'center',
  },
});
