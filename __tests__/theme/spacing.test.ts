/**
 * Tests for Spacing Theme
 *
 * Noir editorial spacing scale: 4/6/8/10/12/14/16/18/20/22/24/28/32/40/48/56/64/72/80/100/120 px
 */

import { spacing, radius, componentRadius } from '@/theme/spacing';

describe('spacing theme', () => {
  describe('spacing scale', () => {
    it('uses 4px as base unit', () => {
      expect(spacing[1]).toBe(4);
    });

    it('has correct spacing values', () => {
      expect(spacing[1]).toBe(4);
      expect(spacing[2]).toBe(8);
      expect(spacing[3]).toBe(12);
      expect(spacing[4]).toBe(16);
      expect(spacing[5]).toBe(20);
      expect(spacing[6]).toBe(24);
      expect(spacing[8]).toBe(32);
      expect(spacing[10]).toBe(40);
      expect(spacing[12]).toBe(48);
      expect(spacing[16]).toBe(64);
      expect(spacing[20]).toBe(80);
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
      expect(radius.full).toBe(999);
    });

    it('radius values increase progressively', () => {
      expect(radius.sm).toBeLessThan(radius.md);
      expect(radius.md).toBeLessThan(radius.lg);
      expect(radius.lg).toBeLessThan(radius.xl);
      expect(radius.xl).toBeLessThan(radius.full);
    });
  });

  describe('component radius defaults', () => {
    it('has button radius (pill)', () => {
      expect(componentRadius.button).toBe(999);
    });

    it('has input radius (10px)', () => {
      expect(componentRadius.input).toBe(10);
    });

    it('has card radius (16px)', () => {
      expect(componentRadius.card).toBe(16);
    });

    it('has modal radius (24px)', () => {
      expect(componentRadius.modal).toBe(24);
    });

    it('all component radii are valid numbers', () => {
      Object.values(componentRadius).forEach((value) => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('consistency checks', () => {
    it('button radius is pill (999)', () => {
      expect(componentRadius.button).toBe(radius.full);
    });

    it('input radius is between md and lg', () => {
      expect(componentRadius.input).toBeGreaterThan(radius.md);
      expect(componentRadius.input).toBeLessThan(radius.lg + 2);
    });

    it('card radius matches xl radius', () => {
      expect(componentRadius.card).toBe(radius.xl);
    });

    it('modal radius matches 3xl radius', () => {
      expect(componentRadius.modal).toBe(radius['3xl']);
    });
  });
});
