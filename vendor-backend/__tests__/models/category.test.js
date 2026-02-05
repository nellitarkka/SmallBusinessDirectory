jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  end: jest.fn()
}));

const pool = require('../../src/config/database');
const Category = require('../../src/models/category');

describe('Category model', () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  it('findAll returns categories', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const result = await Category.findAll();

    expect(result.length).toBe(1);
  });

  it('findById returns category', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 2 }] });
    const result = await Category.findById(2);

    expect(result.id).toBe(2);
  });

  it('create inserts category', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 3 }] });
    const result = await Category.create('Plumber');

    expect(result.id).toBe(3);
  });

  it('update updates category', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 4 }] });
    const result = await Category.update(4, { name: 'Updated', is_active: false });

    expect(result.id).toBe(4);
  });

  it('delete removes category', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 5 }] });
    const result = await Category.delete(5);

    expect(result.id).toBe(5);
  });
});
