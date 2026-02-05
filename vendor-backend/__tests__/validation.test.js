const { validateRegister, validateLogin, validateResendVerification } = require('../src/middleware/validators/authValidators');
const { validateCreateListing, validateUpdateListing } = require('../src/middleware/validators/listingValidators');
const { validateSendMessage } = require('../src/middleware/validators/messageValidators');
const { createMockResponse, runMiddlewares } = require('./helpers');

describe('Validator Middleware', () => {
  it('rejects invalid registration payload', async () => {
    const req = {
      body: {
        email: 'invalid-email',
        password: 'short',
        role: 'admin',
        firstName: 'A',
        lastName: 'B'
      }
    };
    const res = createMockResponse();
    await runMiddlewares(validateRegister, req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('accepts valid registration payload', async () => {
    const req = {
      body: {
        email: 'valid@example.com',
        password: 'SecurePass123',
        role: 'customer',
        firstName: 'Jane',
        lastName: 'Doe'
      }
    };
    const res = createMockResponse();
    await runMiddlewares(validateRegister, req, res);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects login with invalid email', async () => {
    const req = { body: { email: 'nope', password: 'password123' } };
    const res = createMockResponse();
    await runMiddlewares(validateLogin, req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('accepts valid login payload', async () => {
    const req = { body: { email: 'ok@example.com', password: 'password123' } };
    const res = createMockResponse();
    await runMiddlewares(validateLogin, req, res);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects listing creation with missing category', async () => {
    const req = {
      body: {
        title: 'Test Listing',
        description: 'Valid description text',
        city: 'Luxembourg',
        contactEmail: 'test@example.com',
        contactPhone: '+352123456'
      }
    };
    const res = createMockResponse();
    await runMiddlewares(validateCreateListing, req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('accepts valid listing creation payload', async () => {
    const req = {
      body: {
        title: 'Test Listing',
        description: 'Valid description text',
        city: 'Luxembourg',
        contactEmail: 'test@example.com',
        contactPhone: '+352123456',
        categoryIds: ['1'],
        status: 'draft'
      }
    };
    const res = createMockResponse();
    await runMiddlewares(validateCreateListing, req, res);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects listing update with invalid status', async () => {
    const req = { body: { status: 'pending' } };
    const res = createMockResponse();
    await runMiddlewares(validateUpdateListing, req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('accepts listing update payload', async () => {
    const req = { body: { status: 'active', categoryIds: ['1'] } };
    const res = createMockResponse();
    await runMiddlewares(validateUpdateListing, req, res);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects message without recipient', async () => {
    const req = { body: { content: 'Hello' } };
    const res = createMockResponse();
    await runMiddlewares(validateSendMessage, req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects resend verification with invalid email', async () => {
    const req = { body: { email: 'bad' } };
    const res = createMockResponse();
    await runMiddlewares(validateResendVerification, req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
