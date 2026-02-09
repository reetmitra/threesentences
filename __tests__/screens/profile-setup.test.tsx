/**
 * Tests for Profile Setup Screen
 *
 * Tests the profile setup flow including username, age, and bio.
 * Updated for Clerk auth and bio-based profile.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PROFILE_CONSTRAINTS, USERNAME_CONSTRAINTS } from '@/types/profile';

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: mockReplace,
    back: jest.fn(),
  },
  useLocalSearchParams: () => ({ name: 'Test User' }),
}));

// Mock Clerk
jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({
    user: { id: 'test-user-id', firstName: 'Test', lastName: 'User' },
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
  Plus: () => null,
  Check: () => null,
}));

// Mock profile store
const mockUpdateProfile = jest.fn().mockResolvedValue({});
const mockCompleteProfileSetup = jest.fn().mockResolvedValue({});
jest.mock('@/store/profile', () => ({
  updateProfile: (...args: any[]) => mockUpdateProfile(...args),
  completeProfileSetup: (...args: any[]) => mockCompleteProfileSetup(...args),
  getProfile: jest.fn().mockResolvedValue(null),
}));

// Import after mocks
import ProfileSetupScreen from '@/app/(auth)/profile-setup';

describe('ProfileSetupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header text', () => {
    const { getByText } = render(<ProfileSetupScreen />);
    expect(getByText('Complete Your Profile')).toBeTruthy();
  });

  it('renders username input', () => {
    const { getByText, getByPlaceholderText } = render(<ProfileSetupScreen />);
    expect(getByText('Username *')).toBeTruthy();
    expect(getByPlaceholderText('username')).toBeTruthy();
  });

  it('renders age input', () => {
    const { getByText, getByPlaceholderText } = render(<ProfileSetupScreen />);
    expect(getByText('Age (optional)')).toBeTruthy();
  });

  it('renders bio section', () => {
    const { getByText } = render(<ProfileSetupScreen />);
    expect(getByText('Bio (optional)')).toBeTruthy();
  });

  it('shows bio character counter', () => {
    const { getByText } = render(<ProfileSetupScreen />);
    expect(getByText(`0/${PROFILE_CONSTRAINTS.bio.maxLength}`)).toBeTruthy();
  });

  it('validates username on input', async () => {
    const { getByPlaceholderText, queryByText } = render(<ProfileSetupScreen />);

    const usernameInput = getByPlaceholderText('username');
    fireEvent.changeText(usernameInput, 'ab'); // Too short

    await waitFor(() => {
      expect(queryByText(/at least/i)).toBeTruthy();
    });
  });

  it('converts username to lowercase', () => {
    const { getByPlaceholderText } = render(<ProfileSetupScreen />);

    const usernameInput = getByPlaceholderText('username');
    fireEvent.changeText(usernameInput, 'TestUser');

    expect(usernameInput.props.value).toBe('testuser');
  });

  it('removes invalid characters from username', () => {
    const { getByPlaceholderText } = render(<ProfileSetupScreen />);

    const usernameInput = getByPlaceholderText('username');
    fireEvent.changeText(usernameInput, 'test@user!name');

    expect(usernameInput.props.value).toBe('testusername');
  });

  it('validates age for minimum 18', async () => {
    const { getByPlaceholderText, queryByText } = render(<ProfileSetupScreen />);

    const ageInput = getByPlaceholderText(/age/i);
    fireEvent.changeText(ageInput, '16'); // Too young (now 18+)

    await waitFor(() => {
      expect(queryByText(/at least.*18/i)).toBeTruthy();
    });
  });

  it('only allows numbers in age field', () => {
    const { getByPlaceholderText } = render(<ProfileSetupScreen />);

    const ageInput = getByPlaceholderText(/age/i);
    fireEvent.changeText(ageInput, 'abc25def');

    expect(ageInput.props.value).toBe('25');
  });

  it('limits bio to max length', () => {
    const { getByPlaceholderText } = render(<ProfileSetupScreen />);

    const bioInput = getByPlaceholderText(/bio/i);
    const longText = 'a'.repeat(200);
    fireEvent.changeText(bioInput, longText);

    // Bio should be truncated to max length
    expect(bioInput.props.value.length).toBeLessThanOrEqual(PROFILE_CONSTRAINTS.bio.maxLength);
  });

  it('submits profile and navigates to tabs', async () => {
    const { getByPlaceholderText, getByText } = render(<ProfileSetupScreen />);

    // Enter valid username
    const usernameInput = getByPlaceholderText('username');
    fireEvent.changeText(usernameInput, 'validuser');

    // Submit
    const submitButton = getByText("Let's Go");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          username: 'validuser',
        })
      );
      expect(mockCompleteProfileSetup).toHaveBeenCalledWith('test-user-id');
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('submits with bio when provided', async () => {
    const { getByPlaceholderText, getByText } = render(<ProfileSetupScreen />);

    // Enter valid username
    const usernameInput = getByPlaceholderText('username');
    fireEvent.changeText(usernameInput, 'validuser');

    // Enter bio
    const bioInput = getByPlaceholderText(/bio/i);
    fireEvent.changeText(bioInput, 'Elite entrepreneur');

    // Submit
    fireEvent.press(getByText("Let's Go"));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          bio: 'Elite entrepreneur',
        })
      );
    });
  });
});
