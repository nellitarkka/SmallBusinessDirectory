const request = require('supertest');
const app = require('../src/app');

describe('Categories Endpoints', () => {
  describe('GET /api/categories', () => {
    it('should get all categories', async () => {
      const response = await request(app)
        .get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('categories');
      expect(Array.isArray(response.body.data.categories)).toBe(true);
      expect(response.body.data.categories.length).toBeGreaterThan(0);
    });

    it('should return categories with correct structure', async () => {
      const response = await request(app)
        .get('/api/categories');

      const category = response.body.data.categories[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('is_active');
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should get a single category', async () => {
      const response = await request(app)
        .get('/api/categories/1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.category).toHaveProperty('id');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/categories/99999');

      expect(response.status).toBe(404);
    });
  });
});
