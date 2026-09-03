const Project = require('../models/Project');

// @desc Get all projects for the logged-in user
// @route GET /api/projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get a single project by id (must be owner or member)
// @route GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).populate('comments.user', 'name');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a new project
// @route POST /api/projects
const createProject = async (req, res) => {
  try {
    const { title, description, priority, deadline } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const project = await Project.create({
      title,
      description,
      priority,
      deadline,
      owner: req.user._id,
      activity: [{ action: 'Project created', user: req.user._id }],
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a project (status, priority, progress, etc.)
// @route PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this project' });
    }

    Object.assign(project, req.body);
    project.activity.push({ action: 'Project updated', user: req.user._id });
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Archive a project
// @route PUT /api/projects/:id/archive
const archiveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.status = 'archived';
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a project
// @route DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add a comment to a project
// @route POST /api/projects/:id/comments
const addComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.comments.push({ user: req.user._id, text: req.body.text });
    await project.save();
    res.status(201).json(project.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, archiveProject, deleteProject, addComment };
