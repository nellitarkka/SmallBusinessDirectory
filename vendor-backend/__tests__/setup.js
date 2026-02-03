// Test setup file
const pool = require('../src/config/database');

// Close database connection after all tests
afterAll(async () => {
  await pool.end();
  // Give a small delay for cleanup
  await new Promise(resolve => setTimeout(resolve, 500));
});

// Set test timeout
jest.setTimeout(10000);
