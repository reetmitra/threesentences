/**
 * ThreeSixtyThree™ Three Sentences - Reflection Card
 * 
 * Displays AI-generated reflection with mandatory disclaimer.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Reflection, REFLECTION_DISCLAIMER } from '@/services/aiReflection';

interface ReflectionCardProps {
  reflection: Reflection;
}

export function ReflectionCard({ reflection }: ReflectionCardProps) {
  const activeColors = colors.dark;

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
      style={[styles.container, { backgroundColor: activeColors.surface, borderColor: activeColors.frame }]}
      accessible
      accessibilityLabel={`AI reflection from ${formatDate()}`}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="sm" family="mono" color="secondary">
          {formatDate()}
        </Text>
        <View style={[styles.badge, { backgroundColor: activeColors.surfaceHi }]}>
          <Text variant="xs" family="mono" color="secondary">
            {getTimeRangeLabel()}
          </Text>
        </View>
      </View>

      {/* Reflection content */}
      <Text
        variant="base"
        serif
        style={[styles.content, { color: activeColors.textSecondary }]}
      >
        {reflection.content}
      </Text>

      {/* Entries analyzed */}
      <Text variant="xs" family="mono" color="tertiary" style={styles.meta}>
        Based on {reflection.entriesAnalyzed} {reflection.entriesAnalyzed === 1 ? 'entry' : 'entries'}
      </Text>

      {/* Mandatory disclaimer */}
      <View style={[styles.disclaimer, { borderTopColor: activeColors.frame }]}>
        <Text variant="xs" family="mono" color="tertiary" style={styles.disclaimerText}>
          {REFLECTION_DISCLAIMER}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
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
    lineHeight: 26,
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
    lineHeight: 18,
  },
});
