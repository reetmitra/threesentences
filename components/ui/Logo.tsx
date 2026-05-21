import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import { colors } from '@/theme/colors';

interface LogoProps {
  size?: number;
  /** 'primary' = white tile ink dots (dark surfaces, default)
   *  'reversed' = ink tile bone dots (light surfaces) */
  variant?: 'primary' | 'reversed';
}

export function Logo({ size = 64, variant = 'primary' }: LogoProps) {
  const tileRadius = size * 0.22;
  const dotR = size * 0.062;
  const dotSpacing = size * 0.21;
  const cx = size / 2;
  const cy = size / 2;

  const tileFill = variant === 'primary' ? colors.dark.textBright : colors.dark.paper;
  const dotFill = variant === 'primary' ? colors.dark.paper : colors.dark.textPrimary;

  return (
    <View accessibilityLabel="Three Sentences logo">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect
          x={0}
          y={0}
          width={size}
          height={size}
          rx={tileRadius}
          ry={tileRadius}
          fill={tileFill}
        />
        <Circle cx={cx - dotSpacing} cy={cy} r={dotR} fill={dotFill} />
        <Circle cx={cx}              cy={cy} r={dotR} fill={dotFill} />
        <Circle cx={cx + dotSpacing} cy={cy} r={dotR} fill={dotFill} />
      </Svg>
    </View>
  );
}
