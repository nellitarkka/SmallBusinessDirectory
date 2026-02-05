const messageController = require('../../src/controllers/messageController');
const Message = require('../../src/models/message');
const { createMockResponse } = require('../helpers');

jest.mock('../../src/models/message');

describe('messageController', () => {
  it('sendMessage returns 403 on unverified', async () => {
    const err = new Error('Email not verified');
    err.code = '42501';
    Message.create.mockRejectedValue(err);
    const req = { user: { userId: 1 }, body: { recipientId: 2, content: 'Hi' } };
    const res = createMockResponse();

    await messageController.sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('sendMessage returns success', async () => {
    Message.create.mockResolvedValue({ id: 1 });
    const req = { user: { userId: 1 }, body: { recipientId: 2, content: 'Hi' } };
    const res = createMockResponse();

    await messageController.sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('getInbox returns messages', async () => {
    Message.getInbox.mockResolvedValue([{ id: 1 }]);
    const req = { user: { userId: 1 } };
    const res = createMockResponse();

    await messageController.getInbox(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it('getSent returns messages', async () => {
    Message.getSent.mockResolvedValue([{ id: 1 }]);
    const req = { user: { userId: 1 } };
    const res = createMockResponse();

    await messageController.getSent(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it('getConversation returns messages', async () => {
    Message.getConversation.mockResolvedValue([{ id: 1 }]);
    const req = { user: { userId: 1 }, params: { otherUserId: '2' } };
    const res = createMockResponse();

    await messageController.getConversation(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it('getMessage returns 404 when missing', async () => {
    Message.findById.mockResolvedValue(null);
    const req = { user: { userId: 1 }, params: { id: '10' } };
    const res = createMockResponse();

    await messageController.getMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getMessage returns 403 when not participant', async () => {
    Message.findById.mockResolvedValue({ id: 10, sender_id: 2, recipient_id: 3 });
    const req = { user: { userId: 1 }, params: { id: '10' } };
    const res = createMockResponse();

    await messageController.getMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('getMessage returns message', async () => {
    Message.findById.mockResolvedValue({ id: 10, sender_id: 1, recipient_id: 2 });
    const req = { user: { userId: 1 }, params: { id: '10' } };
    const res = createMockResponse();

    await messageController.getMessage(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it('markAsRead returns 404 when missing', async () => {
    Message.findById.mockResolvedValue(null);
    const req = { user: { userId: 1 }, params: { id: '10' } };
    const res = createMockResponse();

    await messageController.markAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('markAsRead returns 403 when not recipient', async () => {
    Message.findById.mockResolvedValue({ id: 10, sender_id: 2, recipient_id: 3 });
    const req = { user: { userId: 1 }, params: { id: '10' } };
    const res = createMockResponse();

    await messageController.markAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('markAsRead updates message', async () => {
    Message.findById.mockResolvedValue({ id: 10, sender_id: 2, recipient_id: 1 });
    Message.markAsRead.mockResolvedValue({ id: 10, read: true });
    const req = { user: { userId: 1 }, params: { id: '10' } };
    const res = createMockResponse();

    await messageController.markAsRead(req, res);

    expect(Message.markAsRead).toHaveBeenCalledWith('10');
    expect(res.json).toHaveBeenCalled();
  });

  it('deleteMessage returns 404 when missing', async () => {
    Message.findById.mockResolvedValue(null);
    const req = { user: { userId: 1 }, params: { id: '10' } };
    const res = createMockResponse();

    await messageController.deleteMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deleteMessage returns 403 when not participant', async () => {
    Message.findById.mockResolvedValue({ id: 10, sender_id: 2, recipient_id: 3 });
    const req = { user: { userId: 1 }, params: { id: '10' } };
    const res = createMockResponse();

    await messageController.deleteMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('deleteMessage removes message', async () => {
    Message.findById.mockResolvedValue({ id: 10, sender_id: 1, recipient_id: 2 });
    Message.delete.mockResolvedValue({ id: 10 });
    const req = { user: { userId: 1 }, params: { id: '10' } };
    const res = createMockResponse();

    await messageController.deleteMessage(req, res);

    expect(Message.delete).toHaveBeenCalledWith('10');
    expect(res.json).toHaveBeenCalled();
  });

  it('getUnreadCount returns count', async () => {
    Message.getUnreadCount.mockResolvedValue(5);
    const req = { user: { userId: 1 } };
    const res = createMockResponse();

    await messageController.getUnreadCount(req, res);

    expect(res.json).toHaveBeenCalled();
  });
});
