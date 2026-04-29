/**
 * @module middleware/validate
 * @description Centralized request validation rules and handler for all API routes.
 * Uses manual validation to avoid requiring extra dependencies beyond express-validator.
 */

const ALLOWED_LANGUAGES = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];
const MAX_MESSAGE_LENGTH = 500;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Sanitizes a string by trimming whitespace.
 * @param {string} str
 * @returns {string}
 */
const sanitizeString = (str) => (typeof str === 'string' ? str.trim() : str);

/**
 * Validates a basic email format.
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Middleware factory — validates user registration payload.
 */
const validateRegistration = (req, res, next) => {
  // Sanitize first so validation runs on clean values
  const name  = sanitizeString(req.body.name);
  const email = sanitizeString(req.body.email)?.toLowerCase();
  const { password } = req.body;
  const errors = [];

  if (!name)  errors.push('Name is required.');
  if (!email) {
    errors.push('Email is required.');
  } else if (!isValidEmail(email)) {
    errors.push('A valid email address is required.');
  }
  if (!password) {
    errors.push('Password is required.');
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  if (typeof next !== 'function') {
    console.error('[ValidateMiddleware] next is not a function!');
    return res.status(500).json({ success: false, error: 'Internal Server Error: Middleware chain broken.' });
  }

  req.body.name  = name;
  req.body.email = email;
  next();
};

/**
 * Middleware factory — validates user login payload.
 */
const validateLogin = (req, res, next) => {
  const email = sanitizeString(req.body.email)?.toLowerCase();
  const { password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required.');
  } else if (!isValidEmail(email)) {
    errors.push('A valid email address is required.');
  }
  if (!password) errors.push('Password is required.');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  req.body.email = email;
  next();
};

/**
 * Middleware factory — validates chat message payload.
 * Prevents prompt injection by enforcing message length and sanitizing context.
 */
const validateChatMessage = (req, res, next) => {
  const { message, context } = req.body;
  const errors = [];

  if (!message || typeof message !== 'string') {
    errors.push('Message is required and must be a string.');
  } else if (message.trim().length === 0) {
    errors.push('Message cannot be empty.');
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    errors.push(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
  }

  // Validate context if provided
  if (context) {
    if (context.language && !ALLOWED_LANGUAGES.includes(context.language)) {
      errors.push(`Invalid language. Supported: ${ALLOWED_LANGUAGES.join(', ')}`);
    }
    if (context.location) {
      const { latitude, longitude } = context.location;
      if (latitude !== undefined && (typeof latitude !== 'number' || latitude < -90 || latitude > 90)) {
        errors.push('Invalid latitude value.');
      }
      if (longitude !== undefined && (typeof longitude !== 'number' || longitude < -180 || longitude > 180)) {
        errors.push('Invalid longitude value.');
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  req.body.message = sanitizeString(message);
  next();
};

/**
 * Middleware factory — validates password reset request.
 */
const validateForgotPassword = (req, res, next) => {
  const email = sanitizeString(req.body.email)?.toLowerCase();
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, errors: ['A valid email address is required.'] });
  }
  req.body.email = email;
  next();
};

/**
 * Middleware factory — validates password reset execution.
 */
const validateResetPassword = (req, res, next) => {
  const { token, password } = req.body;
  const errors = [];
  if (!token || typeof token !== 'string') errors.push('Reset token is required.');
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateChatMessage,
  validateForgotPassword,
  validateResetPassword,
};
