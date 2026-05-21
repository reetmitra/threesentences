/**
 * Tests for Color Theme
 *
 * Noir editorial palette — bone-ivory ink on near-black canvas
 */

import { colors } from '@/theme/colors';

describe('colors theme', () => {
  describe('dark theme colors', () => {
    describe('core palette', () => {
      it('has background color defined', () => {
        expect(colors.dark.background).toBeTruthy();
      });

      it('has surface color defined', () => {
        expect(colors.dark.surface).toBeTruthy();
      });

      it('has surfaceHi color defined', () => {
        expect(colors.dark.surfaceHi).toBeTruthy();
      });

      it('has frame (border) color defined', () => {
        expect(colors.dark.frame).toBeTruthy();
      });

      it('background is darkest in palette', () => {
        // background (#060608) < paper (#0e0e10) < surface (#15151a)
        expect(colors.dark.background < colors.dark.surface).toBe(true);
      });
    });

    // 2. Text colors
    describe('text hierarchy', () => {
      it('has textPrimary color defined', () => {
        expect(colors.dark.textPrimary).toBeTruthy();
      });

      it('has textBright color defined', () => {
        expect(colors.dark.textBright).toBeTruthy();
      });

      it('has textSecondary color defined', () => {
        expect(colors.dark.textSecondary).toBeTruthy();
      });

      it('has textTertiary color defined', () => {
        expect(colors.dark.textTertiary).toBeTruthy();
      });

      it('primary text is brighter than secondary', () => {
        expect(colors.dark.textPrimary > colors.dark.textSecondary).toBe(true);
      });
    });

    // 3. Accent colors
    describe('accent colors', () => {
      it('has accent defined', () => {
        expect(colors.dark.accent).toBeTruthy();
      });

      it('has subtle accent for backgrounds', () => {
        expect(colors.dark.accentSubtle).toBeTruthy();
      });
    });

    describe('semantic colors', () => {
      it('has warn color (amber) defined', () => {
        expect(colors.dark.warn).toBeTruthy();
      });

      it('has warning alias defined', () => {
        expect(colors.dark.warning).toBeTruthy();
      });

      it('has error alias defined', () => {
        expect(colors.dark.error).toBeTruthy();
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
        'paper',
        'surface',
        'surfaceHi',
        'frame',
        'textPrimary',
        'textBright',
        'textSecondary',
        'textTertiary',
        'accent',
        'accentSubtle',
        'warn',
        'warning',
        'error',
      ];

      requiredColors.forEach((colorKey) => {
        expect(colors.dark).toHaveProperty(colorKey);
      });
    });
  });
});
