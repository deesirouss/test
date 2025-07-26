import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserForm from '../../components/UserForm';

describe('UserForm Unit Tests', () => {
  const mockOnUserCreated = jest.fn();

  beforeEach(() => {
    mockOnUserCreated.mockClear();
  });

  test('renders form elements', () => {
    render(<UserForm onUserCreated={mockOnUserCreated} />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
  });

  test('calls onUserCreated with form data on submit', () => {
    render(<UserForm onUserCreated={mockOnUserCreated} />);
    
    const nameInput = screen.getByTestId('name-input');
    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);
    
    expect(mockOnUserCreated).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com'
    });
  });
});