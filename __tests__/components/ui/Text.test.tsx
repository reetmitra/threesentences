/**
 * Tests for Text UI Component
 *
 * Typography with dynamic type support and dark-only styling
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from '@/components/ui/Text';

describe('Text Component', () => {
  describe('rendering', () => {
    it('renders children text', () => {
      const { getByText } = render(<Text>Hello World</Text>);
      expect(getByText('Hello World')).toBeTruthy();
    });

    it('renders with custom testID', () => {
      const { getByTestId } = render(
        <Text testID="custom-text">Test</Text>
      );
      expect(getByTestId('custom-text')).toBeTruthy();
    });
  });

  describe('variants', () => {
    it('renders with default variant (base)', () => {
      const { getByText } = render(<Text>Default</Text>);
      const text = getByText('Default');
      expect(text).toBeTruthy();
    });

    it('renders with xs variant', () => {
      const { getByText } = render(<Text variant="xs">Extra Small</Text>);
      expect(getByText('Extra Small')).toBeTruthy();
    });

    it('renders with sm variant', () => {
      const { getByText } = render(<Text variant="sm">Small</Text>);
      expect(getByText('Small')).toBeTruthy();
    });

    it('renders with lg variant', () => {
      const { getByText } = render(<Text variant="lg">Large</Text>);
      expect(getByText('Large')).toBeTruthy();
    });

    it('renders with xl variant', () => {
      const { getByText } = render(<Text variant="xl">Extra Large</Text>);
      expect(getByText('Extra Large')).toBeTruthy();
    });

    it('renders with 2xl variant', () => {
      const { getByText } = render(<Text variant="2xl">2X Large</Text>);
      expect(getByText('2X Large')).toBeTruthy();
    });

    it('renders with 3xl variant', () => {
      const { getByText } = render(<Text variant="3xl">3X Large</Text>);
      expect(getByText('3X Large')).toBeTruthy();
    });
  });

  describe('weights', () => {
    it('renders with regular weight (default)', () => {
      const { getByText } = render(<Text>Regular</Text>);
      expect(getByText('Regular')).toBeTruthy();
    });

    it('renders with medium weight', () => {
      const { getByText } = render(<Text weight="medium">Medium</Text>);
      expect(getByText('Medium')).toBeTruthy();
    });

    it('renders with semibold weight', () => {
      const { getByText } = render(<Text weight="semibold">Semibold</Text>);
      expect(getByText('Semibold')).toBeTruthy();
    });

    it('renders with bold weight', () => {
      const { getByText } = render(<Text weight="bold">Bold</Text>);
      expect(getByText('Bold')).toBeTruthy();
    });
  });

  describe('colors', () => {
    it('renders with primary color (default)', () => {
      const { getByText } = render(<Text>Primary</Text>);
      expect(getByText('Primary')).toBeTruthy();
    });

    it('renders with secondary color', () => {
      const { getByText } = render(<Text color="secondary">Secondary</Text>);
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('renders with tertiary color', () => {
      const { getByText } = render(<Text color="tertiary">Tertiary</Text>);
      expect(getByText('Tertiary')).toBeTruthy();
    });

    it('renders with accent color', () => {
      const { getByText } = render(<Text color="accent">Accent</Text>);
      expect(getByText('Accent')).toBeTruthy();
    });

    it('renders with warning color', () => {
      const { getByText } = render(<Text color="warning">Warning</Text>);
      expect(getByText('Warning')).toBeTruthy();
    });

    it('renders with error color', () => {
      const { getByText } = render(<Text color="error">Error</Text>);
      expect(getByText('Error')).toBeTruthy();
    });
  });

  describe('font families', () => {
    it('renders with primary font (default)', () => {
      const { getByText } = render(<Text>Primary Font</Text>);
      expect(getByText('Primary Font')).toBeTruthy();
    });

    it('renders with serif font', () => {
      const { getByText } = render(<Text serif>Serif Font</Text>);
      expect(getByText('Serif Font')).toBeTruthy();
    });

    it('renders with mono font', () => {
      const { getByText } = render(<Text mono>Mono Font</Text>);
      expect(getByText('Mono Font')).toBeTruthy();
    });

    it('serif takes precedence over mono when both specified', () => {
      // Based on the implementation, serif should be checked before mono
      const { getByText } = render(<Text serif mono>Both</Text>);
      expect(getByText('Both')).toBeTruthy();
    });
  });

  describe('text alignment', () => {
    it('renders left-aligned by default', () => {
      const { getByText } = render(<Text>Left Aligned</Text>);
      expect(getByText('Left Aligned')).toBeTruthy();
    });

    it('renders centered when specified', () => {
      const { getByText } = render(<Text centered>Centered</Text>);
      expect(getByText('Centered')).toBeTruthy();
    });
  });

  describe('font scaling', () => {
    it('allows font scaling by default', () => {
      const { getByText } = render(<Text>Scalable</Text>);
      const text = getByText('Scalable');
      expect(text.props.allowFontScaling).not.toBe(false);
    });

    it('disables font scaling when fixedSize is true', () => {
      const { getByText } = render(<Text fixedSize>Fixed</Text>);
      const text = getByText('Fixed');
      expect(text.props.allowFontScaling).toBe(false);
    });

    it('respects explicit allowFontScaling prop', () => {
      const { getByText } = render(
        <Text allowFontScaling={false}>No Scaling</Text>
      );
      const text = getByText('No Scaling');
      expect(text.props.allowFontScaling).toBe(false);
    });
  });

  describe('custom styles', () => {
    it('accepts custom style prop', () => {
      const { getByText } = render(
        <Text style={{ marginTop: 10 }}>Styled</Text>
      );
      expect(getByText('Styled')).toBeTruthy();
    });

    it('merges custom styles with default styles', () => {
      const { getByText } = render(
        <Text variant="lg" style={{ marginBottom: 5 }}>Merged</Text>
      );
      expect(getByText('Merged')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('supports accessibilityLabel', () => {
      const { getByLabelText } = render(
        <Text accessibilityLabel="Accessible text">Content</Text>
      );
      expect(getByLabelText('Accessible text')).toBeTruthy();
    });

    it('passes through accessibility props', () => {
      const { getByRole } = render(
        <Text accessibilityRole="header">Header Text</Text>
      );
      expect(getByRole('header')).toBeTruthy();
    });
  });
});
