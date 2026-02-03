/**
 * Tests for Spacing Theme
 *
 * 4px-based spacing scale for consistent layout
 */

import { spacing, radius, componentRadius } from '@/theme/spacing';

describe('spacing theme', () => {
  describe('spacing scale', () => {
    it('uses 4px as base unit', () => {
      expect(spacing[1]).toBe(4);
    });

    it('has correct spacing values based on 4px scale', () => {
      expect(spacing[1]).toBe(4);   // 1 * 4
      expect(spacing[2]).toBe(8);   // 2 * 4
      expect(spacing[3]).toBe(12);  // 3 * 4
      expect(spacing[4]).toBe(16);  // 4 * 4
      expect(spacing[5]).toBe(20);  // 5 * 4
      expect(spacing[6]).toBe(24);  // 6 * 4
      expect(spacing[8]).toBe(32);  // 8 * 4
      expect(spacing[10]).toBe(40); // 10 * 4
      expect(spacing[12]).toBe(48); // 12 * 4
      expect(spacing[16]).toBe(64); // 16 * 4
      expect(spacing[20]).toBe(80); // 20 * 4
    });

    it('all values are multiples of 4', () => {
      Object.values(spacing).forEach((value) => {
        expect(value % 4).toBe(0);
      });
    });

    it('values increase progressively', () => {
      const keys = Object.keys(spacing).map(Number).sort((a, b) => a - b);
      for (let i = 1; i < keys.length; i++) {
        const currentKey = keys[i] as keyof typeof spacing;
        const prevKey = keys[i - 1] as keyof typeof spacing;
        expect(spacing[currentKey]).toBeGreaterThan(spacing[prevKey]);
      }
    });
  });

  describe('radius scale', () => {
    it('has small radius (4px)', () => {
      expect(radius.sm).toBe(4);
    });

    it('has medium radius (8px)', () => {
      expect(radius.md).toBe(8);
    });

    it('has large radius (12px)', () => {
      expect(radius.lg).toBe(12);
    });

    it('has extra large radius (16px)', () => {
      expect(radius.xl).toBe(16);
    });

    it('has full radius for circular elements', () => {
      expect(radius.full).toBe(9999);
    });

    it('radius values increase progressively', () => {
      expect(radius.sm).toBeLessThan(radius.md);
      expect(radius.md).toBeLessThan(radius.lg);
      expect(radius.lg).toBeLessThan(radius.xl);
      expect(radius.xl).toBeLessThan(radius.full);
    });
  });

  describe('component radius defaults', () => {
    it('has button radius (12px)', () => {
      expect(componentRadius.button).toBe(12);
    });

    it('has input radius (8px)', () => {
      expect(componentRadius.input).toBe(8);
    });

    it('has card radius (12px)', () => {
      expect(componentRadius.card).toBe(12);
    });

    it('has modal radius (16px)', () => {
      expect(componentRadius.modal).toBe(16);
    });

    it('all component radii are valid numbers', () => {
      Object.values(componentRadius).forEach((value) => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('consistency checks', () => {
    it('button radius matches lg radius', () => {
      expect(componentRadius.button).toBe(radius.lg);
    });

    it('input radius matches md radius', () => {
      expect(componentRadius.input).toBe(radius.md);
    });

    it('card radius matches lg radius', () => {
      expect(componentRadius.card).toBe(radius.lg);
    });

    it('modal radius matches xl radius', () => {
      expect(componentRadius.modal).toBe(radius.xl);
    });
  });
});
