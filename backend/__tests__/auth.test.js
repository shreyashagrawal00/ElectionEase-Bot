const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Setup mock app
const app = express();
app.use(express.json());
require('dotenv').config();

// Mock User Model
jest.mock('../models/User');
const User = require('../models/User');

const authRoutes = require('../routes/authRoutes');
app.use('/api/auth', authRoutes);

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      User.findOne.mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue({ _id: '123' });
      jest.spyOn(jwt, 'sign').mockImplementation((payload, secret, options, cb) => cb(null, 'mockedToken'));

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password123' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });
  });
});
