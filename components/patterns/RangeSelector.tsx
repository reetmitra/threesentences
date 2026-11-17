/**
 * Three™ - Range Selector (Patterns)
 *
 * Three chips: 7 / 30 / 90 days.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing, componentRadius } from '@/theme/spacing';
import { RANGE_OPTIONS, RangeDays } from '@/types/patterns';

interface RangeSelectorProps {
  value: RangeDays;
  onChange: (r: RangeDays) => void;
}

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {RANGE_OPTIONS.map((r) => {
        const selected = value === r;
        return (
          <Pressable
            key={r}
            onPress={() => onChange(r)}
            style={[styles.chip, selected && styles.chipSelected]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${r} days`}
          >
            <Text family="mono" variant="sm" style={selected ? styles.labelSelected : styles.label}>
              {r}
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
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: spacing[3],
    borderRadius: componentRadius.chip,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: c.textBright },
  label: { color: c.textSecondary },
  labelSelected: { color: c.paper },
});
