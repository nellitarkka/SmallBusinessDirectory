const listingController = require('../../src/controllers/listingController');
const Listing = require('../../src/models/listing');
const Vendor = require('../../src/models/vendor');
const { createMockResponse } = require('../helpers');

jest.mock('../../src/models/listing');
jest.mock('../../src/models/vendor');

describe('listingController', () => {
  describe('create', () => {
    it('returns 404 when vendor missing', async () => {
      Vendor.findByUserId.mockResolvedValue(null);
      const req = { user: { userId: 1 }, body: {} };
      const res = createMockResponse();

      await listingController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('creates listing and categories', async () => {
      Vendor.findByUserId.mockResolvedValue({ id: 9 });
      Listing.create.mockResolvedValue({ id: 100 });
      Listing.addCategories.mockResolvedValue();
      const req = { user: { userId: 1 }, body: { title: 'T', description: 'D', city: 'C', contactEmail: 'a@test.com', contactPhone: '1', openingHours: '9-5', categoryIds: [1, 2], status: 'draft' } };
      const res = createMockResponse();

      await listingController.create(req, res);

      expect(Listing.create).toHaveBeenCalled();
      expect(Listing.addCategories).toHaveBeenCalledWith(100, [1, 2]);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  it('getAll returns listings', async () => {
    Listing.findAll.mockResolvedValue([{ id: 1 }]);
    const req = { query: {} };
    const res = createMockResponse();

    await listingController.getAll(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it('getAllAdmin returns listings', async () => {
    Listing.findAllAdmin.mockResolvedValue([{ id: 1 }]);
    const req = {};
    const res = createMockResponse();

    await listingController.getAllAdmin(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  describe('updateStatusAdmin', () => {
    it('rejects invalid status', async () => {
      const req = { params: { id: 1 }, body: { status: 'draft' } };
      const res = createMockResponse();

      await listingController.updateStatusAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('updates with rejection reason', async () => {
      Listing.update.mockResolvedValue({ id: 1 });
      const req = { params: { id: 1 }, body: { status: 'rejected', rejection_reason: 'Bad' } };
      const res = createMockResponse();

      await listingController.updateStatusAdmin(req, res);

      expect(Listing.update).toHaveBeenCalledWith(1, { status: 'rejected', rejection_reason: 'Bad' });
      expect(res.json).toHaveBeenCalled();
    });

    it('returns 404 when missing', async () => {
      Listing.update.mockResolvedValue(null);
      const req = { params: { id: 1 }, body: { status: 'active' } };
      const res = createMockResponse();

      await listingController.updateStatusAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getOne', () => {
    it('returns 404 when missing', async () => {
      Listing.findById.mockResolvedValue(null);
      const req = { params: { id: 1 } };
      const res = createMockResponse();

      await listingController.getOne(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns listing', async () => {
      Listing.findById.mockResolvedValue({ id: 1 });
      const req = { params: { id: 1 } };
      const res = createMockResponse();

      await listingController.getOne(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  it('getMine returns listings', async () => {
    Listing.findByVendorUserId.mockResolvedValue([{ id: 1 }]);
    const req = { user: { userId: 2 } };
    const res = createMockResponse();

    await listingController.getMine(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  describe('update', () => {
    it('returns 404 when listing missing', async () => {
      Listing.findByIdWithVendor.mockResolvedValue(null);
      const req = { params: { id: 1 }, user: { userId: 2 }, body: {} };
      const res = createMockResponse();

      await listingController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 403 when user not owner', async () => {
      Listing.findByIdWithVendor.mockResolvedValue({ vendor_user_id: 99 });
      const req = { params: { id: 1 }, user: { userId: 2 }, body: {} };
      const res = createMockResponse();

      await listingController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('updates listing and categories', async () => {
      Listing.findByIdWithVendor.mockResolvedValue({ vendor_user_id: 2, status: 'active' });
      Listing.update.mockResolvedValue({ id: 1 });
      Listing.removeCategories.mockResolvedValue();
      Listing.addCategories.mockResolvedValue();
      const req = { params: { id: 1 }, user: { userId: 2 }, body: { title: 'New', categoryIds: [3] } };
      const res = createMockResponse();

      await listingController.update(req, res);

      expect(Listing.update).toHaveBeenCalledWith(1, { title: 'New', status: 'submitted' });
      expect(Listing.removeCategories).toHaveBeenCalled();
      expect(Listing.addCategories).toHaveBeenCalledWith(1, [3]);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('returns 404 when listing missing', async () => {
      Listing.findByIdWithVendor.mockResolvedValue(null);
      const req = { params: { id: 1 }, user: { userId: 2 } };
      const res = createMockResponse();

      await listingController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 403 when user not owner', async () => {
      Listing.findByIdWithVendor.mockResolvedValue({ vendor_user_id: 99 });
      const req = { params: { id: 1 }, user: { userId: 2 } };
      const res = createMockResponse();

      await listingController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('deletes listing', async () => {
      Listing.findByIdWithVendor.mockResolvedValue({ vendor_user_id: 2 });
      Listing.delete.mockResolvedValue({ id: 1 });
      const req = { params: { id: 1 }, user: { userId: 2 } };
      const res = createMockResponse();

      await listingController.delete(req, res);

      expect(Listing.delete).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });

  describe('uploadImage', () => {
    it('returns 404 when listing missing', async () => {
      Listing.findByIdWithVendor.mockResolvedValue(null);
      const req = { params: { id: 1 }, user: { userId: 2 }, file: { filename: 'a.jpg' } };
      const res = createMockResponse();

      await listingController.uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 403 when user not owner', async () => {
      Listing.findByIdWithVendor.mockResolvedValue({ vendor_user_id: 9 });
      const req = { params: { id: 1 }, user: { userId: 2 }, file: { filename: 'a.jpg' } };
      const res = createMockResponse();

      await listingController.uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 400 when no file', async () => {
      Listing.findByIdWithVendor.mockResolvedValue({ vendor_user_id: 2 });
      const req = { params: { id: 1 }, user: { userId: 2 } };
      const res = createMockResponse();

      await listingController.uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('updates image url', async () => {
      Listing.findByIdWithVendor.mockResolvedValue({ vendor_user_id: 2 });
      Listing.update.mockResolvedValue({ id: 1, image_url: '/uploads/a.jpg' });
      const req = { params: { id: 1 }, user: { userId: 2 }, file: { filename: 'a.jpg' } };
      const res = createMockResponse();

      await listingController.uploadImage(req, res);

      expect(Listing.update).toHaveBeenCalledWith(1, { image_url: '/uploads/a.jpg' });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
