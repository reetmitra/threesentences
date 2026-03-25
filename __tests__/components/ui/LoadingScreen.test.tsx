/**
 * Tests for LoadingScreen Component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Path: 'Path',
}));

describe('LoadingScreen', () => {
  it('renders without crashing', () => {
    expect(() => render(<LoadingScreen />)).not.toThrow();
  });

  it('displays the word mark', () => {
    const { getByText } = render(<LoadingScreen />);
    expect(getByText('THREE')).toBeTruthy();
  });

  it('displays the tagline', () => {
    const { getByText } = render(<LoadingScreen />);
    expect(getByText('be better, do better')).toBeTruthy();
  });
});
