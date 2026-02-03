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
      // First, get all listings to find an actual city that exists
      const allResponse = await request(app).get('/api/listings');
      
      if (allResponse.body.data.listings.length === 0) {
        // Skip test if no listings
        return;
      }
      
      // Use a city that actually exists in the database
      const testCity = allResponse.body.data.listings[0].city;
      
      const response = await request(app)
        .get(`/api/listings?city=${testCity}`);

      expect(response.status).toBe(200);
      expect(response.body.data.listings.length).toBeGreaterThan(0);
      // Verify all returned listings match the filter
      expect(response.body.data.listings.every(l => l.city === testCity)).toBe(true);
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
      // First, get all listings to find a valid ID
      const allListings = await request(app).get('/api/listings');
      
      if (allListings.body.data.listings.length === 0) {
        // Skip test if no listings exist
        return;
      }
      
      const validId = allListings.body.data.listings[0].listing_id;
      const response = await request(app)
        .get(`/api/listings/${validId}`);

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
