const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ── Sub-schemas ──────────────────────────────────────────────────────────────

/** Saved candidate watchlist item */
const SavedCandidateSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  party:      { type: String, trim: true },
  bio: {
    en: String,
    hi: String,
    mr: String,
  },
  platform:   [{ type: String, trim: true }],
  electionId: { type: String },
}, { _id: false });

// ── Main Schema ──────────────────────────────────────────────────────────────

/**
 * @typedef {Object} IUser
 * @property {string}   name
 * @property {string}   email
 * @property {string}   password         - bcrypt-hashed, never returned
 * @property {string}   role
 * @property {object}   preferences
 * @property {object}   progress
 * @property {Array}    savedCandidates
 * @property {string}   [resetPasswordToken]
 * @property {Date}     [resetPasswordExpires]
 * @property {Date}     createdAt
 * @property {Date}     updatedAt
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters.'],
      maxlength: [80, 'Name cannot exceed 80 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters.'],
      select: false, // Never returned by default in queries
    },
    role: {
      type: String,
      enum: { values: ['voter', 'admin', 'specialist'], message: 'Role must be voter, admin, or specialist.' },
      default: 'voter',
    },
    preferences: {
      highContrast: { type: Boolean, default: false },
      fontSize:     { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    },
    progress: {
      registrationCompleted: { type: Boolean, default: false },
      candidatesResearched:  { type: Boolean, default: false },
      voted:                 { type: Boolean, default: false },
    },
    savedCandidates: {
      type: [SavedCandidateSchema],
      default: [],
    },
    // Password reset — tokens are hashed before storage (see pre-save hook)
    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpires: { type: Date,   select: false },
  },
  {
    timestamps: true,
    // Prevent returning __v in API responses
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// email is already indexed by `unique: true`; add a compound index for token lookups
UserSchema.index({ resetPasswordToken: 1, resetPasswordExpires: 1 });

// ── Pre-save Hook: Password Hashing ──────────────────────────────────────────

UserSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance Method: Compare Password ────────────────────────────────────────

/**
 * Compares a plaintext password against the stored hash.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
