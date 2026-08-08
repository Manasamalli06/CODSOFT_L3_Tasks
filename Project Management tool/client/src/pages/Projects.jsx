import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, authAPI } from '../services/api';
import Modal from '../components/common/Modal';
import { HiPlus, HiOutlineCollection, HiSearch } from 'react-icons/hi';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('planning');
  const [members, setMembers] = useState([]);
  const [color, setColor] = useState('#6366f1');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [projRes, usersRes] = await Promise.all([
        projectsAPI.getAll(),
        authAPI.getUsers()
      ]);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch projects data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    try {
      const { data } = await projectsAPI.create({
        title,
        description,
        deadline: deadline || null,
        status,
        members,
        color
      });
      setProjects([data, ...projects]);
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setDeadline('');
    setStatus('planning');
    setMembers([]);
    setColor('#6366f1');
    setFormError('');
  };

  const handleMemberToggle = (userId) => {
    if (members.includes(userId)) {
      setMembers(members.filter(id => id !== userId));
    } else {
      setMembers([...members, userId]);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProgress = (counts) => {
    if (!counts || counts.total === 0) return 0;
    return Math.round((counts.done / counts.total) * 100);
  };

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage, track, and collaborate on your team projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <HiPlus /> New Project
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <HiSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <HiOutlineCollection />
          </div>
          <h3 className="empty-state-title">No projects found</h3>
          <p className="empty-state-text">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search query or status filter.' 
              : 'Get started by creating your first project Flow.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map(project => {
            const progress = getProgress(project.taskCounts);
            return (
              <div
                key={project._id}
                className="card project-card"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div 
                  className="project-card-color" 
                  style={{ backgroundColor: project.color }}
                />
                
                <div className="project-card-header">
                  <div>
                    <h3 className="project-card-title">{project.title}</h3>
                    <span className={`badge badge-${project.status}`}>
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                <p className="project-card-desc">{project.description || 'No description provided.'}</p>

                <div className="mb-lg">
                  <div className="flex items-center justify-between mb-sm text-xs">
                    <span className="text-secondary font-semibold">Progress</span>
                    <span className="progress-text">{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="project-card-meta">
                  <div className="project-card-members">
                    {project.owner && (
                      <div 
                        className="user-avatar" 
                        title={`Owner: ${project.owner.name}`}
                        style={{ border: '2px solid var(--color-indigo)', zIndex: 10 }}
                      >
                        {project.owner.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {project.members?.slice(0, 3).map((member, idx) => (
                      <div
                        key={member._id}
                        className="user-avatar"
                        title={member.name}
                        style={{ zIndex: 9 - idx }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {project.members?.length > 3 && (
                      <div className="user-avatar" style={{ fontSize: '0.65rem', background: 'var(--color-bg-tertiary)' }}>
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>

                  {project.deadline && (
                    <span className="text-xs text-muted font-semibold">
                      Due: {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject}>
          {formError && <div className="auth-error">{formError}</div>}

          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Website Redesign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSaving}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Provide a brief summary of the project goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isSaving}
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
                    border: color === col ? '2px solid white' : 'none',
                    transform: color === col ? 'scale(1.2)' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setColor(col)}
                  disabled={isSaving}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assign Team Members</label>
            <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-sm)' }}>
              {users.map(u => (
                <label key={u._id} className="flex items-center gap-sm" style={{ padding: '0.25rem 0', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={members.includes(u._id)}
                    onChange={() => handleMemberToggle(u._id)}
                    disabled={isSaving}
                  />
                  <span>{u.name} ({u.email})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 'var(--space-md) 0 0', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
