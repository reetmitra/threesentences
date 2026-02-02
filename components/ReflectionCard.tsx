/**
 * ThreeSixtyThree™ Three Sentences - Reflection Card
 * 
 * Displays AI-generated reflection with mandatory disclaimer.
 * Per PRD FR-AI-05: Every reflection includes disclaimer footer.
 */

import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Reflection, REFLECTION_DISCLAIMER } from '@/services/aiReflection';

interface ReflectionCardProps {
  reflection: Reflection;
}

export function ReflectionCard({ reflection }: ReflectionCardProps) {
  const scheme = useColorScheme() ?? 'dark';
  const activeColors = colors[scheme === 'dark' ? 'dark' : 'light'];

  const formatDate = () => {
    const date = new Date(reflection.generatedAt);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeRangeLabel = () => {
    switch (reflection.timeRange) {
      case 7: return 'Past 7 days';
      case 30: return 'Past 30 days';
      case 90: return 'Past 90 days';
      default: return `Past ${reflection.timeRange} days`;
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: activeColors.surface }]}
      accessible
      accessibilityLabel={`AI reflection from ${formatDate()}`}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="sm" color="secondary">
          {formatDate()}
        </Text>
        <View style={[styles.badge, { backgroundColor: activeColors.accentSubtle }]}>
          <Text variant="xs" style={{ color: activeColors.accent }}>
            {getTimeRangeLabel()}
          </Text>
        </View>
      </View>

      {/* Reflection content */}
      <Text
        variant="base"
        style={[styles.content, { color: activeColors.textPrimary }]}
      >
        {reflection.content}
      </Text>

      {/* Entries analyzed */}
      <Text variant="xs" color="tertiary" style={styles.meta}>
        Based on {reflection.entriesAnalyzed} {reflection.entriesAnalyzed === 1 ? 'entry' : 'entries'}
      </Text>

      {/* Mandatory disclaimer (FR-AI-05) */}
      <View style={[styles.disclaimer, { borderTopColor: activeColors.border }]}>
        <Text variant="xs" color="tertiary" style={styles.disclaimerText}>
          {REFLECTION_DISCLAIMER}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  content: {
    lineHeight: 24,
    marginBottom: spacing[3],
  },
  meta: {
    marginBottom: spacing[4],
  },
  disclaimer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing[3],
  },
  disclaimerText: {
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
