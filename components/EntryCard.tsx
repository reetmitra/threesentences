/**
 * ThreeSixtyThree™ Three Sentences - Entry Card
 * 
 * Read-only display of a submitted entry.
 * Uses serif font for reading mode.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Entry, parseDateString } from '@/types/entry';

interface EntryCardProps {
  entry: Entry;
  showDate?: boolean;
}

export function EntryCard({ entry, showDate = false }: EntryCardProps) {
  const activeColors = colors.dark;

  // Format date for display
  const formatDate = () => {
    const date = parseDateString(entry.date);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = () => {
    const date = new Date(entry.submittedAt);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: activeColors.surface }]}
      accessible
      accessibilityLabel={`Journal entry from ${formatDate()}. ${entry.content}`}
    >
      {showDate && (
        <View style={[styles.dateHeader, { borderBottomColor: activeColors.border }]}>
          <Text variant="base" weight="semibold">
            {formatDate()}
          </Text>
        </View>
      )}

      <Text
        variant="lg"
        serif
        style={[styles.content, { color: activeColors.textPrimary }]}
      >
        {entry.content}
      </Text>

      <View style={[styles.footer, { borderTopColor: activeColors.border }]}>
        <Text variant="xs" color="tertiary">
          Submitted at {formatTime()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: spacing[5],
  },
  dateHeader: {
    marginBottom: spacing[3],
    paddingBottom: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    lineHeight: 30,
  },
  footer: {
    marginTop: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
