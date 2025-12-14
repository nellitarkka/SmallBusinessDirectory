const request = require('supertest');
const app = require('../src/app');

describe('Favorites Endpoints', () => {
  let customerToken;
  let testListingId = 8;

  beforeAll(async () => {
    // Login as customer to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer@test.com',
        password: 'password123'
      });

    customerToken = loginResponse.body.data.token;
  });

  describe('POST /api/favorites/:listingId', () => {
    it('should add a favorite with valid token', async () => {
      const response = await request(app)
        .post(`/api/favorites/${testListingId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .post(`/api/favorites/${testListingId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/favorites', () => {
    it('should get user favorites', async () => {
      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.favorites)).toBe(true);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/api/favorites');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/favorites/:listingId/check', () => {
    it('should check if listing is favorited', async () => {
      const response = await request(app)
        .get(`/api/favorites/${testListingId}/check`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('isFavorited');
      expect(typeof response.body.data.isFavorited).toBe('boolean');
    });
  });

  describe('DELETE /api/favorites/:listingId', () => {
    it('should remove a favorite', async () => {
      const response = await request(app)
        .delete(`/api/favorites/${testListingId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(204);
    });
  });
});
