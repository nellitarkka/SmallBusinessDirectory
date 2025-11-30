const request = require('supertest');
const app = require('../src/app');

describe('Listings Endpoints', () => {
  describe('GET /api/listings', () => {
    it('should get all listings', async () => {
      const response = await request(app)
        .get('/api/listings');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('listings');
      expect(Array.isArray(response.body.data.listings)).toBe(true);
    });

    it('should filter listings by city', async () => {
      const response = await request(app)
        .get('/api/listings?city=Luxembourg');

      expect(response.status).toBe(200);
      expect(response.body.data.listings.every(l => l.city === 'Luxembourg')).toBe(true);
    });

    it('should filter listings by category', async () => {
      const response = await request(app)
        .get('/api/listings?category=Plumber');

      expect(response.status).toBe(200);
      const listings = response.body.data.listings;
      listings.forEach(listing => {
        expect(listing.categories).toContain('Plumber');
      });
    });

    it('should search listings by keyword', async () => {
      const response = await request(app)
        .get('/api/listings?search=plumbing');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /api/listings/:id', () => {
    it('should get a single listing', async () => {
      const response = await request(app)
        .get('/api/listings/8');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.listing).toHaveProperty('listing_id');
    });

    it('should return 404 for non-existent listing', async () => {
      const response = await request(app)
        .get('/api/listings/99999');

      expect(response.status).toBe(404);
    });
  });
});
