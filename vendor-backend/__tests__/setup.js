process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.EMAIL_HOST = 'smtp.test';
process.env.EMAIL_PORT = '587';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'testpass';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Mock pg Pool to prevent any database connections
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
    on: jest.fn()
  };
  return {
    Pool: jest.fn(() => mockPool)
  };
});

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  end: jest.fn()
}));

jest.setTimeout(10000);

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
  console.log.mockRestore();
});
