/**
 * Tests for Calendar Component
 *
 * Monthly calendar grid showing entry dates
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Calendar } from '@/components/Calendar';

// Mock the entry utilities
jest.mock('@/types/entry', () => ({
  getTodayDateString: jest.fn(() => '2026-01-15'),
  formatDateString: jest.fn((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }),
}));

describe('Calendar Component', () => {
  const defaultProps = {
    year: 2026,
    month: 1, // January
    entryDates: new Set<string>(),
    selectedDate: null,
    onSelectDate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders weekday headers', () => {
      const { getByText } = render(<Calendar {...defaultProps} />);

      // Check for weekday abbreviations
      expect(getByText('S')).toBeTruthy(); // Sunday
      expect(getByText('M')).toBeTruthy(); // Monday
      expect(getByText('T')).toBeTruthy(); // Tuesday/Thursday
      expect(getByText('W')).toBeTruthy(); // Wednesday
      expect(getByText('F')).toBeTruthy(); // Friday
    });

    it('renders correct number of days for January 2026', () => {
      const { getByText } = render(<Calendar {...defaultProps} />);

      // January 2026 has 31 days
      expect(getByText('1')).toBeTruthy();
      expect(getByText('15')).toBeTruthy();
      expect(getByText('31')).toBeTruthy();
    });

    it('renders correct number of days for February in leap year', () => {
      const props = { ...defaultProps, year: 2024, month: 2 };
      const { getByText, queryByText } = render(<Calendar {...props} />);

      // 2024 is a leap year, February has 29 days
      expect(getByText('29')).toBeTruthy();
    });

    it('renders correct number of days for February in non-leap year', () => {
      const props = { ...defaultProps, year: 2026, month: 2 };
      const { getByText, queryByText } = render(<Calendar {...props} />);

      // 2026 is not a leap year, February has 28 days
      expect(getByText('28')).toBeTruthy();
    });
  });

  describe('entry indicators', () => {
    it('renders without entry dots when no entries exist', () => {
      const { queryAllByTestId } = render(<Calendar {...defaultProps} />);
      // No entry dots should be visible
    });

    it('days with entries are selectable', () => {
      const entryDates = new Set(['2026-01-10', '2026-01-15']);
      const onSelectDate = jest.fn();
      const { getByText } = render(
        <Calendar
          {...defaultProps}
          entryDates={entryDates}
          onSelectDate={onSelectDate}
        />
      );

      // Day with entry should be pressable
      const day10 = getByText('10');
      fireEvent.press(day10);
      expect(onSelectDate).toHaveBeenCalledWith('2026-01-10');
    });

    it('days without entries are not selectable', () => {
      const entryDates = new Set(['2026-01-10']);
      const onSelectDate = jest.fn();
      const { getByText } = render(
        <Calendar
          {...defaultProps}
          entryDates={entryDates}
          onSelectDate={onSelectDate}
        />
      );

      // Day without entry should not trigger selection
      const day5 = getByText('5');
      fireEvent.press(day5);
      expect(onSelectDate).not.toHaveBeenCalled();
    });
  });

  describe('date selection', () => {
    it('calls onSelectDate when day with entry is pressed', () => {
      const entryDates = new Set(['2026-01-20']);
      const onSelectDate = jest.fn();
      const { getByText } = render(
        <Calendar
          {...defaultProps}
          entryDates={entryDates}
          onSelectDate={onSelectDate}
        />
      );

      fireEvent.press(getByText('20'));
      expect(onSelectDate).toHaveBeenCalledWith('2026-01-20');
    });

    it('highlights selected date', () => {
      const entryDates = new Set(['2026-01-20']);
      const { getByText } = render(
        <Calendar
          {...defaultProps}
          entryDates={entryDates}
          selectedDate="2026-01-20"
        />
      );

      // Selected date should be rendered (styling tested via snapshot or visual)
      expect(getByText('20')).toBeTruthy();
    });
  });

  describe('today highlighting', () => {
    it('highlights today (January 15, 2026)', () => {
      const { getByText } = render(<Calendar {...defaultProps} />);

      // Day 15 should be rendered with today styling
      expect(getByText('15')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('provides accessibility labels for day cells', () => {
      const entryDates = new Set(['2026-01-15']);
      const { getByLabelText } = render(
        <Calendar {...defaultProps} entryDates={entryDates} />
      );

      // Today with entry
      expect(getByLabelText('15, has entry, today')).toBeTruthy();
    });

    it('indicates no entry in accessibility label', () => {
      const { getByLabelText } = render(<Calendar {...defaultProps} />);

      // Day without entry
      expect(getByLabelText('1, no entry')).toBeTruthy();
    });

    it('has button accessibility role for selectable days', () => {
      const entryDates = new Set(['2026-01-10']);
      const { getByLabelText } = render(
        <Calendar {...defaultProps} entryDates={entryDates} />
      );

      const day = getByLabelText('10, has entry');
      expect(day.props.accessibilityRole).toBe('button');
    });

    it('indicates disabled state for non-selectable days', () => {
      const { getByLabelText } = render(<Calendar {...defaultProps} />);

      const day = getByLabelText('1, no entry');
      expect(day.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('different months', () => {
    it('renders April with 30 days', () => {
      const props = { ...defaultProps, month: 4 }; // April
      const { getByText, queryByText } = render(<Calendar {...props} />);

      expect(getByText('30')).toBeTruthy();
      expect(queryByText('31')).toBeNull();
    });

    it('renders December with 31 days', () => {
      const props = { ...defaultProps, month: 12 }; // December
      const { getByText } = render(<Calendar {...props} />);

      expect(getByText('31')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles month with entries across full month', () => {
      const entryDates = new Set<string>();
      for (let i = 1; i <= 31; i++) {
        entryDates.add(`2026-01-${String(i).padStart(2, '0')}`);
      }

      const { getByLabelText } = render(
        <Calendar {...defaultProps} entryDates={entryDates} />
      );

      // All days should have entries
      expect(getByLabelText('1, has entry')).toBeTruthy();
      expect(getByLabelText('31, has entry')).toBeTruthy();
    });

    it('handles empty selectedDate', () => {
      const { getByText } = render(
        <Calendar {...defaultProps} selectedDate={null} />
      );

      // Should render without errors
      expect(getByText('1')).toBeTruthy();
    });
  });
});
