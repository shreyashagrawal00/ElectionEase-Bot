const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const chatController = require('../controllers/chatController');
const { validateChatMessage } = require('../middleware/validate');

/**
 * Stricter rate limiter for the AI endpoint to prevent abuse and control API costs.
 * 20 requests per minute per IP.
 */
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many AI requests. Please wait a moment before trying again.',
  },
});

/**
 * POST /api/chat
 * Public endpoint — allows unauthenticated users to ask election questions.
 * Validation and rate limiting are applied before the controller.
 */
router.post('/', aiRateLimiter, validateChatMessage, chatController.getChatResponse);

module.exports = router;
