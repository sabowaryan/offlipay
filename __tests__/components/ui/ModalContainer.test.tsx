import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ModalContainer from '@/components/ui/ModalContainer';

// Mock des dépendances
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    colors: {
      BACKGROUND: '#FFFFFF',
      TEXT: '#000000',
      GRAY_MEDIUM: '#666666',
      GRAY_LIGHT: '#EEEEEE',
    },
  }),
}));

describe('ModalContainer', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    children: <div>Test content</div>,
  };

  it('renders correctly with default props', () => {
    const { getByText } = render(<ModalContainer {...defaultProps} />);
    
    expect(getByText('Test content')).toBeTruthy();
  });

  it('renders with title and subtitle', () => {
    const props = {
      ...defaultProps,
      title: 'Test Title',
      subtitle: 'Test Subtitle',
    };
    
    const { getByText } = render(<ModalContainer {...props} />);
    
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Subtitle')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const props = {
      ...defaultProps,
      onClose,
    };
    
    const { getByTestId } = render(<ModalContainer {...props} />);
    
    const closeButton = getByTestId('modal-close-button');
    fireEvent.press(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when showCloseButton is false', () => {
    const props = {
      ...defaultProps,
      showCloseButton: false,
    };
    
    const { queryByTestId } = render(<ModalContainer {...props} />);
    
    expect(queryByTestId('modal-close-button')).toBeNull();
  });

  it('applies custom maxHeight', () => {
    const props = {
      ...defaultProps,
      maxHeight: 500,
    };
    
    const { getByTestId } = render(<ModalContainer {...props} />);
    
    const modalContent = getByTestId('modal-content');
    expect(modalContent.props.style).toContainEqual({ maxHeight: 500 });
  });
}); 