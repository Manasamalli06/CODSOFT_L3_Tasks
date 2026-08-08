import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingCost,
    tax,
    total,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container page-wrapper" id="cart-page">
        <div className="empty-state animate-scale-in">
          <span className="empty-state-icon">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Add some products to your cart before checking out</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-wrapper" id="cart-page">
      <div className="section-header">
        <span className="section-tag">Checkout Preparation</span>
        <h1 className="section-title">Shopping Cart</h1>
      </div>

      <div className="cart-layout">
        {/* Cart items list */}
        <div className="cart-items-section">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item-card card" id={`cart-item-${item._id}`}>
              <img src={item.image} alt={item.name} className="cart-item-img" />

              <div className="cart-item-details">
                <Link to={`/products/${item._id}`} className="cart-item-name">
                  {item.name}
                </Link>
                <span className="cart-item-price">${item.price.toFixed(2)}</span>
              </div>

              {/* Quantity adjustments */}
              <div className="cart-item-qty-area">
                <div className="qty-selector">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <FiMinus />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              {/* Item total and delete action */}
              <div className="cart-item-total-area">
                <span className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</span>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="btn-ghost remove-item-btn"
                  aria-label="Remove item"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}

          <div className="cart-actions">
            <Link to="/products" className="btn btn-ghost" id="continue-shopping-btn">
              <FiArrowLeft /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary sidebar */}
        <aside className="order-summary-sidebar card">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            {shippingCost === 0 ? (
              <span className="shipping-free">Free</span>
            ) : (
              <span>${shippingCost.toFixed(2)}</span>
            )}
          </div>

          <div className="summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          {shippingCost > 0 && (
            <div className="shipping-promo-hint">
              Add <span>${(100 - subtotal).toFixed(2)}</span> more to get FREE shipping!
            </div>
          )}

          <div className="summary-divider"></div>

          <div className="summary-row summary-total-row">
            <span>Total</span>
            <span className="summary-total-price">${total.toFixed(2)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-lg checkout-proceed-btn"
            id="checkout-proceed-btn"
          >
            Proceed to Checkout <FiArrowRight />
          </button>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
