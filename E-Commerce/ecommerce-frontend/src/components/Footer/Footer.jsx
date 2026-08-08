import { Link } from 'react-router-dom';
import { FiGithub, FiMail, FiHeart } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="main-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">◆</span>
              <span>NexStore</span>
            </Link>
            <p className="footer-description">
              Your premium destination for curated products. Quality meets style in every purchase.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <Link to="/products" className="footer-link">All Products</Link>
            <Link to="/products?category=Electronics" className="footer-link">Electronics</Link>
            <Link to="/products?category=Fashion" className="footer-link">Fashion</Link>
            <Link to="/products?category=Home+%26+Kitchen" className="footer-link">Home & Kitchen</Link>
            <Link to="/products?category=Books" className="footer-link">Books</Link>
          </div>

          {/* Account */}
          <div className="footer-section">
            <h4 className="footer-heading">Account</h4>
            <Link to="/login" className="footer-link">Sign In</Link>
            <Link to="/register" className="footer-link">Create Account</Link>
            <Link to="/cart" className="footer-link">Shopping Cart</Link>
            <Link to="/orders" className="footer-link">Order History</Link>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4 className="footer-heading">Contact</h4>
            <a href="mailto:support@nexstore.com" className="footer-link">
              <FiMail /> support@nexstore.com
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              <FiGithub /> GitHub
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 NexStore — CODSOFT Level 3 Project</p>
          <p className="footer-love">
            Made with <FiHeart className="heart-icon" /> for learning
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
