/**
 * @file __tests__/controllers/authController.test.js
 * @description Unit tests for authController.
 * All external dependencies (User model, jwt) are mocked.
 */

jest.mock('../../models/User');
jest.mock('jsonwebtoken');

const authController = require('../../controllers/authController');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// ── Shared mock helpers ──────────────────────────────────────────────────────

const buildReqRes = (body = {}, userPayload = null) => {
  const req = { body, user: userPayload };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

/** Builds a mock User document matching the updated model */
const mockUser = (overrides = {}) => ({
  _id: 'user_id_123',
  name: 'Priya Sharma',
  email: 'priya@example.com',
  role: 'voter',
  preferences: { highContrast: false, fontSize: 'medium' },
  progress: { registrationCompleted: false, candidatesResearched: false, voted: false },
  savedCandidates: [],
  comparePassword: jest.fn(),
  save: jest.fn(),
  ...overrides,
});

// ── register ─────────────────────────────────────────────────────────────────

describe('AuthController — register()', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 409 if email already exists', async () => {
    const { req, res, next } = buildReqRes({ name: 'X', email: 'exists@x.com', password: 'Pass1234' });
    User.findOne.mockResolvedValue(mockUser());
    await authController.register(req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('returns 201 with token on success', async () => {
    const { req, res, next } = buildReqRes({ name: 'New', email: 'new@x.com', password: 'Pass1234' });
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(mockUser({ _id: 'new_id' }));
    jwt.sign.mockImplementation((_, __, ___, cb) => cb(null, 'jwt_token_abc'));

    await authController.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.token).toBe('jwt_token_abc');
    expect(body.user).not.toHaveProperty('password');
  });

  test('calls next(err) on unexpected database error', async () => {
    const { req, res, next } = buildReqRes({ name: 'X', email: 'x@x.com', password: 'Pass1234' });
    const dbError = new Error('DB connection lost');
    User.findOne.mockRejectedValue(dbError);
    await authController.register(req, res, next);
    expect(next).toHaveBeenCalledWith(dbError);
  });
});

// ── login ─────────────────────────────────────────────────────────────────────

describe('AuthController — login()', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 401 when user is not found', async () => {
    const { req, res, next } = buildReqRes({ email: 'ghost@x.com', password: 'pass' });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await authController.login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'Invalid email or password.' })
    );
  });

  test('returns 401 when password does not match', async () => {
    const user = mockUser();
    user.comparePassword.mockResolvedValue(false);
    const { req, res, next } = buildReqRes({ email: 'priya@example.com', password: 'wrongpass' });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    await authController.login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 200 with token on successful login', async () => {
    const user = mockUser();
    user.comparePassword.mockResolvedValue(true);
    const { req, res, next } = buildReqRes({ email: 'priya@example.com', password: 'correct' });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    jwt.sign.mockImplementation((_, __, ___, cb) => cb(null, 'login_token'));

    await authController.login(req, res, next);

    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.token).toBe('login_token');
    expect(body.user.email).toBe('priya@example.com');
    // Password must never appear in response
    expect(body.user).not.toHaveProperty('password');
  });

  test('calls next(err) on unexpected error', async () => {
    const { req, res, next } = buildReqRes({ email: 'a@a.com', password: 'pass' });
    const dbError = new Error('Timeout');
    User.findOne.mockReturnValue({ select: jest.fn().mockRejectedValue(dbError) });
    await authController.login(req, res, next);
    expect(next).toHaveBeenCalledWith(dbError);
  });
});

// ── getMe ─────────────────────────────────────────────────────────────────────

describe('AuthController — getMe()', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 404 when user does not exist', async () => {
    const { req, res, next } = buildReqRes({}, { id: 'ghost_id' });
    User.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    await authController.getMe(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns the user profile on success', async () => {
    const user = mockUser();
    const { req, res, next } = buildReqRes({}, { id: user._id });
    User.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(user) });
    await authController.getMe(req, res, next);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data.email).toBe('priya@example.com');
  });
});

// ── updateProgress ────────────────────────────────────────────────────────────

describe('AuthController — updateProgress()', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 400 when progress object is missing', async () => {
    const { req, res, next } = buildReqRes({}, { id: 'uid' });
    await authController.updateProgress(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('whitelists only valid progress keys', async () => {
    const { req, res, next } = buildReqRes(
      { progress: { registrationCompleted: true, hackedField: true } },
      { id: 'uid' }
    );
    const updatedUser = mockUser({ progress: { registrationCompleted: true } });
    User.findByIdAndUpdate.mockReturnValue({
      lean: jest.fn().mockResolvedValue(updatedUser),
    });
    await authController.updateProgress(req, res, next);

    const [, updateDoc] = User.findByIdAndUpdate.mock.calls[0];
    // Whitelisted key is set
    expect(updateDoc.$set['progress.registrationCompleted']).toBe(true);
    // Non-whitelisted key must NOT be set
    expect(updateDoc.$set['progress.hackedField']).toBeUndefined();
  });
});
