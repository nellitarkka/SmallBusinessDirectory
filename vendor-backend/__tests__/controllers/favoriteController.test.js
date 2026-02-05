const favoriteController = require('../../src/controllers/favoriteController');
const Favorite = require('../../src/models/favorite');
const Listing = require('../../src/models/listing');
const { createMockResponse } = require('../helpers');

jest.mock('../../src/models/favorite');
jest.mock('../../src/models/listing');

describe('favoriteController', () => {
  it('add returns 404 when listing missing', async () => {
    Listing.findById.mockResolvedValue(null);
    const req = { params: { listingId: 1 }, user: { userId: 2 } };
    const res = createMockResponse();

    await favoriteController.add(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('add creates favorite', async () => {
    Listing.findById.mockResolvedValue({ id: 1 });
    Favorite.add.mockResolvedValue({ id: 9 });
    const req = { params: { listingId: 1 }, user: { userId: 2 } };
    const res = createMockResponse();

    await favoriteController.add(req, res);

    expect(Favorite.add).toHaveBeenCalledWith(2, 1);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('remove deletes favorite', async () => {
    Favorite.remove.mockResolvedValue({ id: 9 });
    const req = { params: { listingId: 1 }, user: { userId: 2 } };
    const res = createMockResponse();

    await favoriteController.remove(req, res);

    expect(Favorite.remove).toHaveBeenCalledWith(2, 1);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('getMine returns favorites', async () => {
    Favorite.getUserFavorites.mockResolvedValue([{ id: 1 }]);
    const req = { user: { userId: 2 } };
    const res = createMockResponse();

    await favoriteController.getMine(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it('checkFavorite returns status', async () => {
    Favorite.isFavorited.mockResolvedValue(true);
    const req = { params: { listingId: 1 }, user: { userId: 2 } };
    const res = createMockResponse();

    await favoriteController.checkFavorite(req, res);

    expect(Favorite.isFavorited).toHaveBeenCalledWith(2, 1);
    expect(res.json).toHaveBeenCalled();
  });
});
