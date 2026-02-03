const pool = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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

  async updateProfile(userId, { firstName, lastName }) {
    try {
      const query = `
        UPDATE users
        SET first_name = $1,
            last_name = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING id, email, role, first_name, last_name, created_at, updated_at
      `;
      const result = await pool.query(query, [firstName, lastName, userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  async updatePassword(userId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      const query = `
        UPDATE users
        SET password_hash = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING id
      `;
      const result = await pool.query(query, [hashedPassword, userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  


  async findById(id, options = {}) {
    try {
      const includePasswordHash = options.includePasswordHash === true;
  
      const query = includePasswordHash
        ? `
          SELECT id, email, role, first_name, last_name, password_hash, created_at, updated_at 
          FROM users 
          WHERE id = $1
        `
        : `
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
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const query = `
      UPDATE users 
      SET email_verification_token = $1, 
          email_verification_expires = $2 
      WHERE id = $3 
      RETURNING id, email, role, first_name, last_name, is_email_verified, email_verification_token, email_verification_expires
    `;
    const result = await pool.query(query, [token, expiresAt, userId]);
    return { token, user: result.rows[0] };
  } catch (error) {
    throw error;
  }
};

User.verifyEmail = async (token) => {
  try {
    const query = `
      UPDATE users 
      SET is_email_verified = true, 
          email_verification_token = NULL,
          email_verification_expires = NULL
      WHERE email_verification_token = $1 
        AND email_verification_expires > NOW()
      RETURNING id, email, role, first_name, last_name, is_email_verified
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

User.resendVerificationEmail = async (email) => {
  try {
    const user = await User.findByEmail(email);
    if (!user) return null;
    if (user.is_email_verified) return { alreadyVerified: true };

    // Reuse existing valid token if it was created recently (within 5 minutes)
    if (user.email_verification_token && user.email_verification_expires) {
      const now = new Date();
      const expiresAt = new Date(user.email_verification_expires);
      const tokenIsValid = expiresAt.getTime() > now.getTime();
      const millisIn24Hours = 24 * 60 * 60 * 1000;
      const millisIn5Minutes = 5 * 60 * 1000;
      const tokenCreatedRecently =
        expiresAt.getTime() - now.getTime() > (millisIn24Hours - millisIn5Minutes);

      if (tokenIsValid && tokenCreatedRecently) {
        return { token: user.email_verification_token, user };
      }
    }

    return User.createVerificationToken(user.id);
  } catch (error) {
    throw error;
  }
};
