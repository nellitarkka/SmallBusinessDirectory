const jwt = require('jsonwebtoken');
const authController = require('../../src/controllers/authController');
const User = require('../../src/models/user');
const Vendor = require('../../src/models/vendor');
const emailService = require('../../src/services/emailService');
const { createMockResponse } = require('../helpers');

jest.mock('../../src/models/user');
jest.mock('../../src/models/vendor');
jest.mock('../../src/services/emailService');

describe('authController', () => {
  beforeEach(() => {
    jwt.sign = jest.fn().mockReturnValue('jwt-token');
  });

  describe('register', () => {
    it('rejects duplicate email', async () => {
      User.findByEmail.mockResolvedValue({ id: 1 });
      const req = { body: { email: 'a@test.com' } };
      const res = createMockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(User.create).not.toHaveBeenCalled();
    });

    it('creates vendor user and sends verification', async () => {
      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: 10, email: 'v@test.com', role: 'vendor', first_name: 'V', last_name: 'User', is_email_verified: false });
      Vendor.create.mockResolvedValue({ id: 99 });
      User.createVerificationToken.mockResolvedValue({ token: 'verify-token', user: { id: 10 } });
      emailService.sendVerificationEmail.mockResolvedValue({ success: true });

      const req = {
        body: {
          email: 'v@test.com',
          password: 'TestPass123',
          role: 'vendor',
          firstName: 'V',
          lastName: 'User',
          businessName: 'Vendor Inc',
          city: 'Lux',
          vatNumber: 'VAT'
        }
      };
      const res = createMockResponse();

      await authController.register(req, res);

      expect(Vendor.create).toHaveBeenCalled();
      expect(User.createVerificationToken).toHaveBeenCalledWith(10);
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('fails when token generation fails', async () => {
      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: 10, email: 'v@test.com', role: 'customer' });
      User.createVerificationToken.mockRejectedValue(new Error('token fail'));

      const req = { body: { email: 'v@test.com', password: 'TestPass123', role: 'customer', firstName: 'A', lastName: 'B' } };
      const res = createMockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('continues when email service fails', async () => {
      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: 10, email: 'c@test.com', role: 'customer', first_name: 'C', last_name: 'User', is_email_verified: false });
      User.createVerificationToken.mockResolvedValue({ token: 'verify-token', user: { id: 10 } });
      emailService.sendVerificationEmail.mockRejectedValue(new Error('smtp fail'));

      const req = { body: { email: 'c@test.com', password: 'TestPass123', role: 'customer', firstName: 'C', lastName: 'User' } };
      const res = createMockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('login', () => {
    it('rejects missing user', async () => {
      User.findByEmail.mockResolvedValue(null);
      const req = { body: { email: 'missing@test.com', password: 'TestPass123' } };
      const res = createMockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('rejects invalid password', async () => {
      User.findByEmail.mockResolvedValue({ id: 1, password_hash: 'hash', role: 'customer' });
      User.verifyPassword.mockResolvedValue(false);
      const req = { body: { email: 'x@test.com', password: 'bad' } };
      const res = createMockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('rejects role mismatch', async () => {
      User.findByEmail.mockResolvedValue({ id: 1, password_hash: 'hash', role: 'customer' });
      User.verifyPassword.mockResolvedValue(true);
      const req = { body: { email: 'x@test.com', password: 'good', role: 'vendor' } };
      const res = createMockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('logs in with valid credentials', async () => {
      User.findByEmail.mockResolvedValue({ id: 1, email: 'x@test.com', password_hash: 'hash', role: 'customer', first_name: 'A', last_name: 'B' });
      User.verifyPassword.mockResolvedValue(true);
      const req = { body: { email: 'x@test.com', password: 'good' } };
      const res = createMockResponse();

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('rejects missing fields', async () => {
      const req = { body: {}, user: { userId: 1 } };
      const res = createMockResponse();

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects unknown user', async () => {
      User.findById.mockResolvedValue(null);
      const req = { body: { currentPassword: 'old', newPassword: 'newpassword' }, user: { userId: 1 } };
      const res = createMockResponse();

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('rejects incorrect current password', async () => {
      User.findById.mockResolvedValue({ id: 1, password_hash: 'hash' });
      User.verifyPassword.mockResolvedValue(false);
      const req = { body: { currentPassword: 'old', newPassword: 'newpassword' }, user: { userId: 1 } };
      const res = createMockResponse();

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('updates password', async () => {
      User.findById.mockResolvedValue({ id: 1, password_hash: 'hash' });
      User.verifyPassword.mockResolvedValue(true);
      User.updatePassword.mockResolvedValue({ id: 1 });
      const req = { body: { currentPassword: 'old', newPassword: 'newpassword' }, user: { userId: 1 } };
      const res = createMockResponse();

      await authController.changePassword(req, res);

      expect(User.updatePassword).toHaveBeenCalledWith(1, 'newpassword');
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('rejects empty name', async () => {
      const req = { body: { name: ' ' }, user: { userId: 1 } };
      const res = createMockResponse();

      await authController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('updates profile name parts', async () => {
      User.updateProfile.mockResolvedValue({ id: 1, email: 'x@test.com', role: 'customer', first_name: 'Jane', last_name: 'Doe' });
      const req = { body: { name: 'Jane Doe' }, user: { userId: 1 } };
      const res = createMockResponse();

      await authController.updateProfile(req, res);

      expect(User.updateProfile).toHaveBeenCalledWith(1, { firstName: 'Jane', lastName: 'Doe' });
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('returns 404 when missing', async () => {
      User.findById.mockResolvedValue(null);
      const req = { user: { userId: 1 } };
      const res = createMockResponse();

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns profile when found', async () => {
      User.findById.mockResolvedValue({ id: 1, email: 'x@test.com', role: 'customer', first_name: 'A', last_name: 'B', is_email_verified: true, created_at: 'now', updated_at: 'now' });
      const req = { user: { userId: 1 } };
      const res = createMockResponse();

      await authController.getProfile(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('rejects invalid token format', async () => {
      const req = { params: { token: 'bad' } };
      const res = createMockResponse();

      await authController.verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects unknown token', async () => {
      User.verifyEmail.mockResolvedValue(null);
      const req = { params: { token: 'a'.repeat(64) } };
      const res = createMockResponse();

      await authController.verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('verifies token', async () => {
      User.verifyEmail.mockResolvedValue({ id: 1 });
      const req = { params: { token: 'b'.repeat(64) } };
      const res = createMockResponse();

      await authController.verifyEmail(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('resendVerification', () => {
    it('skips email when already verified', async () => {
      User.resendVerificationEmail.mockResolvedValue({ alreadyVerified: true });
      const req = { body: { email: 'x@test.com' } };
      const res = createMockResponse();

      await authController.resendVerification(req, res);

      expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('sends email when token returned', async () => {
      User.resendVerificationEmail.mockResolvedValue({ token: 'verify', user: { first_name: 'A' } });
      const req = { body: { email: 'x@test.com' } };
      const res = createMockResponse();

      await authController.resendVerification(req, res);

      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });
});
