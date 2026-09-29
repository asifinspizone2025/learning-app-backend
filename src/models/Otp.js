const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  // Stores the full signup payload temporarily until OTP is verified,
  // so the actual User account is only created after successful verification.
  signupData: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // MongoDB TTL: auto-deletes this document after 300 seconds (5 min)
  },
});

module.exports = mongoose.model('Otp', otpSchema);