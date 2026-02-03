const request = require('supertest');
const app = require('../src/app');

describe('Validation Tests', () => {
  describe('POST /api/auth/register - Validation', () => {
    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123',
          role: 'customer',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          role: 'customer',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject registration with invalid role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123',
          role: 'admin',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login - Validation', () => {
    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject login without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/listings - Validation', () => {
    it('should reject listing creation without authentication', async () => {
      const response = await request(app)
        .post('/api/listings')
        .send({
          title: 'Test Listing',
          description: 'Test description',
          city: 'Luxembourg',
          contactEmail: 'test@example.com',
          contactPhone: '+352123456',
          categoryIds: [1]
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/messages - Validation', () => {
    it('should reject message without authentication', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          recipient_id: 1,
          subject: 'Test',
          content: 'Test message'
        });

      expect(response.status).toBe(401);
    });
  });
});
