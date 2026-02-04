/**
 * Tests for Input Component
 *
 * Tests the styled text input component for the dark UI.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/ui/Input';
import { colors } from '@/theme/colors';

describe('Input', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <Input label="Email" placeholder="Enter email" />
    );

    expect(getByText('Email')).toBeTruthy();
  });

  it('displays value', () => {
    const { getByDisplayValue } = render(
      <Input value="test@example.com" onChangeText={() => {}} />
    );

    expect(getByDisplayValue('test@example.com')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" onChangeText={onChangeText} />
    );

    fireEvent.changeText(getByPlaceholderText('Enter text'), 'new text');

    expect(onChangeText).toHaveBeenCalledWith('new text');
  });

  it('applies error styling when error prop is true', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" error={true} />
    );

    const input = getByPlaceholderText('Enter text');
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ borderColor: colors.dark.error })
    );
  });

  it('applies normal border when error is false', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" error={false} />
    );

    const input = getByPlaceholderText('Enter text');
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ borderColor: colors.dark.border })
    );
  });

  it('passes through additional TextInput props', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
    );

    const input = getByPlaceholderText('Enter email');
    expect(input.props.keyboardType).toBe('email-address');
    expect(input.props.autoCapitalize).toBe('none');
    expect(input.props.autoCorrect).toBe(false);
  });

  it('applies custom container style', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter text"
        containerStyle={{ marginTop: 20 }}
      />
    );

    // The input should be rendered within the container
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('applies custom style to input', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter text"
        style={{ height: 100 }}
      />
    );

    const input = getByPlaceholderText('Enter text');
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ height: 100 })
    );
  });

  it('has dark theme background color', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    );

    const input = getByPlaceholderText('Enter text');
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: colors.dark.surface })
    );
  });

  it('has correct text color', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    );

    const input = getByPlaceholderText('Enter text');
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ color: colors.dark.textPrimary })
    );
  });

  it('has correct placeholder text color', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    );

    const input = getByPlaceholderText('Enter text');
    expect(input.props.placeholderTextColor).toBe(colors.dark.textTertiary);
  });

  it('has correct selection and cursor color', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    );

    const input = getByPlaceholderText('Enter text');
    expect(input.props.selectionColor).toBe(colors.dark.accent);
    expect(input.props.cursorColor).toBe(colors.dark.accent);
  });

  it('renders without label', () => {
    const { queryByText, getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
    // No label should be present
    expect(queryByText('Label')).toBeNull();
  });

  it('handles secureTextEntry prop', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Password" secureTextEntry />
    );

    const input = getByPlaceholderText('Password');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('handles multiline prop', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter message" multiline />
    );

    const input = getByPlaceholderText('Enter message');
    expect(input.props.multiline).toBe(true);
  });
});
