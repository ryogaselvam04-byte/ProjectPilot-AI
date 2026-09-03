const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    folder: { type: String, default: 'general' },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FileItem', fileSchema);
