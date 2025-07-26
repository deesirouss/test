import '@testing-library/jest-dom';

// Global test utilities and mocks

// Mock window methods that aren't available in jsdom
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(() => true)
});

Object.defineProperty(window, 'alert', {
  writable: true,
  value: jest.fn()
});

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});