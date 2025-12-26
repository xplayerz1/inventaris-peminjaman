const { authPool } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwt');

const authResolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const result = await authPool.query(
        'SELECT id, email, role, name, nim, phone, organization, is_active, created_at FROM users WHERE id = $1',
        [context.user.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    },

    users: async (_, __, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const result = await authPool.query(
        'SELECT id, email, role, name, nim, phone, organization, is_active, created_at FROM users ORDER BY created_at DESC'
      );

      return result.rows;
    },
  },

  Mutation: {
    register: async (_, { input }) => {
      const { email, password, name, nim, phone, organization } = input;

      const existingUser = await authPool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Email already registered');
      }

      const passwordHash = await hashPassword(password);

      const result = await authPool.query(
        `INSERT INTO users (email, password_hash, role, name, nim, phone, organization)
         VALUES ($1, $2, 'user', $3, $4, $5, $6)
         RETURNING id, email, role, name, nim, phone, organization, is_active, created_at`,
        [email, passwordHash, name, nim, phone, organization]
      );

      const user = result.rows[0];

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await authPool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiresAt]
      );

      return { token, refreshToken, user };
    },

    login: async (_, { input }) => {
      const { email, password } = input;

      const result = await authPool.query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = result.rows[0];

      const validPassword = await comparePassword(password, user.password_hash);

      if (!validPassword) {
        throw new Error('Invalid credentials');
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await authPool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiresAt]
      );

      delete user.password_hash;

      return { token, refreshToken, user };
    },

    refreshToken: async (_, { refreshToken }) => {
      const result = await authPool.query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
        [refreshToken]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired refresh token');
      }

      const tokenRecord = result.rows[0];

      const userResult = await authPool.query(
        'SELECT id, email, role, name, nim, phone, organization, is_active, created_at FROM users WHERE id = $1 AND is_active = true',
        [tokenRecord.user_id]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      const newToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = generateRefreshToken();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await authPool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

      await authPool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, newRefreshToken, expiresAt]
      );

      return { token: newToken, refreshToken: newRefreshToken, user };
    },

    logout: async (_, __, context) => {
      if (!context.user) {
        return false;
      }

      await authPool.query(
        'DELETE FROM refresh_tokens WHERE user_id = $1',
        [context.user.userId]
      );

      return true;
    },
  },
};

module.exports = authResolvers;
