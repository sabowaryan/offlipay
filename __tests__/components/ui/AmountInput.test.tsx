import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AmountInput from '@/components/ui/AmountInput';

// Mock des dépendances
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    colors: {
      BACKGROUND: '#FFFFFF',
      TEXT: '#000000',
      GRAY_MEDIUM: '#666666',
      GRAY_LIGHT: '#EEEEEE',
      PRIMARY: '#007AFF',
      ERROR: '#FF3B30',
    },
  }),
}));

describe('AmountInput', () => {
  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
  };

  it('renders correctly with default props', () => {
    const { getByPlaceholderText } = render(<AmountInput {...defaultProps} />);
    
    expect(getByPlaceholderText('0.00')).toBeTruthy();
  });

  it('displays the current value', () => {
    const props = {
      ...defaultProps,
      value: '100.50',
    };
    
    const { getByDisplayValue } = render(<AmountInput {...props} />);
    
    expect(getByDisplayValue('100.50')).toBeTruthy();
  });

  it('calls onChangeText when input changes', () => {
    const onChangeText = jest.fn();
    const props = {
      ...defaultProps,
      onChangeText,
    };
    
    const { getByPlaceholderText } = render(<AmountInput {...props} />);
    
    const input = getByPlaceholderText('0.00');
    fireEvent.changeText(input, '50.00');
    
    expect(onChangeText).toHaveBeenCalledWith('50.00');
  });

  it('displays error message when error prop is provided', () => {
    const props = {
      ...defaultProps,
      error: 'Montant invalide',
    };
    
    const { getByText } = render(<AmountInput {...props} />);
    
    expect(getByText('Montant invalide')).toBeTruthy();
  });

  it('renders quick amount buttons when provided', () => {
    const props = {
      ...defaultProps,
      quickAmounts: [10, 25, 50, 100],
    };
    
    const { getByText } = render(<AmountInput {...props} />);
    
    expect(getByText('10€')).toBeTruthy();
    expect(getByText('25€')).toBeTruthy();
    expect(getByText('50€')).toBeTruthy();
    expect(getByText('100€')).toBeTruthy();
  });

  it('calls onQuickAmountPress when quick amount button is pressed', () => {
    const onQuickAmountPress = jest.fn();
    const props = {
      ...defaultProps,
      quickAmounts: [10, 25, 50, 100],
      onQuickAmountPress,
    };
    
    const { getByText } = render(<AmountInput {...props} />);
    
    const quickButton = getByText('25€');
    fireEvent.press(quickButton);
    
    expect(onQuickAmountPress).toHaveBeenCalledWith(25);
  });

  it('applies error styling when error is present', () => {
    const props = {
      ...defaultProps,
      error: 'Montant invalide',
    };
    
    const { getByTestId } = render(<AmountInput {...props} />);
    
    const inputContainer = getByTestId('amount-input-container');
    expect(inputContainer.props.style).toContainEqual({ borderColor: '#FF3B30' });
  });

  it('uses custom currency symbol', () => {
    const props = {
      ...defaultProps,
      currency: '$',
    };
    
    const { getByText } = render(<AmountInput {...props} />);
    
    expect(getByText('$')).toBeTruthy();
  });
}); 