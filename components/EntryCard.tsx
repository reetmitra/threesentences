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
  const c = colors.dark;

  const formatDate = () => {
    const date = parseDateString(entry.date);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
      style={[styles.container, { backgroundColor: c.surface, borderColor: c.frame }]}
      accessible
      accessibilityLabel={`Journal entry from ${formatDate()}. ${entry.content}`}
    >
      {showDate && (
        <View style={[styles.dateHeader, { borderBottomColor: c.frame }]}>
          <Text family="mono" variant="xs" uppercase style={{ color: c.textSecondary, letterSpacing: 1.5 }}>
            {formatDate()}
          </Text>
        </View>
      )}

      <Text
        serif
        variant="lg"
        style={[styles.content, { color: c.textPrimary, lineHeight: 30 }]}
      >
        {entry.content}
      </Text>

      <View style={[styles.footer, { borderTopColor: c.frame }]}>
        <Text family="mono" variant="xs" style={{ color: c.textTertiary, letterSpacing: 0.5 }}>
          {formatTime()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing[5],
  },
  dateHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing[3],
    marginBottom: spacing[4],
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing[3],
    marginTop: spacing[4],
  },
  content: {
    // lineHeight set inline via style prop
  },
});
