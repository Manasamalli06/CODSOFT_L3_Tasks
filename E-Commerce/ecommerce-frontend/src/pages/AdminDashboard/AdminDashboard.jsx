import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, productsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiPackage,
  FiUsers,
  FiDollarSign,
  FiShoppingBag,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiAlertCircle,
} from 'react-icons/fi';
import './AdminDashboard.css';

// ─── Tabs ───
const TABS = [
  { id: 'overview', label: 'Overview', icon: <FiTrendingUp /> },
  { id: 'orders', label: 'Orders', icon: <FiPackage /> },
  { id: 'products', label: 'Products', icon: <FiShoppingBag /> },
  { id: 'users', label: 'Users', icon: <FiUsers /> },
];

// ─── Status Badge ───
const StatusBadge = ({ status }) => {
  const colors = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };
  return (
    <span
      className="status-badge"
      style={{
        background: `${colors[status]}20`,
        color: colors[status],
        border: `1px solid ${colors[status]}40`,
      }}
    >
      {status}
    </span>
  );
};

// ─── Product Modal ───
const ProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    originalPrice: product?.originalPrice || '',
    category: product?.category || '',
    image: product?.image || '',
    stock: product?.stock || '',
    featured: product?.featured || false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
      };
      await onSave(payload);
    } catch {
      // error handled in parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-input form-textarea" name="description" value={form.description} onChange={handleChange} rows={3} required />
          </div>

          <div className="modal-row">
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input className="form-input" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Original Price ($)</label>
              <input className="form-input" name="originalPrice" type="number" step="0.01" value={form.originalPrice} onChange={handleChange} />
            </div>
          </div>

          <div className="modal-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input" name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Kitchen">Home &amp; Kitchen</option>
                <option value="Books">Books</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input className="form-input" name="stock" type="number" value={form.stock} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL *</label>
            <input className="form-input" name="image" value={form.image} onChange={handleChange} required />
          </div>

          <label className="checkbox-label">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            <span>Featured Product</span>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Admin Dashboard ───
const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const { data } = await adminAPI.getStats();
        setStats(data.data);
      } else if (activeTab === 'orders') {
        const { data } = await adminAPI.getAllOrders();
        setOrders(data.data);
      } else if (activeTab === 'products') {
        const { data } = await productsAPI.getAll({ limit: 100 });
        setProducts(data.data);
      } else if (activeTab === 'users') {
        const { data } = await adminAPI.getAllUsers();
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Admin fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleSaveProduct = async (payload) => {
    try {
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, payload);
        toast.success('Product updated successfully! ✅');
      } else {
        await adminAPI.createProduct(payload);
        toast.success('Product created successfully! 🎉');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
      throw error;
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await adminAPI.deleteProduct(id);
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container page-wrapper">
        <div className="empty-state">
          <FiAlertCircle style={{ fontSize: '3rem', color: '#ef4444' }} />
          <h3>Access Denied</h3>
          <p>You do not have admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  // ─── Overview Tab ───
  const renderOverview = () => {
    if (!stats) return null;
    const statCards = [
      { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: <FiDollarSign />, color: '#10b981' },
      { label: 'Total Orders', value: stats.totalOrders, icon: <FiPackage />, color: '#3b82f6' },
      { label: 'Total Products', value: stats.totalProducts, icon: <FiShoppingBag />, color: '#8b5cf6' },
      { label: 'Total Users', value: stats.totalUsers, icon: <FiUsers />, color: '#f59e0b' },
    ];

    return (
      <>
        <div className="stats-grid">
          {statCards.map((s) => (
            <div key={s.label} className="stat-card card">
              <div className="stat-icon" style={{ background: `${s.color}20`, color: s.color }}>
                {s.icon}
              </div>
              <div className="stat-info">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Status Summary */}
        <div className="admin-section card">
          <h3 className="admin-section-title">Orders by Status</h3>
          <div className="status-summary-grid">
            {stats.ordersByStatus.map((s) => (
              <div key={s._id} className="status-summary-item">
                <StatusBadge status={s._id} />
                <span className="status-count">{s.count}</span>
              </div>
            ))}
            {stats.ordersByStatus.length === 0 && (
              <p className="text-muted">No orders yet</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="admin-section card">
          <h3 className="admin-section-title">Recent Orders</h3>
          {stats.recentOrders.length === 0 ? (
            <p className="text-muted">No orders yet</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="mono-text">{order._id.slice(-8)}</td>
                      <td>{order.user?.name || 'Deleted User'}</td>
                      <td className="price-text">${order.totalPrice.toFixed(2)}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  // ─── Orders Tab ───
  const renderOrders = () => (
    <div className="admin-section card">
      <h3 className="admin-section-title">All Orders</h3>
      {orders.length === 0 ? (
        <p className="text-muted">No orders found</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="mono-text">{order._id.slice(-8)}</td>
                  <td>{order.user?.name || 'Deleted User'}</td>
                  <td>{order.items.length} item(s)</td>
                  <td className="price-text">${order.totalPrice.toFixed(2)}</td>
                  <td>{order.paymentMethod}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ─── Products Tab ───
  const renderProducts = () => (
    <div className="admin-section card">
      <div className="section-header-row">
        <h3 className="admin-section-title">All Products</h3>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
        >
          <FiPlus /> Add Product
        </button>
      </div>
      {products.length === 0 ? (
        <p className="text-muted">No products found</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <img src={p.image} alt={p.name} className="product-thumb" />
                  </td>
                  <td className="product-name-cell">{p.name}</td>
                  <td><span className="category-tag">{p.category}</span></td>
                  <td className="price-text">${p.price.toFixed(2)}</td>
                  <td>
                    <span className={`stock-indicator ${p.stock < 5 ? 'low' : ''}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>{p.featured ? '⭐' : '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => { setEditingProduct(p); setShowProductModal(true); }}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteProduct(p._id, p.name)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ─── Users Tab ───
  const renderUsers = () => (
    <div className="admin-section card">
      <h3 className="admin-section-title">All Users</h3>
      {users.length === 0 ? (
        <p className="text-muted">No users found</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td className="mono-text">{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>{u.role.toUpperCase()}</span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-page">
          <div className="spinner"></div>
          <p>Loading admin data...</p>
        </div>
      );
    }
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'orders': return renderOrders();
      case 'products': return renderProducts();
      case 'users': return renderUsers();
      default: return null;
    }
  };

  return (
    <div className="container page-wrapper" id="admin-dashboard">
      <div className="section-header">
        <span className="section-tag">Admin Panel</span>
        <h1 className="section-title">Dashboard</h1>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="admin-content animate-fade-in">
        {renderContent()}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
