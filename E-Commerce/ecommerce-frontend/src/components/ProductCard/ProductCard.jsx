import { Link } from 'react-router-dom';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import StarRating from '../StarRating/StarRating';
import './ProductCard.css';

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product);
    }
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className={`product-card animate-fade-in-up stagger-${Math.min((index % 6) + 1, 6)}`}
      id={`product-card-${product._id}`}
    >
      {/* Image */}
      <div className="product-card-image">
        <img src={product.image} alt={product.name} loading="lazy" />

        {/* Overlay actions */}
        <div className="product-card-overlay">
          <button className="overlay-btn" aria-label="View product">
            <FiEye />
          </button>
          <button
            className="overlay-btn overlay-btn-primary"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label="Add to cart"
          >
            <FiShoppingCart />
          </button>
        </div>

        {/* Badges */}
        <div className="product-card-badges">
          {discount > 0 && (
            <span className="badge badge-warning">-{discount}%</span>
          )}
          {product.featured && (
            <span className="badge badge-primary">Featured</span>
          )}
          {product.stock === 0 && (
            <span className="badge badge-danger">Out of Stock</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="product-card-info">
        <span className="product-card-category">{product.category}</span>
        <h3 className="product-card-name">{product.name}</h3>

        <StarRating
          rating={product.rating}
          numReviews={product.numReviews}
          size="sm"
        />

        <div className="product-card-pricing">
          <span className="product-card-price">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="product-card-original">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
