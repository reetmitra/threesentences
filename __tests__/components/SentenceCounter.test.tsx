/**
 * Tests for SentenceCounter Component
 *
 * Displays current sentence count in "X/3" format
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { SentenceCounter } from '@/components/SentenceCounter';

describe('SentenceCounter Component', () => {
  describe('rendering', () => {
    it('renders count display', () => {
      const { getByText } = render(<SentenceCounter count={0} />);
      expect(getByText('0/3')).toBeTruthy();
    });

    it('renders with custom target', () => {
      const { getByText } = render(<SentenceCounter count={2} target={5} />);
      expect(getByText('2/5')).toBeTruthy();
    });

    it('renders default target of 3', () => {
      const { getByText } = render(<SentenceCounter count={1} />);
      expect(getByText('1/3')).toBeTruthy();
    });
  });

  describe('count display', () => {
    it('displays 0/3 for zero sentences', () => {
      const { getByText } = render(<SentenceCounter count={0} />);
      expect(getByText('0/3')).toBeTruthy();
    });

    it('displays 1/3 for one sentence', () => {
      const { getByText } = render(<SentenceCounter count={1} />);
      expect(getByText('1/3')).toBeTruthy();
    });

    it('displays 2/3 for two sentences', () => {
      const { getByText } = render(<SentenceCounter count={2} />);
      expect(getByText('2/3')).toBeTruthy();
    });

    it('displays 3/3 for three sentences (complete)', () => {
      const { getByText } = render(<SentenceCounter count={3} />);
      expect(getByText('3/3')).toBeTruthy();
    });

    it('displays 4/3 for over target', () => {
      const { getByText } = render(<SentenceCounter count={4} />);
      expect(getByText('4/3')).toBeTruthy();
    });
  });

  describe('status hints', () => {
    it('shows "Ready to submit" when complete (3/3)', () => {
      const { getByText } = render(<SentenceCounter count={3} />);
      expect(getByText('Ready to submit')).toBeTruthy();
    });

    it('shows "Too many sentences" when over target', () => {
      const { getByText } = render(<SentenceCounter count={4} />);
      expect(getByText('Too many sentences')).toBeTruthy();
    });

    it('does not show hint when incomplete', () => {
      const { queryByText } = render(<SentenceCounter count={2} />);
      expect(queryByText('Ready to submit')).toBeNull();
      expect(queryByText('Too many sentences')).toBeNull();
    });

    it('does not show hint for zero sentences', () => {
      const { queryByText } = render(<SentenceCounter count={0} />);
      expect(queryByText('Ready to submit')).toBeNull();
      expect(queryByText('Too many sentences')).toBeNull();
    });
  });

  describe('custom target', () => {
    it('shows ready hint at custom target', () => {
      const { getByText } = render(<SentenceCounter count={5} target={5} />);
      expect(getByText('Ready to submit')).toBeTruthy();
    });

    it('shows over hint when exceeding custom target', () => {
      const { getByText } = render(<SentenceCounter count={6} target={5} />);
      expect(getByText('Too many sentences')).toBeTruthy();
    });

    it('does not show hint when below custom target', () => {
      const { queryByText } = render(<SentenceCounter count={3} target={5} />);
      expect(queryByText('Ready to submit')).toBeNull();
      expect(queryByText('Too many sentences')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('has accessibility label', () => {
      const { getByLabelText } = render(<SentenceCounter count={2} />);
      expect(getByLabelText('2 of 3 sentences')).toBeTruthy();
    });

    it('has correct accessibility label for complete', () => {
      const { getByLabelText } = render(<SentenceCounter count={3} />);
      expect(getByLabelText('3 of 3 sentences')).toBeTruthy();
    });

    it('has correct accessibility label for custom target', () => {
      const { getByLabelText } = render(<SentenceCounter count={4} target={5} />);
      expect(getByLabelText('4 of 5 sentences')).toBeTruthy();
    });

    it('has text accessibility role', () => {
      const { getByRole } = render(<SentenceCounter count={2} />);
      expect(getByRole('text')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles very large count', () => {
      const { getByText } = render(<SentenceCounter count={100} />);
      expect(getByText('100/3')).toBeTruthy();
    });

    it('handles target of 1', () => {
      const { getByText } = render(<SentenceCounter count={1} target={1} />);
      expect(getByText('1/1')).toBeTruthy();
      expect(getByText('Ready to submit')).toBeTruthy();
    });

    it('handles target of 0 (edge case)', () => {
      const { getByText } = render(<SentenceCounter count={0} target={0} />);
      expect(getByText('0/0')).toBeTruthy();
    });
  });
});
