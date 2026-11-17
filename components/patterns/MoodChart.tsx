/**
 * Three™ - Mood Chart (Patterns)
 *
 * One dot per day with a mood; a line joins consecutive days. Static, no animation.
 */

import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { moodPoints, moodSegments, PatternDay, RangeDays, summarizeMood } from '@/types/patterns';
import { MOOD_LABELS } from '@/types/tracking';

const HEIGHT = 120;
// Inset so dots on great/rough aren't clipped at the edges.
const INSET = spacing[2];
const MAX_DOT_RADIUS = 3;

interface MoodChartProps {
  days: PatternDay[];
  range: RangeDays;
}

export function MoodChart({ days, range }: MoodChartProps) {
  const [width, setWidth] = useState(0);

  if (!days.some((d) => d.mood !== null)) {
    return (
      <Text variant="sm" style={styles.empty}>
        No mood logged yet.
      </Text>
    );
  }

  const points = width > 0 ? moodPoints(days, width, HEIGHT - INSET * 2) : [];
  const segments = moodSegments(points);
  // Shrink dots so 90 days still fit side by side.
  const r = Math.min(MAX_DOT_RADIUS, width / days.length / 2);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="image"
      accessibilityLabel={summarizeMood(days, range)}
    >
      <View style={styles.axis}>
        <Text family="mono" variant="xs" style={styles.axisLabel}>
          {MOOD_LABELS[5]}
        </Text>
        <Text family="mono" variant="xs" style={styles.axisLabel}>
          {MOOD_LABELS[1]}
        </Text>
      </View>
      <View style={styles.plot} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={HEIGHT}>
            {segments.map((s, i) => (
              <Line
                key={`s${i}`}
                x1={s.x1}
                y1={s.y1 + INSET}
                x2={s.x2}
                y2={s.y2 + INSET}
                stroke={c.textSecondary}
                strokeWidth={1.5}
              />
            ))}
            {points.map((p) => (
              <Circle key={p.date} cx={p.x} cy={p.y + INSET} r={r} fill={c.textBright} />
            ))}
          </Svg>
        )}
      </View>
    </View>
  );
}

const c = colors.dark;

const styles = StyleSheet.create({
  empty: { color: c.textSecondary },
  row: { flexDirection: 'row', height: HEIGHT, gap: spacing[2] },
  axis: { justifyContent: 'space-between' },
  axisLabel: { color: c.textSecondary },
  plot: { flex: 1 },
});
