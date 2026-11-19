/**
 * Contrast guard for the dark palette (WCAG 2.x relative luminance).
 * Every token that sets words must clear 4.5:1 on every surface it can sit on;
 * textTertiary is for non-text marks only and is deliberately NOT in this list.
 */
import { colors } from '@/theme/colors';

function lum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const c = colors.dark;
const grounds = { background: c.background, paper: c.paper, surface: c.surface, surfaceHi: c.surfaceHi };

describe('contrast()', () => {
  it('matches the WCAG reference values', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrast('#777777', '#777777')).toBeCloseTo(1, 5);
  });
});

describe('words clear 4.5:1 on every ground', () => {
  const wordTokens = { textPrimary: c.textPrimary, textBright: c.textBright, textSecondary: c.textSecondary, warn: c.warn };
  for (const [tn, tv] of Object.entries(wordTokens)) {
    for (const [gn, gv] of Object.entries(grounds)) {
      it(`${tn} on ${gn}`, () => {
        expect(contrast(tv, gv)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe('moonlight (the "kept" accent)', () => {
  it('is a data colour that reads on every ground', () => {
    for (const gv of Object.values(grounds)) expect(contrast(c.moon, gv)).toBeGreaterThanOrEqual(4.5);
  });
  it('carries a dark ✓ (the done button) above 4.5:1', () => {
    expect(contrast(c.background, c.moon)).toBeGreaterThanOrEqual(4.5);
  });
  it('is not amber (amber means careful) and not ivory (ivory is ink)', () => {
    expect(c.moon).not.toBe(c.warn);
    expect(c.moon).not.toBe(c.textPrimary);
  });
  it('is mirrored in the light palette, which equals dark (the app is dark-only)', () => {
    expect(colors.light.moon).toBe(c.moon);
  });
});

describe('the answered "not today" state', () => {
  it('reads clearly on its lifted surface (dash and outline)', () => {
    expect(contrast(c.textPrimary, c.surfaceHi)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.textSecondary, c.surfaceHi)).toBeGreaterThanOrEqual(3); // the outline: non-text, 3:1
  });
});

describe('disabled primary button', () => {
  it('label (textSecondary) on its surface fill stays readable', () => {
    expect(contrast(c.textSecondary, c.surface)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('switches', () => {
  it('ON thumb (background) is clear against the ON track (textPrimary)', () => {
    expect(contrast(c.background, c.textPrimary)).toBeGreaterThanOrEqual(4.5);
  });
  it('OFF thumb (textSecondary) is clear against the OFF track (surfaceHi), 3:1 for a control', () => {
    expect(contrast(c.textSecondary, c.surfaceHi)).toBeGreaterThanOrEqual(3);
  });
});
