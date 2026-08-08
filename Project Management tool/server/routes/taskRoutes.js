const express = require('express');
const { body } = require('express-validator');
const {
  getTasksByProject,
  createTask,
  getTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

const router = express.Router();

// Tasks scoped to a project
router.route('/projects/:projectId/tasks')
  .get(auth, getTasksByProject)
  .post(auth, [
    body('title').trim().notEmpty().withMessage('Task title is required')
  ], createTask);

// Individual task operations
router.route('/tasks/:id')
  .get(auth, getTask)
  .put(auth, updateTask)
  .delete(auth, deleteTask);

module.exports = router;
