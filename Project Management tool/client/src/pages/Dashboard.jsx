import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { 
  HiOutlineCollection, 
  HiOutlineClipboardList, 
  HiOutlineCheckCircle, 
  HiOutlineExclamationCircle,
  HiOutlineClock
} from 'react-icons/hi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const { data } = await dashboardAPI.getStats();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch dashboard statistics. Make sure the backend server is running and configured.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
        <button onClick={fetchDashboardData} className="btn btn-secondary mt-md">
          Retry Connection
        </button>
      </div>
    );
  }

  // Get status color based on priority
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'badge badge-urgent';
      case 'high': return 'badge badge-high';
      case 'medium': return 'badge badge-medium';
      default: return 'badge badge-low';
    }
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return { label: 'No Deadline', class: 'normal' };
    const diff = new Date(deadline) - new Date();
    if (diff < 0) return { label: 'Overdue', class: 'urgent' };
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 2) return { label: `Due in ${days}d`, class: 'soon' };
    return { label: `Due on ${new Date(deadline).toLocaleDateString()}`, class: 'normal' };
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Track projects, task progress, and upcoming deadlines</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card indigo">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Projects</span>
            <div className="stat-card-icon indigo">
              <HiOutlineCollection />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalProjects}</div>
          <div className="stat-card-change">Active: {stats.activeProjects}</div>
        </div>

        <div className="stat-card amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Tasks</span>
            <div className="stat-card-icon amber">
              <HiOutlineClipboardList />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalTasks}</div>
          <div className="stat-card-change">
            Pending: {stats.todoTasks + stats.inProgressTasks + stats.reviewTasks}
          </div>
        </div>

        <div className="stat-card emerald">
          <div className="stat-card-header">
            <span className="stat-card-label">Completed Tasks</span>
            <div className="stat-card-icon emerald">
              <HiOutlineCheckCircle />
            </div>
          </div>
          <div className="stat-card-value">{stats.completedTasks}</div>
          <div className="stat-card-change">
            Rate: {stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% completion
          </div>
        </div>

        <div className="stat-card rose">
          <div className="stat-card-header">
            <span className="stat-card-label">Overdue Tasks</span>
            <div className="stat-card-icon rose">
              <HiOutlineExclamationCircle />
            </div>
          </div>
          <div className="stat-card-value">{stats.overdueTasks}</div>
          <div className="stat-card-change">Action required immediately</div>
        </div>
      </div>

      {/* Dashboard Lists */}
      <div className="dashboard-grid">
        {/* Recent Tasks */}
        <div className="card">
          <h2 className="section-title">
            <HiOutlineClock /> Recent Task Updates
          </h2>
          {stats.recentTasks.length === 0 ? (
            <p className="text-secondary text-sm">No tasks have been updated yet.</p>
          ) : (
            <div className="flex flex-col gap-sm">
              {stats.recentTasks.map(task => (
                <div key={task._id} className="recent-task-item">
                  <div 
                    className="recent-task-dot" 
                    style={{ backgroundColor: task.project?.color || 'var(--color-indigo)' }}
                  />
                  <div className="recent-task-content">
                    <div className="recent-task-title">{task.title}</div>
                    <div className="recent-task-project">{task.project?.title}</div>
                  </div>
                  <span className={getPriorityClass(task.priority)}>{task.priority}</span>
                  <span className={`badge badge-${task.status}`}>{task.status.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <h2 className="section-title">
            <HiOutlineClock /> Upcoming Deadlines
          </h2>
          {stats.upcomingDeadlines.length === 0 ? (
            <p className="text-secondary text-sm">No upcoming deadlines found.</p>
          ) : (
            <div className="flex flex-col gap-sm">
              {stats.upcomingDeadlines.map(task => {
                const dlStatus = getDeadlineStatus(task.deadline);
                return (
                  <div key={task._id} className={`deadline-item ${dlStatus.class}`}>
                    <div className="deadline-info">
                      <div className="deadline-task-title">{task.title}</div>
                      <div className="recent-task-project">{task.project?.title}</div>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className={`deadline-date ${dlStatus.class}`}>{dlStatus.label}</span>
                      {task.assignee && (
                        <div className="user-avatar" title={task.assignee.name} style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>
                          {task.assignee.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
