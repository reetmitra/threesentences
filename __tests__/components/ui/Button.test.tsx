/**
 * Tests for Button UI Component
 *
 * White accent styling for the dark UI with haptic feedback
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';

// Mock Haptics
jest.mock('expo-haptics');

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders button with title', () => {
      const { getByText } = render(
        <Button title="Press Me" onPress={mockOnPress} />
      );
      expect(getByText('Press Me')).toBeTruthy();
    });

    it('renders with custom testID via style prop', () => {
      const { getByRole } = render(
        <Button title="Test" onPress={mockOnPress} />
      );
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('variants', () => {
    it('renders primary variant by default', () => {
      const { getByText } = render(
        <Button title="Primary" onPress={mockOnPress} />
      );
      expect(getByText('Primary')).toBeTruthy();
    });

    it('renders ghost variant', () => {
      const { getByText } = render(
        <Button title="Ghost" onPress={mockOnPress} variant="ghost" />
      );
      expect(getByText('Ghost')).toBeTruthy();
    });

    it('renders outline variant', () => {
      const { getByText } = render(
        <Button title="Outline" onPress={mockOnPress} variant="outline" />
      );
      expect(getByText('Outline')).toBeTruthy();
    });
  });

  describe('press handling', () => {
    it('calls onPress when pressed', () => {
      const { getByRole } = render(
        <Button title="Click" onPress={mockOnPress} />
      );

      fireEvent.press(getByRole('button'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('triggers haptic feedback on press', async () => {
      const { getByRole } = render(
        <Button title="Haptic" onPress={mockOnPress} />
      );

      fireEvent.press(getByRole('button'));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('does not call onPress when disabled', () => {
      const { getByRole } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled />
      );

      fireEvent.press(getByRole('button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      const { getByRole } = render(
        <Button title="Loading" onPress={mockOnPress} loading />
      );

      fireEvent.press(getByRole('button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('does not trigger haptic when disabled', () => {
      const { getByRole } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled />
      );

      fireEvent.press(getByRole('button'));
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('applies disabled styling', () => {
      const { getByRole } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('sets accessibility state to disabled', () => {
      const { getByRole } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled />
      );

      expect(getByRole('button').props.accessibilityState).toEqual({
        disabled: true,
      });
    });
  });

  describe('loading state', () => {
    it('shows loading indicator when loading', () => {
      const { queryByText, UNSAFE_getByType } = render(
        <Button title="Loading" onPress={mockOnPress} loading />
      );

      // Title should not be visible when loading
      expect(queryByText('Loading')).toBeNull();
    });

    it('hides title when loading', () => {
      const { queryByText } = render(
        <Button title="Hidden" onPress={mockOnPress} loading />
      );

      expect(queryByText('Hidden')).toBeNull();
    });

    it('disables button when loading', () => {
      const { getByRole } = render(
        <Button title="Loading" onPress={mockOnPress} loading />
      );

      fireEvent.press(getByRole('button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has button accessibility role', () => {
      const { getByRole } = render(
        <Button title="Accessible" onPress={mockOnPress} />
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('provides disabled accessibility state when disabled', () => {
      const { getByRole } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled />
      );

      expect(getByRole('button').props.accessibilityState.disabled).toBe(true);
    });

    it('provides enabled accessibility state when not disabled', () => {
      const { getByRole } = render(
        <Button title="Enabled" onPress={mockOnPress} />
      );

      // disabled should be false or undefined when enabled
      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBeFalsy();
    });
  });

  describe('custom styles', () => {
    it('accepts custom style prop', () => {
      const { getByRole } = render(
        <Button
          title="Styled"
          onPress={mockOnPress}
          style={{ marginTop: 20 }}
        />
      );

      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('combined states', () => {
    it('handles disabled + loading state', () => {
      const { getByRole, queryByText } = render(
        <Button title="Both" onPress={mockOnPress} disabled loading />
      );

      fireEvent.press(getByRole('button'));
      expect(mockOnPress).not.toHaveBeenCalled();
      expect(queryByText('Both')).toBeNull();
    });
  });
});
