import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserList from '../../components/UserList';

describe('UserList Unit Tests', () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  let mockOnUserDeleted;

  beforeEach(() => {
    mockOnUserDeleted = jest.fn();
    // Reset window.confirm for each test
    window.confirm.mockClear();
  });

  test('renders users list correctly', () => {
    render(<UserList users={mockUsers} onUserDeleted={mockOnUserDeleted} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Users (2)')).toBeInTheDocument();
  });

  test('renders empty state when no users provided', () => {
    render(<UserList users={[]} onUserDeleted={mockOnUserDeleted} />);
    
    expect(screen.getByText('No users found')).toBeInTheDocument();
    expect(screen.getByText('Users (0)')).toBeInTheDocument();
  });

  test('calls onUserDeleted when delete is confirmed', () => {
    window.confirm.mockReturnValue(true);
    render(<UserList users={mockUsers} onUserDeleted={mockOnUserDeleted} />);
    
    const deleteButton = screen.getByTestId('delete-user-1');
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete user "John Doe"?');
    expect(mockOnUserDeleted).toHaveBeenCalledWith(1);
  });

  test('does not call onUserDeleted when delete is cancelled', () => {
    window.confirm.mockReturnValue(false);
    render(<UserList users={mockUsers} onUserDeleted={mockOnUserDeleted} />);
    
    const deleteButton = screen.getByTestId('delete-user-1');
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete user "John Doe"?');
    expect(mockOnUserDeleted).not.toHaveBeenCalled();
  });

  test('renders correct number of delete buttons', () => {
    render(<UserList users={mockUsers} onUserDeleted={mockOnUserDeleted} />);
    
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2);
  });
});