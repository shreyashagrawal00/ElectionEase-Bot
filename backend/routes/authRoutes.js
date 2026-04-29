const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../middleware/validate');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);

// Protected routes (require valid JWT)
router.get('/me', authMiddleware, authController.getMe);
router.put('/progress', authMiddleware, authController.updateProgress);
router.put('/save-candidate', authMiddleware, authController.toggleSavedCandidate);

module.exports = router;
