const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['voter', 'admin', 'specialist'], default: 'voter' },
  preferences: {
    highContrast: { type: Boolean, default: false },
    fontSize: { type: String, default: 'medium' }
  },
  progress: {
    registrationCompleted: { type: Boolean, default: false },
    candidatesResearched: { type: Boolean, default: false },
    voted: { type: Boolean, default: false }
  }
}, { timestamps: true });

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);
