const { verifyToken } = require('../utils/jwt');

const authMiddleware = (requireAuth = true, requireAdmin = false) => {
  return (next) => (root, args, context, info) => {
    const authHeader = context.req.headers.authorization;

    if (!authHeader && requireAuth) {
      throw new Error('Not authenticated');
    }

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');

      try {
        const decoded = verifyToken(token);
        context.user = decoded;

        if (requireAdmin && decoded.role !== 'admin') {
          throw new Error('Admin access required');
        }
      } catch (error) {
        if (requireAuth) {
          throw new Error('Invalid or expired token');
        }
      }
    }

    return next(root, args, context, info);
  };
};

module.exports = { authMiddleware };
