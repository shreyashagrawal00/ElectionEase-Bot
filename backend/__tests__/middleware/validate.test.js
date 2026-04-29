/**
 * @file __tests__/middleware/validate.test.js
 * @description Unit tests for the centralized validation middleware.
 */

const {
  validateRegistration,
  validateLogin,
  validateChatMessage,
  validateForgotPassword,
  validateResetPassword,
} = require('../../middleware/validate');

// ── Test Helper ──────────────────────────────────────────────────────────────

const buildMocks = (body = {}) => {
  const req = { body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

// ── validateRegistration ─────────────────────────────────────────────────────

describe('validateRegistration', () => {
  test('passes valid registration data', () => {
    const { req, res, next } = buildMocks({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'Secure123',
    });
    validateRegistration(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    // Email should be lowercased and trimmed
    expect(req.body.email).toBe('priya@example.com');
  });

  test('rejects missing name', () => {
    const { req, res, next } = buildMocks({ email: 'a@b.com', password: 'Pass1234' });
    validateRegistration(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects invalid email format', () => {
    const { req, res, next } = buildMocks({ name: 'Test', email: 'not-an-email', password: 'Pass1234' });
    validateRegistration(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.errors.some((e) => e.includes('valid email'))).toBe(true);
  });

  test('rejects password shorter than 8 characters', () => {
    const { req, res, next } = buildMocks({ name: 'Test', email: 'a@b.com', password: '1234' });
    validateRegistration(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.errors.some((e) => e.includes('8 characters'))).toBe(true);
  });

  test('trims and lowercases email before passing to next', () => {
    const { req, res, next } = buildMocks({
      name: '  Test  ',
      email: '  TEST@EXAMPLE.COM  ',
      password: 'ValidPass1',
    });
    validateRegistration(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body.email).toBe('test@example.com');
  });
});

// ── validateLogin ────────────────────────────────────────────────────────────

describe('validateLogin', () => {
  test('passes valid login credentials', () => {
    const { req, res, next } = buildMocks({ email: 'user@domain.in', password: 'mypassword' });
    validateLogin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('rejects when email is missing', () => {
    const { req, res, next } = buildMocks({ password: 'pass1234' });
    validateLogin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects when password is missing', () => {
    const { req, res, next } = buildMocks({ email: 'user@domain.in' });
    validateLogin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ── validateChatMessage ──────────────────────────────────────────────────────

describe('validateChatMessage', () => {
  test('passes a valid message with no context', () => {
    const { req, res, next } = buildMocks({ message: 'What are the voter registration deadlines?' });
    validateChatMessage(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('rejects an empty message string', () => {
    const { req, res, next } = buildMocks({ message: '   ' });
    validateChatMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects a message that is not a string', () => {
    const { req, res, next } = buildMocks({ message: 12345 });
    validateChatMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects messages exceeding 500 characters', () => {
    const { req, res, next } = buildMocks({ message: 'a'.repeat(501) });
    validateChatMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.errors.some((e) => e.includes('500 characters'))).toBe(true);
  });

  test('rejects an invalid language code in context', () => {
    const { req, res, next } = buildMocks({ message: 'Hello', context: { language: 'xx' } });
    validateChatMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.errors.some((e) => e.includes('Invalid language'))).toBe(true);
  });

  test('rejects invalid latitude in location context', () => {
    const { req, res, next } = buildMocks({
      message: 'Where is my booth?',
      context: { location: { latitude: 999, longitude: 72 } },
    });
    validateChatMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.errors.some((e) => e.includes('latitude'))).toBe(true);
  });

  test('accepts a valid language code in context', () => {
    const { req, res, next } = buildMocks({ message: 'मेरा मतदान केंद्र कहाँ है?', context: { language: 'hi' } });
    validateChatMessage(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

// ── validateForgotPassword ───────────────────────────────────────────────────

describe('validateForgotPassword', () => {
  test('passes a valid email', () => {
    const { req, res, next } = buildMocks({ email: 'voter@eci.gov.in' });
    validateForgotPassword(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('rejects a malformed email', () => {
    const { req, res, next } = buildMocks({ email: 'not_an_email' });
    validateForgotPassword(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ── validateResetPassword ────────────────────────────────────────────────────

describe('validateResetPassword', () => {
  test('passes a valid token and password', () => {
    const { req, res, next } = buildMocks({ token: 'abc123token', password: 'NewSecure99' });
    validateResetPassword(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('rejects when token is missing', () => {
    const { req, res, next } = buildMocks({ password: 'NewSecure99' });
    validateResetPassword(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects a new password shorter than 8 characters', () => {
    const { req, res, next } = buildMocks({ token: 'abc123token', password: '1234' });
    validateResetPassword(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.errors.some((e) => e.includes('8 characters'))).toBe(true);
  });
});
