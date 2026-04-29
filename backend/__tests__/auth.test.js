/**
 * @file __tests__/auth.test.js
 * @description Integration tests for the /api/auth routes.
 * Uses the real Express app (index.js) with a mocked User model.
 */

require('dotenv').config();
jest.mock('../models/User');
jest.mock('jsonwebtoken');

const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const mockUser = (overrides = {}) => ({
  _id: 'user_id_123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'voter',
  preferences: {},
  progress: {},
  savedCandidates: [],
  comparePassword: jest.fn(),
  save: jest.fn(),
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

// ── POST /api/auth/register ───────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  test('201 — creates a new user', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(mockUser());
    jwt.sign.mockImplementation((_, __, ___, cb) => cb(null, 'test_token'));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'SecurePass1' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
  });

  test('400 — rejects missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'SecurePass1' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('400 — rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'not-valid', password: 'SecurePass1' });
    expect(res.statusCode).toBe(400);
  });

  test('400 — rejects password shorter than 8 chars', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'short' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('409 — returns conflict when email already exists', async () => {
    User.findOne.mockResolvedValue(mockUser());
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'SecurePass1' });
    expect(res.statusCode).toBe(409);
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  test('200 — returns token on valid credentials', async () => {
    const user = mockUser();
    user.comparePassword.mockResolvedValue(true);
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    jwt.sign.mockImplementation((_, __, ___, cb) => cb(null, 'login_token'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'SecurePass1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe('login_token');
  });

  test('401 — returns error on wrong password', async () => {
    const user = mockUser();
    user.comparePassword.mockResolvedValue(false);
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'WrongPass1' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('400 — rejects missing password field', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(400);
  });
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────

describe('POST /api/auth/forgot-password', () => {
  test('200 — returns same message whether user exists or not (prevents enumeration)', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'ghost@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 — rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'bad-email' });
    expect(res.statusCode).toBe(400);
  });
});

// ── Health Check ──────────────────────────────────────────────────────────────

describe('GET /health', () => {
  test('200 — returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────

describe('Unknown routes', () => {
  test('404 — returns not found for undefined routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
