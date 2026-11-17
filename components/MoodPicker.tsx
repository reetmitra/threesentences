/**
 * Three™ - Mood Picker
 *
 * Five word chips, rough → great. Tapping the selected chip clears it.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing, componentRadius } from '@/theme/spacing';
import { MOOD_LABELS, MoodValue } from '@/types/tracking';

const MOODS: MoodValue[] = [1, 2, 3, 4, 5];

interface MoodPickerProps {
  value: MoodValue | null;
  onChange: (mood: MoodValue | null) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {MOODS.map((m) => {
        const selected = value === m;
        return (
          <Pressable
            key={m}
            onPress={() => onChange(selected ? null : m)}
            style={[styles.chip, selected && styles.chipSelected]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={MOOD_LABELS[m]}
          >
            <Text
              variant="sm"
              numberOfLines={1}
              adjustsFontSizeToFit
              style={selected ? styles.labelSelected : styles.label}
            >
              {MOOD_LABELS[m]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const c = colors.dark;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing[1.5] },
  chip: {
    flex: 1,
    minHeight: 44,
    borderRadius: componentRadius.chip,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: c.textBright },
  label: { color: c.textSecondary },
  labelSelected: { color: c.paper },
});
