// Jest setup file
// This file runs before all tests

// Set test environment
process.env.NODE_ENV = 'test';

// Set test database URI
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/hacklahoma2026_test';

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress logs in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
