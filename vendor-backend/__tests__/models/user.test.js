const bcrypt = require('bcrypt');
const crypto = require('crypto');

jest.mock('bcrypt');
jest.mock('crypto');
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  end: jest.fn()
}));

const pool = require('../../src/config/database');
const User = require('../../src/models/user');

describe('User model', () => {
  beforeEach(() => {
    pool.query.mockReset();
    bcrypt.hash.mockResolvedValue('hashed');
    bcrypt.compare.mockResolvedValue(true);
  });

  it('create inserts user', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, email: 'a@test.com' }] });
    const result = await User.create({ email: 'a@test.com', password: 'pw', role: 'customer', firstName: 'A', lastName: 'B' });

    expect(pool.query).toHaveBeenCalled();
    expect(result.email).toBe('a@test.com');
  });

  it('findByEmail returns user', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const result = await User.findByEmail('a@test.com');

    expect(result.id).toBe(1);
  });

  it('updateProfile updates names', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const result = await User.updateProfile(1, { firstName: 'A', lastName: 'B' });

    expect(pool.query).toHaveBeenCalled();
    expect(result.id).toBe(1);
  });

  it('updatePassword hashes and updates', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const result = await User.updatePassword(1, 'newpw');

    expect(bcrypt.hash).toHaveBeenCalledWith('newpw', 10);
    expect(result.id).toBe(1);
  });

  it('findById supports password hash', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    await User.findById(1, { includePasswordHash: true });

    expect(pool.query.mock.calls[0][0]).toContain('password_hash');
  });

  it('verifyPassword compares hash', async () => {
    await User.verifyPassword('plain', 'hash');
    expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hash');
  });

  it('createVerificationToken stores token', async () => {
    crypto.randomBytes.mockReturnValue(Buffer.from('a'.repeat(32)));
    pool.query.mockResolvedValue({ rows: [{ id: 1, email: 'a@test.com' }] });

    const result = await User.createVerificationToken(1);

    expect(result.token).toHaveLength(64);
    expect(pool.query).toHaveBeenCalled();
  });

  it('verifyEmail updates user', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const result = await User.verifyEmail('token');

    expect(result.id).toBe(1);
  });

  it('resendVerificationEmail returns null for unknown user', async () => {
    jest.spyOn(User, 'findByEmail').mockResolvedValueOnce(null);
    const result = await User.resendVerificationEmail('missing@test.com');

    expect(result).toBeNull();
  });

  it('resendVerificationEmail returns alreadyVerified flag', async () => {
    jest.spyOn(User, 'findByEmail').mockResolvedValueOnce({ is_email_verified: true });
    const result = await User.resendVerificationEmail('verified@test.com');

    expect(result.alreadyVerified).toBe(true);
  });

  it('resendVerificationEmail reuses existing token', async () => {
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    jest.spyOn(User, 'findByEmail').mockResolvedValueOnce({
      id: 1,
      is_email_verified: false,
      email_verification_token: 'token',
      email_verification_expires: expires
    });

    const result = await User.resendVerificationEmail('token@test.com');

    expect(result.token).toBe('token');
  });
});
