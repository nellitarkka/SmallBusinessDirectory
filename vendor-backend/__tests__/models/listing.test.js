jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  end: jest.fn()
}));

const pool = require('../../src/config/database');
const Listing = require('../../src/models/listing');

describe('Listing model', () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  it('create inserts listing', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const result = await Listing.create(9, {
      title: 'T',
      description: 'D',
      city: 'C',
      contactEmail: 'a@test.com',
      contactPhone: '123',
      openingHours: '9-5',
      status: 'draft'
    });

    expect(pool.query).toHaveBeenCalled();
    expect(result.id).toBe(1);
  });

  it('findAll applies filters', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const result = await Listing.findAll({ city: 'Lux', category: 'Plumber', search: 'pipe' });

    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['%Lux%', 'Plumber', '%pipe%']);
    expect(result.length).toBe(1);
  });

  it('findById returns listing', async () => {
    pool.query.mockResolvedValue({ rows: [{ listing_id: 1 }] });
    const result = await Listing.findById(1);

    expect(result.listing_id).toBe(1);
  });

  it('findByVendorUserId maps id', async () => {
    pool.query.mockResolvedValue({ rows: [{ listing_id: 2 }] });
    const result = await Listing.findByVendorUserId(1);

    expect(result[0].id).toBe(2);
  });

  it('update rejects when no valid fields', async () => {
    await expect(Listing.update(1, { unknown: 'x' })).rejects.toThrow('No valid fields to update');
  });

  it('update applies allowed fields', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 3 }] });
    const result = await Listing.update(3, { title: 'New', rejection_reason: 'Nope' });

    expect(pool.query).toHaveBeenCalled();
    expect(result.id).toBe(3);
  });

  it('delete removes listing', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 4 }] });
    const result = await Listing.delete(4);

    expect(result.id).toBe(4);
  });

  it('findByIdWithVendor returns listing', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 5 }] });
    const result = await Listing.findByIdWithVendor(5);

    expect(result.id).toBe(5);
  });

  it('addCategories inserts rows', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await Listing.addCategories(1, [2, 3]);

    expect(pool.query).toHaveBeenCalled();
  });

  it('removeCategories deletes rows', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await Listing.removeCategories(1);

    expect(pool.query).toHaveBeenCalled();
  });

  it('findAllAdmin maps id', async () => {
    pool.query.mockResolvedValue({ rows: [{ listing_id: 7 }] });
    const result = await Listing.findAllAdmin();

    expect(result[0].id).toBe(7);
  });
});
