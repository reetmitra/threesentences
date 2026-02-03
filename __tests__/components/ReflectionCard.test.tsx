/**
 * Tests for ReflectionCard Component
 *
 * Displays AI-generated reflection with mandatory disclaimer
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { ReflectionCard } from '@/components/ReflectionCard';
import { Reflection, REFLECTION_DISCLAIMER } from '@/services/aiReflection';

describe('ReflectionCard Component', () => {
  const mockReflection: Reflection = {
    id: 'reflection-123',
    generatedAt: '2026-01-15T14:30:00.000Z',
    timeRange: 7,
    content: 'Looking at your entries, you seem to focus on productivity and self-improvement. Is there a particular goal driving this focus?',
    entriesAnalyzed: 5,
    hasCrisisIndicators: false,
  };

  describe('rendering', () => {
    it('renders reflection content', () => {
      const { getByText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByText(/Looking at your entries/)).toBeTruthy();
    });

    it('renders formatted date', () => {
      const { getByText } = render(<ReflectionCard reflection={mockReflection} />);
      // January 15, 2026 is a Thursday
      expect(getByText(/Thursday/)).toBeTruthy();
    });

    it('renders time range badge', () => {
      const { getByText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByText('Past 7 days')).toBeTruthy();
    });

    it('renders entries analyzed count', () => {
      const { getByText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByText('Based on 5 entries')).toBeTruthy();
    });

    it('renders mandatory disclaimer', () => {
      const { getByText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByText(REFLECTION_DISCLAIMER)).toBeTruthy();
    });
  });

  describe('time range labels', () => {
    it('displays "Past 7 days" for 7-day range', () => {
      const { getByText } = render(
        <ReflectionCard reflection={{ ...mockReflection, timeRange: 7 }} />
      );
      expect(getByText('Past 7 days')).toBeTruthy();
    });

    it('displays "Past 30 days" for 30-day range', () => {
      const { getByText } = render(
        <ReflectionCard reflection={{ ...mockReflection, timeRange: 30 }} />
      );
      expect(getByText('Past 30 days')).toBeTruthy();
    });

    it('displays "Past 90 days" for 90-day range', () => {
      const { getByText } = render(
        <ReflectionCard reflection={{ ...mockReflection, timeRange: 90 }} />
      );
      expect(getByText('Past 90 days')).toBeTruthy();
    });
  });

  describe('entries count display', () => {
    it('uses singular "entry" for single entry', () => {
      const { getByText } = render(
        <ReflectionCard reflection={{ ...mockReflection, entriesAnalyzed: 1 }} />
      );
      expect(getByText('Based on 1 entry')).toBeTruthy();
    });

    it('uses plural "entries" for multiple entries', () => {
      const { getByText } = render(
        <ReflectionCard reflection={{ ...mockReflection, entriesAnalyzed: 5 }} />
      );
      expect(getByText('Based on 5 entries')).toBeTruthy();
    });

    it('handles zero entries', () => {
      const { getByText } = render(
        <ReflectionCard reflection={{ ...mockReflection, entriesAnalyzed: 0 }} />
      );
      expect(getByText('Based on 0 entries')).toBeTruthy();
    });

    it('handles large number of entries', () => {
      const { getByText } = render(
        <ReflectionCard reflection={{ ...mockReflection, entriesAnalyzed: 100 }} />
      );
      expect(getByText('Based on 100 entries')).toBeTruthy();
    });
  });

  describe('date formatting', () => {
    it('includes weekday', () => {
      const { getByText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByText(/Thursday/)).toBeTruthy();
    });

    it('includes month name', () => {
      const { getByText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByText(/January/)).toBeTruthy();
    });

    it('includes day', () => {
      const { getByText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByText(/15/)).toBeTruthy();
    });

    it('includes year', () => {
      const { getByText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByText(/2026/)).toBeTruthy();
    });

    it('formats different dates correctly', () => {
      const decemberReflection = {
        ...mockReflection,
        generatedAt: '2026-12-25T10:00:00.000Z',
      };
      const { getByText } = render(<ReflectionCard reflection={decemberReflection} />);
      expect(getByText(/December/)).toBeTruthy();
      expect(getByText(/Friday/)).toBeTruthy(); // Dec 25, 2026 is Friday
    });
  });

  describe('different content', () => {
    it('renders short content', () => {
      const shortReflection = {
        ...mockReflection,
        content: 'Brief reflection.',
      };
      const { getByText } = render(<ReflectionCard reflection={shortReflection} />);
      expect(getByText('Brief reflection.')).toBeTruthy();
    });

    it('renders long content', () => {
      const longReflection = {
        ...mockReflection,
        content: 'A'.repeat(500),
      };
      const { getByText } = render(<ReflectionCard reflection={longReflection} />);
      expect(getByText('A'.repeat(500))).toBeTruthy();
    });

    it('renders multi-paragraph content', () => {
      const multiParagraphReflection = {
        ...mockReflection,
        content: 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.',
      };
      const { getByText } = render(<ReflectionCard reflection={multiParagraphReflection} />);
      expect(getByText(/First paragraph/)).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('has accessibility label', () => {
      const { getByLabelText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByLabelText(/AI reflection from/)).toBeTruthy();
    });

    it('includes date in accessibility label', () => {
      const { getByLabelText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByLabelText(/Thursday/)).toBeTruthy();
    });
  });

  describe('PRD compliance', () => {
    it('always displays disclaimer (PRD FR-AI-05)', () => {
      const { getByText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByText(/not mental health advice/)).toBeTruthy();
    });

    it('disclaimer mentions AI generation', () => {
      const { getByText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByText(/AI/)).toBeTruthy();
    });

    it('disclaimer recommends professional consultation', () => {
      const { getByText } = render(<ReflectionCard reflection={mockReflection} />);
      expect(getByText(/mental health professional/)).toBeTruthy();
    });
  });
});
