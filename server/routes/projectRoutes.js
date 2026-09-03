const express = require('express');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  archiveProject,
  deleteProject,
  addComment,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every route below requires a valid JWT

router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProjectById).put(updateProject).delete(deleteProject);
router.put('/:id/archive', archiveProject);
router.post('/:id/comments', addComment);

module.exports = router;
