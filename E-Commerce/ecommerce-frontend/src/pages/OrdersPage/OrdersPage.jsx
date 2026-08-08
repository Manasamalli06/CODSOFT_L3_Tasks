import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiPackage, FiMapPin, FiClock } from 'react-icons/fi';
import './OrdersPage.css';

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await ordersAPI.getMyOrders();
        setOrders(data.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading order history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container page-wrapper" id="orders-page">
        <div className="empty-state animate-scale-in">
          <span className="empty-state-icon">📦</span>
          <h3>No Orders Placed Yet</h3>
          <p>Once you make a purchase, you'll be able to track your orders here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-wrapper" id="orders-page">
      <div className="section-header">
        <span className="section-tag">Order History</span>
        <h1 className="section-title">My Orders</h1>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card card animate-fade-in-up" id={`order-card-${order._id}`}>
            {/* Header info */}
            <div className="order-card-header flex-between flex-wrap">
              <div className="order-meta-info">
                <span className="order-id">ID: {order._id}</span>
                <span className="order-date">
                  <FiCalendar /> {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="order-badge-and-total flex">
                <span className="order-total-amount">${order.totalPrice.toFixed(2)}</span>
                <span className={`badge ${order.isPaid ? 'badge-success' : 'badge-warning'}`}>
                  {order.isPaid ? 'Paid' : 'Pending Payment'}
                </span>
              </div>
            </div>

            {/* Product items inside order */}
            <div className="order-card-body">
              <div className="order-products-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-product-item">
                    <img src={item.image} alt={item.name} className="order-item-img" />
                    <div className="order-item-desc">
                      <span className="name">{item.name}</span>
                      <span className="qty-price">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Details */}
              <div className="order-delivery-details">
                <div className="delivery-info-row">
                  <FiMapPin className="delivery-icon" />
                  <div>
                    <h5>Shipping To</h5>
                    <p>
                      {order.shippingAddress.fullName}
                      <br />
                      {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state} {order.shippingAddress.zipCode},{' '}
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </div>

                <div className="delivery-info-row">
                  <FiClock className="delivery-icon" />
                  <div>
                    <h5>Status</h5>
                    <p className="delivery-status-text">
                      <FiPackage /> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
