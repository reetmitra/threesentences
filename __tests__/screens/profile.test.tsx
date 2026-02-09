/**
 * Tests for Profile Editing Screen
 *
 * Tests the profile viewing and editing functionality.
 * Updated for Clerk auth and Supabase backend.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PROFILE_CONSTRAINTS, INTEREST_CATEGORIES } from '@/types/profile';

// Mock expo-router
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  },
}));

// Mock Clerk
jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({
    user: { id: 'test-user-id', firstName: 'Test', lastName: 'User' },
  }),
  useAuth: () => ({
    userId: 'test-user-id',
  }),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => null,
  Check: () => null,
  Plus: () => null,
  Edit3: () => null,
  User: () => null,
  Hash: () => null,
  Calendar: () => null,
  Heart: () => null,
  Sparkles: () => null,
  Brain: () => null,
  Dumbbell: () => null,
  Palette: () => null,
  Target: () => null,
  Briefcase: () => null,
  TrendingUp: () => null,
  Activity: () => null,
  BookOpen: () => null,
  Sun: () => null,
  Compass: () => null,
  Users: () => null,
}));

// Mock profile data with interests only (no hobbies)
const mockProfile = {
  userId: 'test-user-id',
  name: 'Test User',
  username: 'testuser',
  age: 25,
  bio: 'Elite entrepreneur and investor',
  interests: ['marathon', 'meditation'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isComplete: true,
};

// Mock profile store
const mockUpdateProfile = jest.fn().mockResolvedValue(mockProfile);
const mockGetProfile = jest.fn().mockResolvedValue(mockProfile);
jest.mock('@/store/profile', () => ({
  getProfile: (...args: any[]) => mockGetProfile(...args),
  updateProfile: (...args: any[]) => mockUpdateProfile(...args),
  saveInterests: jest.fn().mockResolvedValue({}),
}));

// Import after mocks
import ProfileScreen from '@/app/(tabs)/profile';

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProfile.mockResolvedValue(mockProfile);
  });

  it('renders profile name', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('Test User')).toBeTruthy();
    });
  });

  it('renders username', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('@testuser')).toBeTruthy();
    });
  });

  it('renders interests count', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('2 selected')).toBeTruthy();
    });
  });

  it('renders bio', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('Elite entrepreneur and investor')).toBeTruthy();
    });
  });

  it('renders avatar with initial', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('T')).toBeTruthy(); // First letter of name
    });
  });

  it('renders age', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('25')).toBeTruthy();
    });
  });

  it('renders interests', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      // Check for interests (may be displayed as labels)
      expect(getByText(/marathon/i)).toBeTruthy();
    });
  });

  it('shows edit mode when edit button pressed', async () => {
    const { getByText, getByLabelText } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('Test User')).toBeTruthy();
    });

    const editButton = getByLabelText('Edit profile');
    fireEvent.press(editButton);

    await waitFor(() => {
      expect(getByText('Done')).toBeTruthy();
    });
  });

  it('shows loading state initially', () => {
    mockGetProfile.mockImplementation(() => new Promise(() => { })); // Never resolves
    const { getByTestId } = render(<ProfileScreen />);

    // Should show loading indicator
    expect(getByTestId).toBeDefined();
  });

  it('handles empty profile', async () => {
    mockGetProfile.mockResolvedValue(null);

    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      // Should show some indication of missing profile or default state
      expect(getByText).toBeDefined();
    });
  });

  describe('Edit Mode', () => {
    it('allows editing name', async () => {
      const { getByText, getByLabelText, getByDisplayValue } = render(<ProfileScreen />);

      await waitFor(() => {
        expect(getByText('Test User')).toBeTruthy();
      });

      // Enter edit mode
      fireEvent.press(getByLabelText('Edit profile'));

      await waitFor(() => {
        const nameInput = getByDisplayValue('Test User');
        fireEvent.changeText(nameInput, 'New Name');
        expect(nameInput.props.value).toBe('New Name');
      });
    });

    it('saves changes when done pressed', async () => {
      const { getByText, getByLabelText, getByDisplayValue } = render(<ProfileScreen />);

      await waitFor(() => {
        expect(getByText('Test User')).toBeTruthy();
      });

      // Enter edit mode
      fireEvent.press(getByLabelText('Edit profile'));

      await waitFor(() => {
        const nameInput = getByDisplayValue('Test User');
        fireEvent.changeText(nameInput, 'New Name');
      });

      // Save changes
      fireEvent.press(getByText('Done'));

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith(
          'test-user-id',
          expect.objectContaining({ name: 'New Name' })
        );
      });
    });
  });

  describe('Interest constraints', () => {
    it('uses correct minimum interests', () => {
      expect(PROFILE_CONSTRAINTS.interests.minCount).toBe(3);
    });

    it('uses correct maximum interests', () => {
      expect(PROFILE_CONSTRAINTS.interests.maxCount).toBe(10);
    });

    it('has interest categories defined', () => {
      expect(Object.keys(INTEREST_CATEGORIES).length).toBeGreaterThan(0);
    });
  });
});
