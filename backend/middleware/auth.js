const jwt = require('jsonwebtoken');

/**
 * @module middleware/auth
 * @description JWT authentication middleware. Supports both
 *  - x-auth-token header (legacy)
 *  - Authorization: Bearer <token> header (standard)
 *
 * Attaches the decoded user payload to req.user on success.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
module.exports = function authMiddleware(req, res, next) {
  // Support both header patterns
  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  const token = bearerToken || req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      error: isExpired
        ? 'Session expired. Please log in again.'
        : 'Invalid authentication token.',
    });
  }
};
