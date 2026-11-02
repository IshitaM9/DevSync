const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  workspaceId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  status: { type: String, default: 'ACTIVE' },
  ownerId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
