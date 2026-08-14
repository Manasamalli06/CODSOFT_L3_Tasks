import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiShoppingBag, FiTruck, FiShield, FiHeadphones, FiX, FiLock } from 'react-icons/fi';
import { productsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import './HomePage.css';

const categories = [
  { name: 'Electronics', icon: '🖥️', color: '#6366f1' },
  { name: 'Fashion', icon: '👕', color: '#f59e0b' },
  { name: 'Home & Kitchen', icon: '🏠', color: '#10b981' },
  { name: 'Books', icon: '📚', color: '#ef4444' },
];

const features = [
  {
    icon: <FiTruck />,
    title: 'Free Shipping',
    description: 'On orders over $100',
  },
  {
    icon: <FiShield />,
    title: 'Secure Payment',
    description: 'Encrypted transactions',
  },
  {
    icon: <FiShoppingBag />,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: <FiHeadphones />,
    title: '24/7 Support',
    description: 'Always here to help',
  },
];

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authRedirectPath, setAuthRedirectPath] = useState('/products');

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await productsAPI.getAll({ featured: 'true', limit: 8 });
        setFeaturedProducts(data.data);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Intercept shop navigation for unauthenticated users
  const handleShopClick = (e, targetPath = '/products') => {
    if (!isAuthenticated) {
      e.preventDefault();
      setAuthRedirectPath(targetPath);
      setShowAuthPrompt(true);
    }
  };

  return (
    <div className="home-page" id="home-page">
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
          <div className="hero-grid-pattern"></div>
        </div>

        <div className="container hero-content">
          <div className="hero-text animate-fade-in-up">
            <span className="hero-tag">✨ Premium Shopping Experience</span>
            <h1 className="hero-title">
              Discover <span className="hero-highlight">Premium</span> Products
              <br />
              Curated For You
            </h1>
            <p className="hero-subtitle">
              Explore our handpicked collection of electronics, fashion, home goods, and books.
              Quality meets style in every purchase.
            </p>
            <div className="hero-actions">
              <Link
                to="/products"
                className="btn btn-primary btn-lg"
                id="hero-shop-btn"
                onClick={(e) => handleShopClick(e, '/products')}
              >
                Shop Now <FiArrowRight />
              </Link>
              <Link
                to="/products?featured=true"
                className="btn btn-outline btn-lg"
                id="hero-featured-btn"
                onClick={(e) => handleShopClick(e, '/products?featured=true')}
              >
                Featured Items
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">20+</span>
                <span className="hero-stat-label">Products</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-value">4</span>
                <span className="hero-stat-label">Categories</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-value">Free</span>
                <span className="hero-stat-label">Shipping $100+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="features-strip" id="features-strip">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, i) => (
              <div key={i} className={`feature-item animate-fade-in-up stagger-${i + 1}`}>
                <div className="feature-icon">{feature.icon}</div>
                <div>
                  <h4 className="feature-title">{feature.title}</h4>
                  <p className="feature-desc">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="home-section" id="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Browse</span>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">
              Find exactly what you're looking for in our curated collections
            </p>
          </div>

          <div className="categories-grid">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`category-card animate-fade-in-up stagger-${i + 1}`}
                id={`category-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
                style={{ '--cat-color': cat.color }}
                onClick={(e) => handleShopClick(e, `/products?category=${encodeURIComponent(cat.name)}`)}
              >
                <span className="category-icon">{cat.icon}</span>
                <h3 className="category-name">{cat.name}</h3>
                <FiArrowRight className="category-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="home-section" id="featured-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Handpicked</span>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">
              Our most popular items, chosen for quality and value
            </p>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton" style={{ aspectRatio: '1/1' }}></div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="skeleton" style={{ height: '12px', width: '60%' }}></div>
                    <div className="skeleton" style={{ height: '16px', width: '80%' }}></div>
                    <div className="skeleton" style={{ height: '12px', width: '40%' }}></div>
                    <div className="skeleton" style={{ height: '20px', width: '30%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}

          <div className="section-cta">
            <Link
              to="/products"
              className="btn btn-outline btn-lg"
              id="view-all-btn"
              onClick={(e) => handleShopClick(e, '/products')}
            >
              View All Products <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner" id="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Shopping?</h2>
            <p className="cta-subtitle">
              Create an account and get access to exclusive deals and order tracking.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-secondary btn-lg" id="cta-register-btn">
                Create Account <FiArrowRight />
              </Link>
              <Link
                to="/products"
                className="btn btn-ghost btn-lg"
                id="cta-browse-btn"
                onClick={(e) => handleShopClick(e, '/products')}
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div
          className="auth-prompt-overlay"
          id="auth-prompt-overlay"
          onClick={() => setShowAuthPrompt(false)}
        >
          <div
            className="auth-prompt-modal"
            id="auth-prompt-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="auth-prompt-close"
              onClick={() => setShowAuthPrompt(false)}
              aria-label="Close"
              id="auth-prompt-close-btn"
            >
              <FiX />
            </button>

            <div className="auth-prompt-icon-wrap">
              <FiLock />
            </div>

            <h2 className="auth-prompt-title">Sign In Required</h2>
            <p className="auth-prompt-subtitle">
              Please sign in or create an account to browse our store and start shopping.
            </p>

            <div className="auth-prompt-actions">
              <button
                className="btn btn-primary btn-lg"
                id="auth-prompt-signin-btn"
                onClick={() => {
                  setShowAuthPrompt(false);
                  navigate(`/login?redirect=${encodeURIComponent(authRedirectPath)}`);
                }}
              >
                Sign In
              </button>

              <div className="auth-prompt-divider">or</div>

              <button
                className="btn btn-outline btn-lg"
                id="auth-prompt-signup-btn"
                onClick={() => {
                  setShowAuthPrompt(false);
                  navigate(`/register?redirect=${encodeURIComponent(authRedirectPath)}`);
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

