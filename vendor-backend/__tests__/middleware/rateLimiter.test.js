jest.mock('express-rate-limit', () => (options) => {
  const middleware = (req, res, next) => next();
  Object.assign(middleware, options);
  return middleware;
});

const {
  messageLimiter,
  listingCreationLimiter,
  registrationLimiter,
  loginLimiter
} = require('../../src/middleware/rateLimiter');

describe('rateLimiter middleware', () => {
  it('exports middleware functions', () => {
    expect(typeof messageLimiter).toBe('function');
    expect(typeof listingCreationLimiter).toBe('function');
    expect(typeof registrationLimiter).toBe('function');
    expect(typeof loginLimiter).toBe('function');
  });

  it('uses user-based key for listing creation', () => {
    expect(typeof listingCreationLimiter.keyGenerator).toBe('function');
    const key = listingCreationLimiter.keyGenerator({ user: { userId: 7 } });
    expect(key).toBe('user_7');
  });

  it('skips listing limiter when unauthenticated', () => {
    expect(listingCreationLimiter.skip({})).toBe(true);
  });

  it('uses user-based key for message limiter', () => {
    expect(typeof messageLimiter.keyGenerator).toBe('function');
    const key = messageLimiter.keyGenerator({ user: { userId: 3 } });
    expect(key).toBe('user_3');
  });

  it('skips message limiter when unauthenticated', () => {
    expect(messageLimiter.skip({})).toBe(true);
  });
});
