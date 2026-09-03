const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const FileItem = require('../models/FileItem');

const router = express.Router();

// Multer disk storage config - saves to /uploads with a unique filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

router.use(protect);

// @desc Upload a file
// @route POST /api/files
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileDoc = await FileItem.create({
      owner: req.user._id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      folder: req.body.folder || 'general',
      url: `/uploads/${req.file.filename}`,
    });

    res.status(201).json(fileDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc List my files
// @route GET /api/files
router.get('/', async (req, res) => {
  try {
    const files = await FileItem.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Delete a file
// @route DELETE /api/files/:id
router.delete('/:id', async (req, res) => {
  try {
    const file = await FileItem.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
