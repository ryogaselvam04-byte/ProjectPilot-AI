const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null }, // null = general assistant chat
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Fast lookup of "the last N messages for this user (+ optionally this project), oldest first"
chatMessageSchema.index({ owner: 1, project: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
