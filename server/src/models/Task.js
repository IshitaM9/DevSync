const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  workspaceId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, default: 'TODO' },
  priority: { type: String, default: 'MEDIUM' },
  assigneeId: String,
  reporterId: String,
  dueDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
