jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({})
  }))
}));

describe('emailService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('throws when email config missing', async () => {
    const originalHost = process.env.EMAIL_HOST;
    const originalUser = process.env.EMAIL_USER;
    const originalPass = process.env.EMAIL_PASS;

    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;

    const emailService = require('../../src/services/emailService');

    await expect(emailService.sendVerificationEmail('a@test.com', 'token', 'A'))
      .rejects
      .toThrow('Email service is not configured');

    process.env.EMAIL_HOST = originalHost;
    process.env.EMAIL_USER = originalUser;
    process.env.EMAIL_PASS = originalPass;
  });

  it('sends verification email with token', async () => {
    const emailService = require('../../src/services/emailService');
    const result = await emailService.sendVerificationEmail('a@test.com', 'token-123', 'A');

    expect(result.success).toBe(true);
  });
});
