import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../services/api';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { 
  HiChevronLeft, 
  HiPlus, 
  HiOutlineCalendar, 
  HiOutlineTag,
  HiOutlinePencilAlt,
  HiOutlineTrash
} from 'react-icons/hi';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Task Form State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('todo');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [isTaskSaving, setIsTaskSaving] = useState(false);
  const [taskError, setTaskError] = useState('');

  // Project Edit Form State
  const [isProjModalOpen, setIsProjModalOpen] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projStatus, setProjStatus] = useState('planning');
  const [projDeadline, setProjDeadline] = useState('');
  const [projColor, setProjColor] = useState('#6366f1');
  const [isProjSaving, setIsProjSaving] = useState(false);
  const [projError, setProjError] = useState('');

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      setIsLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        projectsAPI.getOne(id),
        tasksAPI.getByProject(id)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);

      // Pre-fill edit modal states
      setProjTitle(projRes.data.title);
      setProjDesc(projRes.data.description || '');
      setProjStatus(projRes.data.status);
      setProjColor(projRes.data.color);
      if (projRes.data.deadline) {
        setProjDeadline(projRes.data.deadline.split('T')[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this project and all its tasks? This action cannot be undone.')) {
      return;
    }

    try {
      await projectsAPI.delete(id);
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setProjError('');
    setIsProjSaving(true);

    try {
      const { data } = await projectsAPI.update(id, {
        title: projTitle,
        description: projDesc,
        status: projStatus,
        deadline: projDeadline || null,
        color: projColor
      });
      setProject(data);
      setIsProjModalOpen(false);
    } catch (err) {
      setProjError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setIsProjSaving(false);
    }
  };

  const openTaskModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskTitle(task.title);
      setTaskDesc(task.description || '');
      setTaskStatus(task.status);
      setTaskPriority(task.priority);
      setTaskDeadline(task.deadline ? task.deadline.split('T')[0] : '');
      setTaskAssignee(task.assignee?._id || '');
    } else {
      setEditingTask(null);
      setTaskTitle('');
      setTaskDesc('');
      setTaskStatus('todo');
      setTaskPriority('medium');
      setTaskDeadline('');
      setTaskAssignee('');
    }
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskStatus('todo');
    setTaskPriority('medium');
    setTaskDeadline('');
    setTaskAssignee('');
    setTaskError('');
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setTaskError('');
    setIsTaskSaving(true);

    try {
      const payload = {
        title: taskTitle,
        description: taskDesc,
        status: taskStatus,
        priority: taskPriority,
        deadline: taskDeadline || null,
        assignee: taskAssignee || null
      };

      if (editingTask) {
        const { data } = await tasksAPI.update(editingTask._id, payload);
        setTasks(tasks.map(t => t._id === editingTask._id ? data : t));
      } else {
        const { data } = await tasksAPI.create(id, payload);
        setTasks([data, ...tasks]);
      }
      closeTaskModal();
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setIsTaskSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await tasksAPI.delete(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
      closeTaskModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const moveTask = async (task, newStatus) => {
    try {
      const { data } = await tasksAPI.update(task._id, { status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? data : t));
    } catch (err) {
      console.error('Failed to move task status', err);
    }
  };

  // Group tasks by column
  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  const isOwner = project?.owner?._id === currentUser?._id;

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--color-rose)' }}>
        <h3 style={{ color: 'var(--color-rose)', marginBottom: '0.5rem' }}>Error</h3>
        <p className="text-secondary">{error}</p>
        <Link to="/projects" className="btn btn-secondary mt-md">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Project Detail Header */}
      <div className="project-header">
        <div className="project-header-top">
          <Link to="/projects" className="project-back-btn">
            <HiChevronLeft size={20} />
          </Link>
          <span className={`badge badge-${project.status}`}>
            {project.status.replace('-', ' ')}
          </span>
        </div>

        <div className="project-header-info">
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div className="color-dot" style={{ backgroundColor: project.color, width: '16px', height: '16px' }} />
              {project.title}
            </h1>
            <p className="text-secondary mt-sm" style={{ maxWidth: '700px' }}>
              {project.description || 'No description provided.'}
            </p>
            
            <div className="project-header-meta">
              {project.deadline && (
                <span className="flex items-center gap-sm text-xs text-muted font-semibold">
                  <HiOutlineCalendar /> Deadline: {new Date(project.deadline).toLocaleDateString()}
                </span>
              )}
              <span className="text-xs text-muted font-semibold">
                Owner: {project.owner?.name}
              </span>
              <span className="text-xs text-muted font-semibold">
                Team: {project.members?.length + 1} members
              </span>
            </div>
          </div>

          <div className="page-header-actions">
            {isOwner && (
              <>
                <button className="btn btn-secondary" onClick={() => setIsProjModalOpen(true)}>
                  <HiOutlinePencilAlt /> Edit Project
                </button>
                <button className="btn btn-danger" onClick={handleDeleteProject}>
                  <HiOutlineTrash /> Delete
                </button>
              </>
            )}
            <button className="btn btn-primary" onClick={() => openTaskModal()}>
              <HiPlus /> New Task
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {/* columns: todo, in-progress, review, done */}
        {['todo', 'in-progress', 'review', 'done'].map(col => {
          const colTasks = getTasksByStatus(col);
          return (
            <div key={col} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span className={`kanban-column-dot ${col}`} />
                  {col === 'in-progress' ? 'In Progress' : col.charAt(0).toUpperCase() + col.slice(1)}
                </div>
                <span className="kanban-column-count">{colTasks.length}</span>
              </div>

              <div className="kanban-column-body">
                {colTasks.length === 0 ? (
                  <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                    No tasks
                  </div>
                ) : (
                  colTasks.map(task => {
                    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
                    return (
                      <div
                        key={task._id}
                        className="task-card"
                        onClick={() => openTaskModal(task)}
                      >
                        <div className="task-card-title">{task.title}</div>
                        
                        <div className="task-card-meta">
                          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                          {task.deadline && (
                            <span className={`task-card-deadline ${isOverdue ? 'overdue' : ''}`}>
                              <HiOutlineCalendar />
                              {new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                            </span>
                          )}
                        </div>

                        <div className="task-card-footer">
                          <div className="task-card-assignee">
                            <div className="user-avatar" title={task.assignee?.name || 'Unassigned'}>
                              {task.assignee?.name ? task.assignee.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="task-card-assignee-name">
                              {task.assignee?.name || 'Unassigned'}
                            </span>
                          </div>

                          {/* Fast move options */}
                          <select
                            className="filter-select text-xs"
                            style={{ padding: '0.2rem 1.5rem 0.2rem 0.4rem', border: 'none', background: 'var(--color-bg-tertiary)' }}
                            value={task.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => moveTask(task, e.target.value)}
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <form onSubmit={handleTaskSubmit}>
          {taskError && <div className="auth-error">{taskError}</div>}

          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Design homepage wireframe"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              disabled={isTaskSaving}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Provide more detail about the task..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              disabled={isTaskSaving}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                disabled={isTaskSaving}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                disabled={isTaskSaving}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                type="date"
                className="form-input"
                value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
                disabled={isTaskSaving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select
                className="form-select"
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                disabled={isTaskSaving}
              >
                <option value="">Unassigned</option>
                {project.owner && (
                  <option value={project.owner._id}>
                    {project.owner.name} (Owner)
                  </option>
                )}
                {project.members?.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 'var(--space-md) 0 0', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
            <div>
              {editingTask && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDeleteTask(editingTask._id)}
                  disabled={isTaskSaving}
                >
                  Delete Task
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeTaskModal}
                disabled={isTaskSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isTaskSaving}
              >
                {isTaskSaving ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Project Edit Modal */}
      <Modal
        isOpen={isProjModalOpen}
        onClose={() => setIsProjModalOpen(false)}
        title="Edit Project Details"
      >
        <form onSubmit={handleUpdateProject}>
          {projError && <div className="auth-error">{projError}</div>}

          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input
              type="text"
              className="form-input"
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              required
              disabled={isProjSaving}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              disabled={isProjSaving}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                type="date"
                className="form-input"
                value={projDeadline}
                onChange={(e) => setProjDeadline(e.target.value)}
                disabled={isProjSaving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={projStatus}
                onChange={(e) => setProjStatus(e.target.value)}
                disabled={isProjSaving}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Project Color Theme</label>
            <div className="flex gap-sm items-center">
              {['#6366f1', '#34d399', '#22d3ee', '#fbbf24', '#fb7185', '#8b5cf6'].map(col => (
                <button
                  key={col}
                  type="button"
                  className="color-dot"
                  style={{ 
                    backgroundColor: col, 
                    border: projColor === col ? '2px solid white' : 'none',
                    transform: projColor === col ? 'scale(1.2)' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setProjColor(col)}
                  disabled={isProjSaving}
                />
              ))}
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 'var(--space-md) 0 0', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsProjModalOpen(false)}
              disabled={isProjSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isProjSaving}
            >
              {isProjSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
