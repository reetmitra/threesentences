/**
 * Tests for Typography Theme
 *
 * Per PRD Section 7.3: Dynamic type support - interface scales with system font size
 */

import { PixelRatio } from 'react-native';
import {
  getFontScale,
  scaleFontSize,
  typography,
  getScaledFontSizes,
} from '@/theme/typography';

// Mock PixelRatio
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  PixelRatio: {
    getFontScale: jest.fn(() => 1),
  },
}));

describe('typography theme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFontScale', () => {
    it('returns system font scale', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(1.0);
      expect(getFontScale()).toBe(1.0);
    });

    it('returns increased font scale when accessibility setting is higher', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(1.3);
      expect(getFontScale()).toBe(1.3);
    });

    it('returns decreased font scale when accessibility setting is lower', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(0.9);
      expect(getFontScale()).toBe(0.9);
    });
  });

  describe('scaleFontSize', () => {
    it('returns same size when scale is 1', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(1.0);
      expect(scaleFontSize(16)).toBe(16);
    });

    it('scales up font size correctly', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(1.25);
      expect(scaleFontSize(16)).toBe(20); // 16 * 1.25 = 20
    });

    it('scales down font size correctly', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(0.9);
      expect(scaleFontSize(20)).toBe(18); // 20 * 0.9 = 18
    });

    it('clamps scale at minimum 0.8', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(0.5);
      // Should use 0.8 instead of 0.5
      expect(scaleFontSize(20)).toBe(16); // 20 * 0.8 = 16
    });

    it('clamps scale at maximum 1.5', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(2.0);
      // Should use 1.5 instead of 2.0
      expect(scaleFontSize(20)).toBe(30); // 20 * 1.5 = 30
    });

    it('rounds to nearest integer', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(1.1);
      expect(scaleFontSize(15)).toBe(17); // 15 * 1.1 = 16.5 -> 17
    });
  });

  describe('typography object', () => {
    describe('fontFamily', () => {
      it('has primary font family', () => {
        expect(typography.fontFamily.primary).toBeDefined();
      });

      it('has serif font family', () => {
        expect(typography.fontFamily.serif).toBeDefined();
      });

      it('has mono font family', () => {
        expect(typography.fontFamily.mono).toBeDefined();
      });

      it('uses system font for primary on iOS', () => {
        expect(typography.fontFamily.primary).toBe('System');
      });
    });

    describe('fontSize', () => {
      it('has xs size (12)', () => {
        expect(typography.fontSize.xs).toBe(12);
      });

      it('has sm size (14)', () => {
        expect(typography.fontSize.sm).toBe(14);
      });

      it('has base size (16)', () => {
        expect(typography.fontSize.base).toBe(16);
      });

      it('has lg size (18)', () => {
        expect(typography.fontSize.lg).toBe(18);
      });

      it('has xl size (20)', () => {
        expect(typography.fontSize.xl).toBe(20);
      });

      it('has 2xl size (24)', () => {
        expect(typography.fontSize['2xl']).toBe(24);
      });

      it('has 3xl size (30)', () => {
        expect(typography.fontSize['3xl']).toBe(30);
      });

      it('sizes increase progressively', () => {
        const sizes = [
          typography.fontSize.xs,
          typography.fontSize.sm,
          typography.fontSize.base,
          typography.fontSize.lg,
          typography.fontSize.xl,
          typography.fontSize['2xl'],
          typography.fontSize['3xl'],
        ];

        for (let i = 1; i < sizes.length; i++) {
          expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
        }
      });
    });

    describe('fontWeight', () => {
      it('has regular weight (400)', () => {
        expect(typography.fontWeight.regular).toBe('400');
      });

      it('has medium weight (500)', () => {
        expect(typography.fontWeight.medium).toBe('500');
      });

      it('has semibold weight (600)', () => {
        expect(typography.fontWeight.semibold).toBe('600');
      });

      it('has bold weight (700)', () => {
        expect(typography.fontWeight.bold).toBe('700');
      });

      it('weights are string values (React Native requirement)', () => {
        Object.values(typography.fontWeight).forEach((weight) => {
          expect(typeof weight).toBe('string');
        });
      });
    });

    describe('lineHeight', () => {
      it('has tight line height (1.25)', () => {
        expect(typography.lineHeight.tight).toBe(1.25);
      });

      it('has normal line height (1.5)', () => {
        expect(typography.lineHeight.normal).toBe(1.5);
      });

      it('has relaxed line height (1.75)', () => {
        expect(typography.lineHeight.relaxed).toBe(1.75);
      });
    });
  });

  describe('getScaledFontSizes', () => {
    it('returns all font size variants', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(1.0);
      const sizes = getScaledFontSizes();

      expect(sizes).toHaveProperty('xs');
      expect(sizes).toHaveProperty('sm');
      expect(sizes).toHaveProperty('base');
      expect(sizes).toHaveProperty('lg');
      expect(sizes).toHaveProperty('xl');
      expect(sizes).toHaveProperty('2xl');
      expect(sizes).toHaveProperty('3xl');
    });

    it('returns base sizes when scale is 1', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(1.0);
      const sizes = getScaledFontSizes();

      expect(sizes.xs).toBe(12);
      expect(sizes.sm).toBe(14);
      expect(sizes.base).toBe(16);
      expect(sizes.lg).toBe(18);
      expect(sizes.xl).toBe(20);
      expect(sizes['2xl']).toBe(24);
      expect(sizes['3xl']).toBe(30);
    });

    it('returns scaled sizes when scale is increased', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(1.25);
      const sizes = getScaledFontSizes();

      expect(sizes.base).toBe(20); // 16 * 1.25
      expect(sizes.lg).toBe(23); // 18 * 1.25 = 22.5 -> 23
    });

    it('returns clamped sizes when scale is extreme', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(0.5);
      const sizes = getScaledFontSizes();

      // Should use clamped scale of 0.8
      expect(sizes.base).toBe(13); // 16 * 0.8 = 12.8 -> 13
    });
  });

  describe('PRD compliance', () => {
    it('supports dynamic type (PRD 7.3)', () => {
      // Verify the scaling mechanism exists
      expect(typeof getFontScale).toBe('function');
      expect(typeof scaleFontSize).toBe('function');
      expect(typeof getScaledFontSizes).toBe('function');
    });

    it('has serif font for reading past entries (PRD 8.2)', () => {
      expect(typography.fontFamily.serif).toBeDefined();
    });

    it('has mono font for sentence counter (PRD 8.2)', () => {
      expect(typography.fontFamily.mono).toBeDefined();
    });
  });
});
