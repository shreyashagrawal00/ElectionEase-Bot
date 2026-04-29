/**
 * @module middleware/errorMiddleware
 * @description Centralized error handler. Must be the LAST middleware registered.
 *
 * Handles:
 *  - Mongoose CastError    → 400 Bad Request
 *  - Mongoose ValidationError → 422 Unprocessable Entity
 *  - Mongoose duplicate key  → 409 Conflict
 *  - JWT errors             → 401 Unauthorized
 *  - Generic errors         → 500 Internal Server Error
 *
 * In production, internal error details are stripped from the response.
 *
 * @param {Error} err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next - Required signature even if unused
 */
const errorHandler = (err, req, res, _next) => {
  // Always log the full error server-side
  console.error(`[ErrorHandler] ${req.method} ${req.originalUrl} →`, err);

  const isDev = process.env.NODE_ENV === 'development';

  // ── Mongoose: invalid ObjectId ──────────────────────────────────────────────
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid resource ID format.',
      ...(isDev && { debug: err.message }),
    });
  }

  // ── Mongoose: schema validation failures ────────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({
      success: false,
      error: 'Validation failed.',
      errors: messages,
    });
  }

  // ── MongoDB: duplicate key (e.g. unique email) ──────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: `An account with this ${field} already exists.`,
    });
  }

  // ── JWT errors ──────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid authentication token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
  }

  // ── Generic / unhandled ──────────────────────────────────────────────────────
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected server error occurred.',
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
