const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getDashboardStats
} = require('../controllers/projectController');
const auth = require('../middleware/auth');

const router = express.Router();

// Dashboard stats
router.get('/dashboard/stats', auth, getDashboardStats);

// Project CRUD
router.route('/')
  .get(auth, getProjects)
  .post(auth, [
    body('title').trim().notEmpty().withMessage('Project title is required')
  ], createProject);

router.route('/:id')
  .get(auth, getProject)
  .put(auth, [
    body('title').optional().trim().notEmpty().withMessage('Project title cannot be empty')
  ], updateProject)
  .delete(auth, deleteProject);

module.exports = router;
