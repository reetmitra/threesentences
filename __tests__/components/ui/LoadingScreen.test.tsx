/**
 * Tests for LoadingScreen Component
 *
 * Tests the loading screen component rendering.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

describe('LoadingScreen Component', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<LoadingScreen />);
    expect(getByText('363')).toBeTruthy();
  });

  it('displays the app title', () => {
    const { getByText } = render(<LoadingScreen />);
    expect(getByText('Three Sentences')).toBeTruthy();
  });

  it('displays the tagline', () => {
    const { getByText } = render(<LoadingScreen />);
    expect(getByText('be better, do better.')).toBeTruthy();
  });

  it('displays the brand footer', () => {
    const { getByText } = render(<LoadingScreen />);
    expect(getByText('THREESIXTYTHREE')).toBeTruthy();
  });

  it('renders the Logo363 component', () => {
    const { getByText } = render(<LoadingScreen />);
    // Logo363 renders "363" text
    expect(getByText('363')).toBeTruthy();
  });

  it('renders all required elements', () => {
    const { getByText } = render(<LoadingScreen />);

    expect(getByText('363')).toBeTruthy();
    expect(getByText('Three Sentences')).toBeTruthy();
    expect(getByText('be better, do better.')).toBeTruthy();
    expect(getByText('THREESIXTYTHREE')).toBeTruthy();
  });
});
