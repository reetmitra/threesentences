/**
 * Tests for Color Theme
 *
 * Monochromatic dark blue palette with white accents
 */

import { colors } from '@/theme/colors';

describe('colors theme', () => {
  describe('dark theme colors', () => {
    describe('core palette', () => {
      it('has background color defined', () => {
        expect(colors.dark.background).toBe('#06141B');
      });

      it('has surface color defined', () => {
        expect(colors.dark.surface).toBe('#11212D');
      });

      it('has surfaceHover color defined', () => {
        expect(colors.dark.surfaceHover).toBe('#253745');
      });

      it('has border color defined', () => {
        expect(colors.dark.border).toBe('#253745');
      });

      it('background is darkest in palette', () => {
        // Background should be darker than surface
        const bgValue = parseInt(colors.dark.background.slice(1), 16);
        const surfaceValue = parseInt(colors.dark.surface.slice(1), 16);
        expect(bgValue).toBeLessThan(surfaceValue);
      });

      it('surface is lighter than background', () => {
        const bgValue = parseInt(colors.dark.background.slice(1), 16);
        const surfaceValue = parseInt(colors.dark.surface.slice(1), 16);
        expect(surfaceValue).toBeGreaterThan(bgValue);
      });
    });

    describe('text hierarchy', () => {
      it('has textPrimary color defined', () => {
        expect(colors.dark.textPrimary).toBe('#E0E0E0');
      });

      it('has textSecondary color defined', () => {
        expect(colors.dark.textSecondary).toBe('#8899A6');
      });

      it('has textTertiary color defined', () => {
        expect(colors.dark.textTertiary).toBe('#4A5568');
      });

      it('primary text is brightest', () => {
        const primary = parseInt(colors.dark.textPrimary.slice(1), 16);
        const secondary = parseInt(colors.dark.textSecondary.slice(1), 16);
        const tertiary = parseInt(colors.dark.textTertiary.slice(1), 16);

        expect(primary).toBeGreaterThan(secondary);
        expect(secondary).toBeGreaterThan(tertiary);
      });
    });

    describe('accent colors', () => {
      it('has white accent for buttons', () => {
        expect(colors.dark.accent).toBe('#FFFFFF');
      });

      it('has accent hover state', () => {
        expect(colors.dark.accentHover).toBe('#E0E0E0');
      });

      it('has subtle accent for backgrounds', () => {
        expect(colors.dark.accentSubtle).toBe('#253745');
      });
    });

    describe('semantic colors', () => {
      it('has warning color (amber)', () => {
        expect(colors.dark.warning).toBe('#F0B429');
      });

      it('has error color (red)', () => {
        expect(colors.dark.error).toBe('#EF4444');
      });

      it('warning is amber/yellow hue', () => {
        // Warning should have high red and green, low blue
        const hex = colors.dark.warning.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        expect(r).toBeGreaterThan(200);
        expect(g).toBeGreaterThan(100);
        expect(b).toBeLessThan(100);
      });

      it('error is red hue', () => {
        const hex = colors.dark.error.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        expect(r).toBeGreaterThan(200);
        expect(g).toBeLessThan(100);
        expect(b).toBeLessThan(100);
      });
    });
  });

  describe('light theme (mirrors dark)', () => {
    it('light background matches dark background', () => {
      expect(colors.light.background).toBe(colors.dark.background);
    });

    it('light surface matches dark surface', () => {
      expect(colors.light.surface).toBe(colors.dark.surface);
    });

    it('light textPrimary matches dark textPrimary', () => {
      expect(colors.light.textPrimary).toBe(colors.dark.textPrimary);
    });

    it('light accent matches dark accent', () => {
      expect(colors.light.accent).toBe(colors.dark.accent);
    });

    it('all light colors match dark (app is dark-only)', () => {
      expect(colors.light).toEqual(colors.dark);
    });
  });

  describe('color format validity', () => {
    it('all colors are valid hex format', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;

      Object.values(colors.dark).forEach((color) => {
        expect(color).toMatch(hexRegex);
      });

      Object.values(colors.light).forEach((color) => {
        expect(color).toMatch(hexRegex);
      });
    });

    it('all required colors are present in dark theme', () => {
      const requiredColors = [
        'background',
        'surface',
        'surfaceHover',
        'border',
        'textPrimary',
        'textSecondary',
        'textTertiary',
        'accent',
        'accentHover',
        'accentSubtle',
        'warning',
        'error',
      ];

      requiredColors.forEach((colorKey) => {
        expect(colors.dark).toHaveProperty(colorKey);
      });
    });
  });

  describe('accessibility considerations', () => {
    it('primary text has sufficient contrast on background', () => {
      // Basic luminance check - primary text should be much lighter than background
      const textLum = parseInt(colors.dark.textPrimary.slice(1, 3), 16);
      const bgLum = parseInt(colors.dark.background.slice(1, 3), 16);

      expect(textLum).toBeGreaterThan(bgLum + 100);
    });

    it('accent (white) provides maximum contrast', () => {
      expect(colors.dark.accent).toBe('#FFFFFF');
    });
  });
});
