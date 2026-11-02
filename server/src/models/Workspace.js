const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  ownerId: { type: String, required: true },
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);
