const Note = require('../models/Note');

// @desc Get all notes for the logged-in user
// @route GET /api/notes
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user._id }).sort({ pinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a note
// @route POST /api/notes
const createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.create({ title: title || 'Untitled', content, tags, owner: req.user._id });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a note (also used for auto-save)
// @route PUT /api/notes/:id
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a note
// @route DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
