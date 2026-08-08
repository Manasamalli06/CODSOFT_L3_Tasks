const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects for current user
// @route   GET /api/projects
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Get task counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const counts = { total: 0, todo: 0, 'in-progress': 0, review: 0, done: 0 };
        taskCounts.forEach(tc => {
          counts[tc._id] = tc.count;
          counts.total += tc.count;
        });

        return { ...project.toObject(), taskCounts: counts };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const project = await Project.create({
      ...req.body,
      owner: req.user._id
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can update
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can update this project' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can delete this project' });
    }

    // Delete all tasks in the project
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project and all associated tasks deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get user's projects
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }]
    });
    const projectIds = projects.map(p => p._id);

    // Task stats
    const taskStats = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalTasks: 0,
      todoTasks: 0,
      inProgressTasks: 0,
      reviewTasks: 0,
      completedTasks: 0
    };

    taskStats.forEach(ts => {
      stats.totalTasks += ts.count;
      if (ts._id === 'todo') stats.todoTasks = ts.count;
      if (ts._id === 'in-progress') stats.inProgressTasks = ts.count;
      if (ts._id === 'review') stats.reviewTasks = ts.count;
      if (ts._id === 'done') stats.completedTasks = ts.count;
    });

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: { $ne: 'done' },
      deadline: { $lt: new Date() }
    });
    stats.overdueTasks = overdueTasks;

    // Recent tasks
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'title color')
      .populate('assignee', 'name avatar')
      .sort({ updatedAt: -1 })
      .limit(10);
    stats.recentTasks = recentTasks;

    // Upcoming deadlines
    const upcomingDeadlines = await Task.find({
      project: { $in: projectIds },
      status: { $ne: 'done' },
      deadline: { $gte: new Date() }
    })
      .populate('project', 'title color')
      .populate('assignee', 'name avatar')
      .sort({ deadline: 1 })
      .limit(5);
    stats.upcomingDeadlines = upcomingDeadlines;

    res.json(stats);
  } catch (error) {
    next(error);
  }
};
