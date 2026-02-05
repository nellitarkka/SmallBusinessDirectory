const categoryController = require('../../src/controllers/categoryController');
const Category = require('../../src/models/category');
const { createMockResponse } = require('../helpers');

jest.mock('../../src/models/category');

describe('categoryController', () => {
  it('getAll returns categories', async () => {
    Category.findAll.mockResolvedValue([{ id: 1 }]);
    const req = {};
    const res = createMockResponse();

    await categoryController.getAll(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it('getOne returns 404 when missing', async () => {
    Category.findById.mockResolvedValue(null);
    const req = { params: { id: 1 } };
    const res = createMockResponse();

    await categoryController.getOne(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getOne returns category', async () => {
    Category.findById.mockResolvedValue({ id: 1 });
    const req = { params: { id: 1 } };
    const res = createMockResponse();

    await categoryController.getOne(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it('create handles duplicate error', async () => {
    const err = new Error('dup');
    err.code = '23505';
    Category.create.mockRejectedValue(err);
    const req = { body: { name: 'Test' } };
    const res = createMockResponse();

    await categoryController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('create returns category', async () => {
    Category.create.mockResolvedValue({ id: 1, name: 'Test' });
    const req = { body: { name: 'Test' } };
    const res = createMockResponse();

    await categoryController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('update returns 404 when missing', async () => {
    Category.update.mockResolvedValue(null);
    const req = { params: { id: 1 }, body: { name: 'Test' } };
    const res = createMockResponse();

    await categoryController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('update returns category', async () => {
    Category.update.mockResolvedValue({ id: 1 });
    const req = { params: { id: 1 }, body: { name: 'Test' } };
    const res = createMockResponse();

    await categoryController.update(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it('delete returns 404 when missing', async () => {
    Category.delete.mockResolvedValue(null);
    const req = { params: { id: 1 } };
    const res = createMockResponse();

    await categoryController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('delete returns 204 when deleted', async () => {
    Category.delete.mockResolvedValue({ id: 1 });
    const req = { params: { id: 1 } };
    const res = createMockResponse();

    await categoryController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
  });
});
