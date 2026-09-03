const Task = require('../models/Task');

// @desc Get all tasks for the logged-in user (optionally by project)
// @route GET /api/tasks?project=:projectId
const getTasks = async (req, res) => {
  try {
    const filter = { owner: req.user._id };
    if (req.query.project) filter.project = req.query.project;
    const tasks = await Task.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a task
// @route POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, project, priority, dueDate, status } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const task = await Task.create({
      title,
      description,
      project,
      priority,
      dueDate,
      status: status || 'todo',
      owner: req.user._id,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a task (used for Kanban drag-and-drop status changes too)
// @route PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a task
// @route DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
