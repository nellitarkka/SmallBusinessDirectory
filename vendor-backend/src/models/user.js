const pool = require('../config/database');
const bcrypt = require('bcrypt');

const User = {
  async create({ email, password, role, firstName, lastName }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const query = `
        INSERT INTO users (email, password_hash, role, first_name, last_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, role, first_name, last_name, created_at
      `;
      
      const values = [email, hashedPassword, role, firstName, lastName];
      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  async findById(id) {
    try {
      const query = `
        SELECT id, email, role, first_name, last_name, created_at, updated_at 
        FROM users 
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = User;

// Email verification methods
User.createVerificationToken = async (userId) => {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const query = `
    UPDATE users 
    SET email_verification_token = $1, 
        email_verification_expires = $2 
    WHERE id = $3 
    RETURNING *
  `;
  const result = await pool.query(query, [token, expiresAt, userId]);
  return { token, user: result.rows[0] };
};

User.verifyEmail = async (token) => {
  const query = `
    UPDATE users 
    SET email_verified = true, 
        email_verification_token = NULL,
        email_verification_expires = NULL
    WHERE email_verification_token = $1 
      AND email_verification_expires > NOW()
    RETURNING id, email, role, first_name, last_name
  `;
  const result = await pool.query(query, [token]);
  return result.rows[0];
};

User.resendVerificationEmail = async (email) => {
  const user = await User.findByEmail(email);
  if (!user) return null;
  if (user.email_verified) return { alreadyVerified: true };
  
  return User.createVerificationToken(user.id);
};
