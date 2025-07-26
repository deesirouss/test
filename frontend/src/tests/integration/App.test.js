import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from '../../App';

// Mock axios instead of userService for better integration testing
jest.mock('axios');
const mockedAxios = axios;

describe('App Integration Tests', () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default successful response
    mockedAxios.get.mockResolvedValue({ data: mockUsers });
    mockedAxios.post.mockResolvedValue({ 
      data: { id: 3, name: 'New User', email: 'new@example.com' } 
    });
    mockedAxios.delete.mockResolvedValue({ data: {} });
  });

  test('loads and displays users on mount', async () => {
    render(<App />);
    
    // Check loading state first - use regex for flexibility
    expect(screen.getByText(/loading users/i)).toBeInTheDocument();
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });
    
    // Verify API was called
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/users')
    );
  });

  test('displays loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/loading users/i)).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    const errorMessage = 'Failed to fetch users';
    mockedAxios.get.mockRejectedValue(new Error(errorMessage));
    
    render(<App />);
    
    await waitFor(() => {
      // Use partial text matching to handle split text
      expect(screen.getByText(/Failed to fetch users/i)).toBeInTheDocument();
    });
    
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  test('displays empty state when no users returned', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });
});