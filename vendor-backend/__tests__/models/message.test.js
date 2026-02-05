jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  end: jest.fn()
}));

const pool = require('../../src/config/database');
const Message = require('../../src/models/message');

describe('Message model', () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  it('create sends listing-based message', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 10 }] })
      .mockResolvedValueOnce({ rows: [{ id: 10 }] });

    const result = await Message.create(1, null, 5, 'Subject', 'Body');

    expect(result.id).toBe(10);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  it('create sends direct message', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 11 }] })
      .mockResolvedValueOnce({ rows: [{ id: 11 }] });

    const result = await Message.create(1, 2, null, '', 'Body');

    expect(result.id).toBe(11);
  });

  it('create rejects when no recipient or listing', async () => {
    await expect(Message.create(1, null, null, '', 'Body')).rejects.toThrow('Either listing ID or recipient ID must be provided');
  });

  it('create maps verification error', async () => {
    const err = new Error('Email not verified');
    err.code = '42501';
    pool.query.mockRejectedValueOnce(err);

    await expect(Message.create(1, 2, null, '', 'Body')).rejects.toThrow('Email not verified');
  });

  it('getInbox uses fallback on missing columns', async () => {
    pool.query
      .mockRejectedValueOnce({ code: '42703' })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const result = await Message.getInbox(1);

    expect(result[0].id).toBe(1);
  });

  it('getSent uses fallback on missing columns', async () => {
    pool.query
      .mockRejectedValueOnce({ code: '42703' })
      .mockResolvedValueOnce({ rows: [{ id: 2 }] });

    const result = await Message.getSent(1);

    expect(result[0].id).toBe(2);
  });

  it('getConversation uses fallback on missing columns', async () => {
    pool.query
      .mockRejectedValueOnce({ code: '42703' })
      .mockResolvedValueOnce({ rows: [{ id: 3 }] });

    const result = await Message.getConversation(1, 2);

    expect(result[0].id).toBe(3);
  });

  it('findById uses fallback on missing columns', async () => {
    pool.query
      .mockRejectedValueOnce({ code: '42703' })
      .mockResolvedValueOnce({ rows: [{ id: 4 }] });

    const result = await Message.findById(4);

    expect(result.id).toBe(4);
  });

  it('markAsRead uses fallback on missing columns', async () => {
    pool.query
      .mockRejectedValueOnce({ code: '42703' })
      .mockResolvedValueOnce({ rows: [{ id: 5 }] });

    const result = await Message.markAsRead(5);

    expect(result.id).toBe(5);
  });

  it('delete removes message', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 6 }] });
    const result = await Message.delete(6);

    expect(result.id).toBe(6);
  });

  it('getUnreadCount parses count', async () => {
    pool.query
      .mockRejectedValueOnce({ code: '42703' })
      .mockResolvedValueOnce({ rows: [{ count: '7' }] });

    const result = await Message.getUnreadCount(1);

    expect(result).toBe(7);
  });
});
