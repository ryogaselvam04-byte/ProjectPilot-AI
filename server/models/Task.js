const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'testing', 'completed'],
      default: 'todo',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date },
    reminder: { type: Date },
    order: { type: Number, default: 0 }, // for drag-and-drop ordering within a column
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
