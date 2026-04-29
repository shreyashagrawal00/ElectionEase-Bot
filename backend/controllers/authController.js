const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Signs a JWT for the given user ID.
 * @param {string} userId
 * @returns {string} Signed token
 */
const signToken = (userId) =>
  new Promise((resolve, reject) => {
    jwt.sign(
      { user: { id: userId } },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '5d' },
      (err, token) => (err ? reject(err) : resolve(token))
    );
  });

/**
 * Builds the public user payload returned to clients.
 * Sensitive fields are excluded.
 * @param {import('../models/User').IUser} user
 * @returns {object}
 */
const buildUserPayload = (user) => ({
  id:          user._id,
  name:        user.name,
  email:       user.email,
  role:        user.role,
  preferences: user.preferences,
  progress:    user.progress,
});

// ── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Create a new voter account
 * @access  Public
 * @note    Input is pre-validated and sanitized by middleware/validate.js
 */
exports.register = async (req, res, next) => {
  console.log('[DEBUG] Register started');
  console.log('[DEBUG] typeof next:', typeof next);
  const { name, email, password } = req.body;
  try {
    console.log('[DEBUG] Checking existing user for:', email);
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('[DEBUG] User already exists');
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    console.log('[DEBUG] Creating user...');
    // Log before Mongoose creation to see if it hangs or throws
    const user = await User.create({ name, email, password });
    console.log('[DEBUG] User created successfully');

    console.log('[DEBUG] Signing token...');
    const token = await signToken(user._id);
    console.log('[DEBUG] Token signed');

    return res.status(201).json({
      success: true,
      token,
      user: buildUserPayload(user),
    });
  } catch (err) {
    console.error('[DEBUG] Catch block reached. Error:', err.message);
    console.error('[DEBUG] Error Stack:', err.stack);
    
    if (typeof next === 'function') {
      console.log('[DEBUG] Calling next(err)');
      next(err);
    } else {
      console.error('[DEBUG] next is NOT a function in catch block!');
      res.status(500).json({ 
        success: false, 
        error: err.message,
        debug: 'next is not a function in controller catch block'
      });
    }
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 * @note    Input is pre-validated by middleware/validate.js
 */
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Explicitly select password since it is select:false on the model
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = await signToken(user._id);

    return res.json({
      success: true,
      token,
      user: buildUserPayload(user),
    });
  } catch (err) {
    console.error('[AuthController] Login error:', err.message);
    if (typeof next === 'function') {
      next(err);
    } else {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user's profile
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }
    return res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/auth/progress
 * @desc    Update voter's self-reported readiness progress
 * @access  Private
 */
exports.updateProgress = async (req, res, next) => {
  const { progress } = req.body;
  if (!progress || typeof progress !== 'object') {
    return res.status(400).json({ success: false, error: 'A progress object is required.' });
  }

  // Whitelist allowed progress keys to prevent arbitrary field injection
  const allowed = ['registrationCompleted', 'candidatesResearched', 'voted'];
  const sanitized = {};
  for (const key of allowed) {
    if (key in progress) sanitized[`progress.${key}`] = Boolean(progress[key]);
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: sanitized },
      { new: true, runValidators: true }
    ).lean();

    return res.json({ success: true, data: user.progress });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/auth/save-candidate
 * @desc    Add or remove a candidate from the user's personal watchlist
 * @access  Private
 */
exports.toggleSavedCandidate = async (req, res, next) => {
  const { candidate } = req.body;
  if (!candidate?.name) {
    return res.status(400).json({ success: false, error: 'Candidate name is required.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const existingIndex = user.savedCandidates.findIndex(
      (c) => c.name === candidate.name && c.party === candidate.party
    );

    if (existingIndex > -1) {
      user.savedCandidates.splice(existingIndex, 1);
    } else {
      user.savedCandidates.push(candidate);
    }

    await user.save();
    return res.json({ success: true, data: user.savedCandidates });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Issue a password-reset token (mocked email in dev)
 * @access  Public
 * @security Do not reveal whether a user exists (timing-attack mitigation)
 */
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    // Respond the same way whether user exists or not (prevents user enumeration)
    const successMsg = 'If an account with that email exists, a reset link has been sent.';

    if (!user) {
      return res.json({ success: true, msg: successMsg });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    // Store a hashed version — raw token travels in the email link
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 3600 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // In production: send email via SendGrid / SES / Nodemailer
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;
    console.log(`[AUTH] Password reset link for ${email}: ${resetLink}`);

    return res.json({ success: true, msg: successMsg });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using a valid reset token
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  const { token, password } = req.body;
  try {
    // Hash the incoming raw token to compare against the stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ success: false, error: 'Reset token is invalid or has expired.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ success: true, msg: 'Password has been reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
};
