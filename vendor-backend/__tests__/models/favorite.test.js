jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  end: jest.fn()
}));

const pool = require('../../src/config/database');
const Favorite = require('../../src/models/favorite');

describe('Favorite model', () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  it('add inserts favorite', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const result = await Favorite.add(1, 2);

    expect(result.id).toBe(1);
  });

  it('remove deletes favorite', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 2 }] });
    const result = await Favorite.remove(1, 2);

    expect(result.id).toBe(2);
  });

  it('getUserFavorites returns rows', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 3 }] });
    const result = await Favorite.getUserFavorites(1);

    expect(result.length).toBe(1);
  });

  it('isFavorited returns boolean', async () => {
    pool.query.mockResolvedValue({ rows: [{ is_favorited: true }] });
    const result = await Favorite.isFavorited(1, 2);

    expect(result).toBe(true);
  });
});
