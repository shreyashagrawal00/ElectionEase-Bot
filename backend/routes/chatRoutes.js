const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

// We allow non-authenticated users to use the chatbot for basic info, 
// but we can pass user context if they are logged in.
router.post('/', chatController.getChatResponse);

module.exports = router;
