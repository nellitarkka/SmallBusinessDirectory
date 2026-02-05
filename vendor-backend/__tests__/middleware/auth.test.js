const jwt = require('jsonwebtoken');
const { authenticate, requireRole, requireEmailVerification } = require('../../src/middleware/auth');
const User = require('../../src/models/user');
const { createMockResponse } = require('../helpers');

jest.mock('../../src/models/user');

describe('auth middleware', () => {
  it('authenticate rejects missing token', () => {
    const req = { headers: {} };
    const res = createMockResponse();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('authenticate rejects invalid token', () => {
    jwt.verify = jest.fn(() => { throw new Error('bad'); });
    const req = { headers: { authorization: 'Bearer token' } };
    const res = createMockResponse();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('authenticate sets req.user', () => {
    jwt.verify = jest.fn(() => ({ userId: 3, role: 'vendor' }));
    const req = { headers: { authorization: 'Bearer token' } };
    const res = createMockResponse();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(req.user).toEqual({ userId: 3, role: 'vendor' });
    expect(next).toHaveBeenCalled();
  });

  it('requireRole rejects missing user', () => {
    const req = {};
    const res = createMockResponse();
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('requireRole rejects wrong role', () => {
    const req = { user: { role: 'customer' } };
    const res = createMockResponse();
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('requireRole allows correct role', () => {
    const req = { user: { role: 'admin' } };
    const res = createMockResponse();
    const next = jest.fn();

    requireRole('admin')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  describe('requireEmailVerification', () => {
    it('rejects missing user', async () => {
      const req = {};
      const res = createMockResponse();
      const next = jest.fn();

      await requireEmailVerification(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('rejects unknown user', async () => {
      User.findById.mockResolvedValue(null);
      const req = { user: { userId: 1 } };
      const res = createMockResponse();
      const next = jest.fn();

      await requireEmailVerification(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('rejects unverified user', async () => {
      User.findById.mockResolvedValue({ is_email_verified: false });
      const req = { user: { userId: 1 } };
      const res = createMockResponse();
      const next = jest.fn();

      await requireEmailVerification(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('allows verified user', async () => {
      User.findById.mockResolvedValue({ is_email_verified: true });
      const req = { user: { userId: 1 } };
      const res = createMockResponse();
      const next = jest.fn();

      await requireEmailVerification(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
