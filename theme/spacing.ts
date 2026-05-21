// Spec spacing scale: 4/6/8/10/12/14/16/18/20/22/24/28/32/40/48/56/64/72/80/100/120 px
export const spacing = {
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  4.5: 18,
  5: 20,
  5.5: 22,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  18: 72,
  20: 80,
  25: 100,
  30: 120,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 999,
} as const;

export const componentRadius = {
  button: 999,      // pill
  chip: 999,        // pill
  input: 10,
  card: 16,
  modal: 24,
  bottomSheet: 16,  // top corners only when bottom-anchored
} as const;

// Phone edge horizontal padding per spec
export const edgePadding = {
  content: 24,
  header: 20,
} as const;
