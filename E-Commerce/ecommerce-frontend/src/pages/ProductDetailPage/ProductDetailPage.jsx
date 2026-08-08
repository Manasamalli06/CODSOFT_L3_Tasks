import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft, FiMinus, FiPlus, FiCheck } from 'react-icons/fi';
import { productsAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import StarRating from '../../components/StarRating/StarRating';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await productsAPI.getById(id);
        setProduct(data.data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQtyChange = (val) => {
    if (val < 1 || val > product.stock) return;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container page-wrapper">
        <div className="empty-state">
          <span className="empty-state-icon">⚠️</span>
          <h3>Product Not Found</h3>
          <p>The product you are looking for does not exist or has been removed.</p>
          <Link to="/products" className="btn btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="container page-wrapper" id="product-detail-page">
      <button onClick={() => navigate(-1)} className="btn btn-ghost back-btn" id="back-to-shop-btn">
        <FiArrowLeft /> Back
      </button>

      <div className="detail-layout">
        {/* Product Image Area */}
        <div className="detail-image-card">
          <img src={product.image} alt={product.name} className="detail-image" />
          {discount > 0 && (
            <span className="detail-badge badge badge-warning">-{discount}% Off</span>
          )}
        </div>

        {/* Product Details Area */}
        <div className="detail-info">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-name">{product.name}</h1>

          <StarRating rating={product.rating} numReviews={product.numReviews} size="lg" />

          {/* Pricing */}
          <div className="detail-pricing">
            <span className="detail-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="detail-original">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <div className="detail-divider"></div>

          {/* Description */}
          <div className="detail-description-section">
            <h4 className="detail-section-title">Description</h4>
            <p className="detail-description">{product.description}</p>
          </div>

          {/* Stock Status */}
          <div className="detail-stock-status">
            <span className="detail-section-title">Status:</span>
            {product.stock > 0 ? (
              <span className="status-in-stock">In Stock ({product.stock} items left)</span>
            ) : (
              <span className="status-out-stock">Out of Stock</span>
            )}
          </div>

          {/* Quantity and Actions */}
          {product.stock > 0 && (
            <div className="detail-actions-section">
              <div className="qty-selector">
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <FiMinus />
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  <FiPlus />
                </button>
              </div>

              <button
                className={`btn btn-lg ${added ? 'btn-success' : 'btn-primary'} add-to-cart-btn`}
                onClick={handleAddToCart}
                id="add-to-cart-btn-detail"
              >
                {added ? (
                  <>
                    <FiCheck /> Added to Cart
                  </>
                ) : (
                  <>
                    <FiShoppingCart /> Add to Cart
                  </>
                )}
              </button>
            </div>
          )}

          {/* Additional info badges */}
          <div className="detail-meta-features">
            <div className="meta-feature">
              <span className="meta-icon">🚚</span>
              <div>
                <h5>Free Shipping</h5>
                <p>On orders over $100</p>
              </div>
            </div>
            <div className="meta-feature">
              <span className="meta-icon">🛡️</span>
              <div>
                <h5>Warranty Protection</h5>
                <p>1-year official guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
