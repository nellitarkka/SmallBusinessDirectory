jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  end: jest.fn()
}));

const pool = require('../../src/config/database');
const Vendor = require('../../src/models/vendor');

describe('Vendor model', () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  it('create inserts vendor', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const result = await Vendor.create({ userId: 1, businessName: 'Biz', city: 'Lux', vatNumber: 'VAT' });

    expect(pool.query).toHaveBeenCalled();
    expect(result.id).toBe(1);
  });

  it('findByUserId returns vendor', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 2 }] });
    const result = await Vendor.findByUserId(2);

    expect(result.id).toBe(2);
  });

  it('getAllPublic sanitizes inputs', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 3 }] });
    const result = await Vendor.getAllPublic('bad', '-1');

    expect(pool.query).toHaveBeenCalledWith(expect.any(String), [50, 0]);
    expect(result.length).toBe(1);
  });
});
