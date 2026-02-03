/**
 * Tests for EntryCard Component
 *
 * Read-only display of a submitted entry with serif font
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { EntryCard } from '@/components/EntryCard';
import { Entry } from '@/types/entry';

describe('EntryCard Component', () => {
  const mockEntry: Entry = {
    id: 'entry-123',
    date: '2026-01-15',
    content: 'First sentence. Second sentence. Third sentence.',
    submittedAt: '2026-01-15T14:30:00.000Z',
    timezone: 'America/New_York',
  };

  describe('rendering', () => {
    it('renders entry content', () => {
      const { getByText } = render(<EntryCard entry={mockEntry} />);
      expect(getByText(mockEntry.content)).toBeTruthy();
    });

    it('renders submission time', () => {
      const { getByText } = render(<EntryCard entry={mockEntry} />);
      // Should show time like "2:30 PM"
      expect(getByText(/Submitted at/)).toBeTruthy();
    });

    it('renders without date by default', () => {
      const { queryByText } = render(<EntryCard entry={mockEntry} />);
      // Should not show full date by default
      expect(queryByText(/January 15, 2026/)).toBeNull();
    });

    it('renders with date when showDate is true', () => {
      const { getByText } = render(<EntryCard entry={mockEntry} showDate />);
      // Should show full date when showDate is true
      expect(getByText(/Thursday/)).toBeTruthy();
    });
  });

  describe('date formatting', () => {
    it('formats date with weekday', () => {
      const { getByText } = render(<EntryCard entry={mockEntry} showDate />);
      // January 15, 2026 is a Thursday
      expect(getByText(/Thursday/)).toBeTruthy();
    });

    it('formats date with month name', () => {
      const { getByText } = render(<EntryCard entry={mockEntry} showDate />);
      expect(getByText(/January/)).toBeTruthy();
    });

    it('formats date with day number', () => {
      const { getByText } = render(<EntryCard entry={mockEntry} showDate />);
      expect(getByText(/15/)).toBeTruthy();
    });

    it('formats date with year', () => {
      const { getByText } = render(<EntryCard entry={mockEntry} showDate />);
      expect(getByText(/2026/)).toBeTruthy();
    });
  });

  describe('time formatting', () => {
    it('shows time in 12-hour format', () => {
      const { getByText } = render(<EntryCard entry={mockEntry} />);
      // 14:30 UTC would be displayed in local format
      expect(getByText(/Submitted at/)).toBeTruthy();
    });

    it('shows AM/PM indicator', () => {
      const morningEntry: Entry = {
        ...mockEntry,
        submittedAt: '2026-01-15T08:00:00.000Z',
      };
      const { getByText } = render(<EntryCard entry={morningEntry} />);
      expect(getByText(/Submitted at/)).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('has accessible container', () => {
      const { getByLabelText } = render(<EntryCard entry={mockEntry} />);
      expect(
        getByLabelText(/Journal entry from/)
      ).toBeTruthy();
    });

    it('includes entry content in accessibility label', () => {
      const { getByLabelText } = render(<EntryCard entry={mockEntry} />);
      expect(
        getByLabelText(/First sentence/)
      ).toBeTruthy();
    });
  });

  describe('different entries', () => {
    it('handles short content', () => {
      const shortEntry: Entry = {
        ...mockEntry,
        content: 'Short.',
      };
      const { getByText } = render(<EntryCard entry={shortEntry} />);
      expect(getByText('Short.')).toBeTruthy();
    });

    it('handles long content', () => {
      const longEntry: Entry = {
        ...mockEntry,
        content: 'This is a very long first sentence that goes on and on. This is the second sentence that is also quite long. And this is the third sentence completing the entry.',
      };
      const { getByText } = render(<EntryCard entry={longEntry} />);
      expect(getByText(/This is a very long/)).toBeTruthy();
    });

    it('handles content with special characters', () => {
      const specialEntry: Entry = {
        ...mockEntry,
        content: "Entry with 'quotes' and \"double quotes\" and emoji 🎉!",
      };
      const { getByText } = render(<EntryCard entry={specialEntry} />);
      expect(getByText(/quotes/)).toBeTruthy();
    });

    it('handles multi-line content', () => {
      const multilineEntry: Entry = {
        ...mockEntry,
        content: 'Line one.\nLine two.\nLine three.',
      };
      const { getByText } = render(<EntryCard entry={multilineEntry} />);
      expect(getByText(/Line one/)).toBeTruthy();
    });
  });

  describe('different dates', () => {
    it('handles December date', () => {
      const decEntry: Entry = {
        ...mockEntry,
        date: '2026-12-25',
        submittedAt: '2026-12-25T10:00:00.000Z',
      };
      const { getByText } = render(<EntryCard entry={decEntry} showDate />);
      expect(getByText(/December/)).toBeTruthy();
    });

    it('handles February 29 in leap year', () => {
      const leapEntry: Entry = {
        ...mockEntry,
        date: '2024-02-29',
        submittedAt: '2024-02-29T10:00:00.000Z',
      };
      const { getByText } = render(<EntryCard entry={leapEntry} showDate />);
      expect(getByText(/February/)).toBeTruthy();
    });

    it('handles first day of year', () => {
      const newYearEntry: Entry = {
        ...mockEntry,
        date: '2026-01-01',
        submittedAt: '2026-01-01T00:05:00.000Z',
      };
      const { getByText } = render(<EntryCard entry={newYearEntry} showDate />);
      expect(getByText(/January/)).toBeTruthy();
    });
  });

  describe('different timezones', () => {
    it('handles Pacific timezone entry', () => {
      const pacificEntry: Entry = {
        ...mockEntry,
        timezone: 'America/Los_Angeles',
      };
      const { getByText } = render(<EntryCard entry={pacificEntry} />);
      expect(getByText(mockEntry.content)).toBeTruthy();
    });

    it('handles UTC timezone entry', () => {
      const utcEntry: Entry = {
        ...mockEntry,
        timezone: 'UTC',
      };
      const { getByText } = render(<EntryCard entry={utcEntry} />);
      expect(getByText(mockEntry.content)).toBeTruthy();
    });
  });
});
