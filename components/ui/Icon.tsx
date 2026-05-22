import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export type IconName =
  | 'arrowL'
  | 'arrowUp'
  | 'bell'
  | 'caret'
  | 'chat'
  | 'check'
  | 'close'
  | 'edit'
  | 'flame'
  | 'lock'
  | 'more'
  | 'plus'
  | 'search'
  | 'spark'
  | 'wifi';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, color = '#FFFFFF', strokeWidth = 1.5 }: IconProps) {
  const s = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

  const content: Record<IconName, React.ReactNode> = {
    arrowL: <Path d="M19 12H5M12 19l-7-7 7-7" {...s} />,
    arrowUp: <Path d="M12 19V5M5 12l7-7 7 7" {...s} />,
    bell: (
      <>
        <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" {...s} />
        <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" {...s} />
      </>
    ),
    caret: <Path d="M9 6l6 6-6 6" {...s} />,
    chat: <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" {...s} />,
    check: <Path d="M20 6L9 17l-5-5" {...s} />,
    close: <Path d="M18 6L6 18M6 6l12 12" {...s} />,
    edit: (
      <>
        <Path d="M12 20h9" {...s} />
        <Path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" {...s} />
      </>
    ),
    flame: <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.4 0 2.5-1.1 2.5-2.5 0-1.9-1.5-2.7-2.5-4-1.6-2-1-5 2.5-7-.5 3 2 4.4 3 6 1 1.5 1 4-1 6-2 2-6 2-6 2-1.5 0-3-.5-4-1.5z" {...s} />,
    lock: (
      <>
        <Rect x="3" y="11" width="18" height="11" rx="2" {...s} />
        <Path d="M7 11V7a5 5 0 0 1 10 0v4" {...s} />
      </>
    ),
    more: (
      <>
        <Circle cx="12" cy="12" r="1.4" fill={color} stroke="none" />
        <Circle cx="19" cy="12" r="1.4" fill={color} stroke="none" />
        <Circle cx="5" cy="12" r="1.4" fill={color} stroke="none" />
      </>
    ),
    plus: <Path d="M12 5v14M5 12h14" {...s} />,
    search: (
      <>
        <Circle cx="11" cy="11" r="7" {...s} />
        <Path d="M21 21l-4.3-4.3" {...s} />
      </>
    ),
    spark: <Path d="M12 3l1.5 6L20 12l-6.5 1.5L12 21l-1.5-7.5L4 12l6.5-1.5L12 3z" {...s} />,
    wifi: (
      <>
        <Path d="M5 12.55a11 11 0 0 1 14 0" {...s} />
        <Path d="M8.5 16.1a6 6 0 0 1 7 0" {...s} />
        <Circle cx="12" cy="19.5" r="0.8" fill={color} stroke="none" />
      </>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {content[name]}
    </Svg>
  );
}
