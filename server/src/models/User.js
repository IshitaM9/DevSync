const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
  role: { type: String, default: 'USER' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
