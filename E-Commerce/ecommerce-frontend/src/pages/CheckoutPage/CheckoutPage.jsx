import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiCreditCard, FiLock, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { FaPaypal, FaMoneyBillWave, FaQrcode } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI, paymentAPI } from '../../services/api';
import './CheckoutPage.css';

// ─── PayPal Redirect Simulation ───
const PayPalRedirectSim = ({ amount, onComplete, onCancel }) => {
  const [phase, setPhase] = useState('redirecting'); // redirecting → processing → done
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // Keep the ref up-to-date without restarting the effect
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Phase 1: "Redirecting to PayPal..." for 1.5s
    const t1 = setTimeout(() => setPhase('processing'), 1500);

    // Animate progress bar
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Phase 2: "Processing payment..." then complete at ~3s
    const t2 = setTimeout(() => {
      setPhase('done');
      clearInterval(timerRef.current);
      setProgress(100);
    }, 3000);

    // Trigger callback shortly after done — use ref so effect only runs once on mount
    const t3 = setTimeout(() => {
      onCompleteRef.current();
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(timerRef.current);
    };
  }, []); // empty deps — runs once on mount only

  return (
    <div className="paypal-redirect-overlay" id="paypal-redirect-overlay">
      <div className="paypal-redirect-card">
        <button
          className="paypal-redirect-cancel"
          onClick={onCancel}
          aria-label="Cancel PayPal payment"
          id="paypal-cancel-btn"
        >
          ✕
        </button>

        <div className="paypal-redirect-logo">
          <FaPaypal className="paypal-icon-large" />
          <span className="paypal-brand-text">PayPal</span>
        </div>

        <div className="paypal-redirect-amount">
          <span className="paypal-amount-label">Amount</span>
          <span className="paypal-amount-value">${amount.toFixed(2)} USD</span>
        </div>

        <div className="paypal-progress-container">
          <div className="paypal-progress-bar">
            <div
              className="paypal-progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <p className="paypal-redirect-status">
          {phase === 'redirecting' && '🔗 Connecting to PayPal securely...'}
          {phase === 'processing' && '🔒 Processing your payment...'}
          {phase === 'done' && '✅ Payment approved! Returning to store...'}
        </p>

        <p className="paypal-redirect-notice">
          This is a demo simulation. No real payment is being processed.
        </p>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, total, subtotal, shippingCost, tax, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  // Form states
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [showPayPalRedirect, setShowPayPalRedirect] = useState(false);

  // Populate fullName once user is available (fixes race condition with auth loading)
  useEffect(() => {
    if (user?.name && !fullName) {
      setFullName(user.name);
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="container page-wrapper">
        <div className="empty-state">
          <h3>Authentication Required</h3>
          <p>Please log in to complete your checkout process</p>
          <Link to="/login?redirect=checkout" className="btn btn-primary">
            Sign In to Checkout
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="container page-wrapper">
        <div className="empty-state">
          <h3>No items in checkout</h3>
          <p>Go back to the catalog and add products</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Validate shipping fields
  const validateShipping = () => {
    if (!fullName || !street || !city || !state || !zipCode || !country) {
      toast.error('Please complete all shipping address fields');
      return false;
    }
    return true;
  };

  // Core order placement logic (shared between regular and PayPal flows)
  const placeOrder = async (paymentResultOverride = null) => {
    setLoading(true);
    try {
      let paymentResult = paymentResultOverride || { status: 'pending' };

      if (!paymentResultOverride && paymentMethod !== 'cod') {
        // Create Simulated Payment Intent
        const { data: intentRes } = await paymentAPI.createIntent({ amount: total });

        paymentResult = {
          id: intentRes.data?.clientSecret || `sim_${Date.now()}`,
          status: 'succeeded',
          email: user.email,
        };
      }

      // Create the order in database
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName,
          street,
          city,
          state,
          zipCode,
          country,
        },
        paymentMethod,
        paymentResult,
      };

      const { data: orderRes } = await ordersAPI.create(orderPayload);

      // Success
      setOrderSuccess(orderRes.data);
      clearCart();
      toast.success('Order placed successfully! 🎉');
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateShipping()) return;

    if (paymentMethod === 'paypal') {
      // Show PayPal redirect simulation instead of placing order immediately
      setShowPayPalRedirect(true);
      return;
    }

    // For all other methods, place order directly
    await placeOrder();
  };

  // Called when the PayPal simulation completes
  const handlePayPalComplete = async () => {
    setShowPayPalRedirect(false);

    const paypalPaymentResult = {
      id: `PAYPAL_${Date.now()}`,
      status: 'succeeded',
      email: user.email,
      payer: { email_address: user.email },
    };

    await placeOrder(paypalPaymentResult);
  };

  const handlePayPalCancel = () => {
    setShowPayPalRedirect(false);
    toast('PayPal payment cancelled', { icon: 'ℹ️' });
  };

  if (orderSuccess) {
    return (
      <div className="container page-wrapper flex-center" id="checkout-success-view">
        <div className="checkout-success-card card text-center animate-scale-in">
          <FiCheckCircle className="success-check-icon" />
          <h2 className="success-title">Thank You For Your Order!</h2>
          <p className="success-subtitle">
            Order Reference: <span className="order-id-label">{orderSuccess._id}</span>
          </p>
          <p className="success-desc">
            We have received your payment and our warehouse is processing your order.
            You can monitor the status on your order page.
          </p>
          <div className="success-actions">
            <Link to="/orders" className="btn btn-primary" id="view-orders-btn">
              View My Orders
            </Link>
            <Link to="/products" className="btn btn-outline" id="success-shop-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-wrapper" id="checkout-page">
      <div className="section-header">
        <span className="section-tag">Final Steps</span>
        <h1 className="section-title">Checkout</h1>
      </div>

      <form className="checkout-layout" onSubmit={handleSubmit} id="checkout-form">
        {/* Shipping Form */}
        <div className="checkout-form-section card">
          <h3 className="checkout-section-title">Shipping Address</h3>

          <div className="form-fields-grid">
            <div className="form-group col-span-full">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group col-span-full">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Apartment, suite, unit, etc."
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">State / Province</label>
              <input
                type="text"
                className="form-input"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Postal / ZIP Code</label>
              <input
                type="text"
                className="form-input"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>

          <h3 className="checkout-section-title" style={{ marginTop: '32px' }}>
            Payment Method
          </h3>
          <div className="payment-method-selector" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div 
              className={`payment-option ${paymentMethod === 'stripe' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('stripe')}
            >
              <FiCreditCard />
              <span>Credit Card (Demo Mode)</span>
            </div>

            {/* Credit Card Demo UI */}
            {paymentMethod === 'stripe' && (
              <div className="demo-payment-ui card-details-demo animate-fade-in">
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input type="text" className="form-input" placeholder="0000 0000 0000 0000" maxLength="19" />
                </div>
                <div className="form-fields-grid" style={{ marginTop: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input type="text" className="form-input" placeholder="MM/YY" maxLength="5" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVC</label>
                    <input type="text" className="form-input" placeholder="123" maxLength="4" />
                  </div>
                </div>
              </div>
            )}

            <div 
              className={`payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('upi')}
            >
              <FaQrcode />
              <span>UPI / QR Scanner (Demo Mode)</span>
            </div>

            {/* UPI / QR Demo UI */}
            {paymentMethod === 'upi' && (
              <div className="demo-payment-ui qr-demo animate-fade-in text-center">
                <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>Scan this QR code with any UPI app to pay</p>
                <div className="qr-code-box">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=demo@upi&pn=NexStore&am=${total.toFixed(2)}`} alt="Demo UPI QR Code" />
                </div>
                <p style={{ marginTop: '16px', fontSize: '14px', fontWeight: 'bold' }}>Amount: ${total.toFixed(2)}</p>
              </div>
            )}

            <div 
              className={`payment-option ${paymentMethod === 'paypal' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('paypal')}
            >
              <FaPaypal />
              <span>PayPal (Demo Mode)</span>
            </div>

            {/* PayPal Demo UI */}
            {paymentMethod === 'paypal' && (
              <div className="demo-payment-ui paypal-demo animate-fade-in text-center">
                <FaPaypal style={{ fontSize: '48px', color: '#003087', marginBottom: '16px' }} />
                <p>You will be securely redirected to PayPal to complete your purchase when you place the order.</p>
              </div>
            )}

            <div 
              className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('cod')}
            >
              <FaMoneyBillWave />
              <span>Cash on Delivery</span>
            </div>
            
            {/* COD Demo UI */}
            {paymentMethod === 'cod' && (
              <div className="demo-payment-ui cod-demo animate-fade-in">
                <FiInfo style={{ color: 'var(--color-accent-primary)', fontSize: '24px' }} />
                <p>You can pay in cash to our courier when you receive the goods at your doorstep.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order review side bar */}
        <aside className="checkout-summary-sidebar card">
          <h3 className="checkout-section-title">Review Order</h3>

          <div className="checkout-items-list">
            {cartItems.map((item) => (
              <div key={item._id} className="checkout-item">
                <img src={item.image} alt={item.name} />
                <div className="checkout-item-meta">
                  <span className="name">{item.name}</span>
                  <span className="qty">Qty: {item.quantity}</span>
                </div>
                <span className="price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

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

          <div className="summary-divider"></div>

          <div className="summary-row summary-total-row">
            <span>Total</span>
            <span className="summary-total-price">${total.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            className="btn btn-secondary btn-lg pay-btn"
            disabled={loading}
            id="pay-submit-btn"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <FiLock /> {paymentMethod === 'cod' ? 'Place Order' : paymentMethod === 'paypal' ? 'Continue to PayPal' : `Pay Now ($${total.toFixed(2)})`}
              </>
            )}
          </button>

          <p className="secure-payment-notice">
            <FiLock /> Your order and payment details are processed securely
          </p>
        </aside>
      </form>

      {/* PayPal Redirect Simulation */}
      {showPayPalRedirect && (
        <PayPalRedirectSim
          amount={total}
          onComplete={handlePayPalComplete}
          onCancel={handlePayPalCancel}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
