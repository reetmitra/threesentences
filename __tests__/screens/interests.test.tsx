/**
 * Tests for Interests Selection Screen
 *
 * Tests the interest category selection during signup flow.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { INTEREST_CATEGORIES } from '@/types/profile';

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: () => ({ name: 'Test User' }),
}));

// react-native-reanimated is mocked in jest.setup.js

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  Brain: () => null,
  Dumbbell: () => null,
  Palette: () => null,
  Target: () => null,
  Heart: () => null,
  Briefcase: () => null,
  TrendingUp: () => null,
  Activity: () => null,
  BookOpen: () => null,
  Sun: () => null,
  Compass: () => null,
  Users: () => null,
}));

// Mock profile store
jest.mock('@/store/profile', () => ({
  saveInterests: jest.fn().mockResolvedValue({}),
  createProfile: jest.fn().mockResolvedValue({}),
}));

// Mock auth store
jest.mock('@/store/auth', () => ({
  getCurrentUser: jest.fn().mockReturnValue({ id: 'test-user-id', name: 'Test User' }),
}));

// Import after mocks
import InterestsScreen from '@/app/(auth)/interests';
import { saveInterests, createProfile } from '@/store/profile';

describe('InterestsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header text', () => {
    const { getByText } = render(<InterestsScreen />);

    expect(getByText('What interests you?')).toBeTruthy();
  });

  it('renders all interest categories', () => {
    const { getByText } = render(<InterestsScreen />);

    INTEREST_CATEGORIES.forEach((category) => {
      expect(getByText(category.label)).toBeTruthy();
    });
  });

  it('shows selection counter', () => {
    const { getByText } = render(<InterestsScreen />);

    expect(getByText('0 selected')).toBeTruthy();
  });

  it('disables continue button when no interests selected', () => {
    const { getByText } = render(<InterestsScreen />);

    const button = getByText('Select at least one');
    expect(button).toBeTruthy();
  });

  it('updates counter when category is selected', async () => {
    const { getByText, getByLabelText } = render(<InterestsScreen />);

    // Select mindfulness category
    const chip = getByLabelText('Mindfulness, not selected');
    fireEvent.press(chip);

    await waitFor(() => {
      expect(getByText('1 selected')).toBeTruthy();
    });
  });

  it('enables continue button when interests are selected', async () => {
    const { getByText, getByLabelText } = render(<InterestsScreen />);

    // Select a category
    const chip = getByLabelText('Mindfulness, not selected');
    fireEvent.press(chip);

    await waitFor(() => {
      expect(getByText('Continue')).toBeTruthy();
    });
  });

  it('allows toggling selection off', async () => {
    const { getByText, getByLabelText } = render(<InterestsScreen />);

    // Select
    const chip = getByLabelText('Mindfulness, not selected');
    fireEvent.press(chip);

    // Deselect
    const selectedChip = getByLabelText('Mindfulness, selected');
    fireEvent.press(selectedChip);

    await waitFor(() => {
      expect(getByText('0 selected')).toBeTruthy();
    });
  });

  it('allows multiple selections', async () => {
    const { getByText, getByLabelText } = render(<InterestsScreen />);

    // Select multiple categories
    fireEvent.press(getByLabelText('Mindfulness, not selected'));
    fireEvent.press(getByLabelText('Fitness, not selected'));
    fireEvent.press(getByLabelText('Creativity, not selected'));

    await waitFor(() => {
      expect(getByText('3 selected')).toBeTruthy();
    });
  });

  it('shows encouraging message at 3+ selections', async () => {
    const { getByText, getByLabelText } = render(<InterestsScreen />);

    // Select 3 categories
    fireEvent.press(getByLabelText('Mindfulness, not selected'));
    fireEvent.press(getByLabelText('Fitness, not selected'));
    fireEvent.press(getByLabelText('Creativity, not selected'));

    await waitFor(() => {
      expect(getByText(/Great choices!/)).toBeTruthy();
    });
  });

  it('saves interests and navigates on continue', async () => {
    const { getByText, getByLabelText } = render(<InterestsScreen />);

    // Select a category
    fireEvent.press(getByLabelText('Mindfulness, not selected'));

    // Press continue
    await waitFor(() => {
      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);
    });

    await waitFor(() => {
      expect(saveInterests).toHaveBeenCalledWith(
        'test-user-id',
        expect.arrayContaining(['mindfulness'])
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/(auth)/profile-setup',
        })
      );
    });
  });

  it('shows hint about changing later', () => {
    const { getByText } = render(<InterestsScreen />);

    expect(getByText(/change these later/)).toBeTruthy();
  });

  it('initializes profile on mount', async () => {
    render(<InterestsScreen />);

    await waitFor(() => {
      expect(createProfile).toHaveBeenCalledWith('test-user-id', 'Test User');
    });
  });
});
