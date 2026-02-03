/**
 * Tests for Logo363 Component
 *
 * Tests the 363 logo component rendering and props.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Logo363 } from '@/components/ui/Logo363';

describe('Logo363 Component', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<Logo363 />);
    expect(getByText('363')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { getByText } = render(<Logo363 size={120} />);
    const logo = getByText('363');
    expect(logo).toBeTruthy();
  });

  it('renders with custom color', () => {
    const { getByText } = render(<Logo363 color="#FF0000" />);
    const logo = getByText('363');
    expect(logo).toBeTruthy();
  });

  it('renders with animation disabled', () => {
    const { getByText } = render(<Logo363 animated={false} />);
    const logo = getByText('363');
    expect(logo).toBeTruthy();
  });

  it('renders with animation enabled', () => {
    const { getByText } = render(<Logo363 animated={true} />);
    const logo = getByText('363');
    expect(logo).toBeTruthy();
  });

  it('uses default props when none provided', () => {
    const { getByText } = render(<Logo363 />);
    const logo = getByText('363');
    expect(logo).toBeTruthy();
  });

  it('displays the correct text content', () => {
    const { getByText } = render(<Logo363 />);
    expect(getByText('363')).toBeTruthy();
  });
});
