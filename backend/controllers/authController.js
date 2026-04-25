const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email: normalizedEmail, password });
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, preferences: user.preferences, progress: user.progress } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, preferences: user.preferences, progress: user.progress } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    let user = await User.findById(req.user.id);
    user.progress = { ...user.progress, ...progress };
    await user.save();
    res.json(user.progress);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.toggleSavedCandidate = async (req, res) => {
  try {
    const { candidate } = req.body; // candidate contains name, party, bio, platform, electionId
    let user = await User.findById(req.user.id);
    
    const existingIndex = user.savedCandidates.findIndex(
      c => c.name === candidate.name && c.party === candidate.party
    );

    if (existingIndex > -1) {
      // Remove if exists
      user.savedCandidates.splice(existingIndex, 1);
    } else {
      // Add if not exists
      user.savedCandidates.push(candidate);
    }

    await user.save();
    res.json(user.savedCandidates);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
const crypto = require('crypto');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Mock Email Sending
    console.log(`Password reset link: http://localhost:5173/reset-password/${resetToken}`);
    
    res.json({ msg: 'Recovery link sent to your email (check server console for mock link)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ msg: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
