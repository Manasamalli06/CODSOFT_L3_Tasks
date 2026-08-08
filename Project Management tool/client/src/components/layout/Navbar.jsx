import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Dashboard',
  '/projects': 'Projects',
};

const Navbar = () => {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith('/projects/')) {
      return 'Project Details';
    }
    return pageTitles[location.pathname] || 'ProjectFlow';
  };

  return (
    <nav className="navbar">
      <h1 className="navbar-title">{getTitle()}</h1>
      <div className="navbar-actions">
        <span className="text-sm text-secondary">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
