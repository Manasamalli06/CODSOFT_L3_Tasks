import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiPackage, FiSearch, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">NexStore</span>
        </Link>

        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearch} id="navbar-search-form">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            id="navbar-search-input"
          />
        </form>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <Link to="/products" className="nav-link" id="nav-link-products">
            Shop
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/orders" className="nav-link" id="nav-link-orders">
                <FiPackage />
                Orders
              </Link>
              <Link to="/profile" className="nav-link nav-user-info" id="nav-link-profile">
                <FiUser />
                <span>{user?.name}</span>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link nav-admin-link" id="nav-link-admin">
                  <FiShield />
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="nav-link nav-logout" id="nav-logout-btn">
                <FiLogOut />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" id="nav-link-login">
              Sign In
            </Link>
          )}

          <Link to="/cart" className="nav-cart" id="nav-cart-link">
            <FiShoppingCart />
            {cartCount > 0 && (
              <span className="cart-badge" id="cart-badge">{cartCount}</span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="mobile-controls">
          <Link to="/cart" className="nav-cart mobile-cart" id="mobile-cart-link">
            <FiShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu animate-fade-in" id="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>

          <Link
            to="/products"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Shop All Products
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/orders"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiPackage /> My Orders
              </Link>
              <Link
                to="/profile"
                className="mobile-nav-link mobile-nav-user"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiUser /> {user?.name}
              </Link>
              <button onClick={handleLogout} className="mobile-nav-link mobile-logout">
                <FiLogOut /> Logout
              </button>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="mobile-nav-link mobile-admin-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiShield /> Admin Dashboard
                </Link>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
