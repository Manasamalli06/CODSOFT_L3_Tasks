const jwt = require('jsonwebtoken');

// Pre-seeded mock database
if (!global.mockUsers) {
  global.mockUsers = [
    {
      _id: 'mock_user_default_123',
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123', // stored in plain text for simple mock comparison
      role: 'user',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock_admin_default_001',
      name: 'Admin User',
      email: 'admin@nexstore.com',
      password: 'admin123', // stored in plain text for simple mock comparison
      role: 'admin',
      address: {},
      createdAt: new Date().toISOString()
    }
  ];
}

if (!global.mockProducts) {
  global.mockProducts = [
    {
      _id: 'prod_elec_1',
      name: 'ProBass X1 Wireless Headphones',
      description: 'Premium noise-cancelling over-ear headphones with 40-hour battery life, Hi-Res Audio, and ultra-comfortable memory foam ear cushions. Features adaptive ANC and multipoint Bluetooth 5.3 connectivity.',
      price: 149.99,
      originalPrice: 199.99,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      stock: 45,
      rating: 4.7,
      numReviews: 234,
      featured: true,
      tags: ['headphones', 'wireless', 'noise-cancelling'],
      createdAt: new Date(Date.now() - 500000).toISOString()
    },
    {
      _id: 'prod_elec_2',
      name: 'NovaTech Smartwatch Pro',
      description: 'Advanced fitness smartwatch with AMOLED display, SpO2 monitoring, GPS, 100+ workout modes, sleep tracking, and 14-day battery life. Water-resistant to 50 meters.',
      price: 229.99,
      originalPrice: 299.99,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500',
      stock: 30,
      rating: 4.5,
      numReviews: 189,
      featured: true,
      tags: ['smartwatch', 'fitness', 'wearable'],
      createdAt: new Date(Date.now() - 400000).toISOString()
    },
    {
      _id: 'prod_fash_1',
      name: 'AeroStride Running Shoes',
      description: 'Lightweight performance running shoes with responsive cushioning, breathable mesh upper, and carbon fiber plate for maximum energy return. Designed for distance runners.',
      price: 159.99,
      originalPrice: 189.99,
      category: 'Fashion',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      stock: 40,
      rating: 4.6,
      numReviews: 203,
      featured: true,
      tags: ['shoes', 'running', 'athletic'],
      createdAt: new Date(Date.now() - 300000).toISOString()
    },
    {
      _id: 'prod_fash_2',
      name: 'Alpine Weatherproof Jacket',
      description: 'Premium all-weather jacket with GORE-TEX membrane, taped seams, adjustable hood, and multiple pockets. Breathable, waterproof, and windproof for all conditions.',
      price: 249.99,
      originalPrice: 329.99,
      category: 'Fashion',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
      stock: 25,
      rating: 4.7,
      numReviews: 145,
      featured: true,
      tags: ['jacket', 'outdoor', 'waterproof'],
      createdAt: new Date(Date.now() - 200000).toISOString()
    },
    {
      _id: 'prod_home_1',
      name: 'BrewMaster Pro Coffee Maker',
      description: 'Professional-grade drip coffee maker with built-in grinder, thermal carafe, programmable timer, and precision temperature control. Brews 12 cups of barista-quality coffee.',
      price: 199.99,
      originalPrice: 249.99,
      category: 'Home & Kitchen',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
      stock: 22,
      rating: 4.7,
      numReviews: 276,
      featured: true,
      tags: ['coffee', 'kitchen', 'appliance'],
      createdAt: new Date(Date.now() - 100000).toISOString()
    },
    {
      _id: 'prod_home_2',
      name: 'Aurora Smart LED Lamp',
      description: 'App-controlled smart lamp with 16 million color options, adjustable brightness, circadian rhythm mode, and voice assistant compatibility. Modern minimalist design.',
      price: 59.99,
      originalPrice: 79.99,
      category: 'Home & Kitchen',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500',
      stock: 50,
      rating: 4.4,
      numReviews: 213,
      featured: false,
      tags: ['lamp', 'smart-home', 'lighting'],
      createdAt: new Date(Date.now() - 50000).toISOString()
    }
  ];
}

if (!global.mockOrders) {
  global.mockOrders = [];
}

// Helper to generate token
const generateMockToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

const mockDatabaseMiddleware = (req, res, next) => {
  if (!global.isMockMode) {
    return next();
  }

  // Populate req.user for protected mock endpoints if bearer token is present
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = (global.mockUsers || []).find((u) => u._id === decoded.id) || {
        _id: decoded.id,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        address: {},
      };
    } catch (err) {
      // Ignore token decode errors; the endpoint checks will reject if req.user is missing
    }
  }

  const { method, url } = req;
  const cleanUrl = url.split('?')[0];

  console.log(`[MOCK DATABASE] Intercepted ${method} ${url}`);

  // ─── AUTHENTICATION ROUTES ───
  if (cleanUrl === '/api/auth/register' && method === 'POST') {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const exists = global.mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const newUser = {
      _id: `mock_user_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password,
      role: 'user',
      address: {},
      createdAt: new Date().toISOString()
    };
    global.mockUsers.push(newUser);

    const token = generateMockToken(newUser._id);
    return res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token
      }
    });
  }

  if (cleanUrl === '/api/auth/login' && method === 'POST') {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const user = global.mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateMockToken(user._id);
    return res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  }

  if (cleanUrl === '/api/auth/profile') {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (method === 'GET') {
      return res.json({
        success: true,
        data: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          address: req.user.address,
          createdAt: req.user.createdAt
        }
      });
    }

    if (method === 'PUT') {
      const userIdx = global.mockUsers.findIndex((u) => u._id === req.user._id);
      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const updatedUser = {
        ...global.mockUsers[userIdx],
        name: req.body.name || global.mockUsers[userIdx].name,
        email: req.body.email ? req.body.email.toLowerCase() : global.mockUsers[userIdx].email,
        address: req.body.address || global.mockUsers[userIdx].address
      };

      if (req.body.password) {
        updatedUser.password = req.body.password;
      }

      global.mockUsers[userIdx] = updatedUser;
      const token = generateMockToken(updatedUser._id);

      return res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          token
        }
      });
    }
  }

  // ─── PRODUCT ROUTES ───
  if (cleanUrl === '/api/products/categories' && method === 'GET') {
    const categories = Array.from(new Set(global.mockProducts.map((p) => p.category)));
    return res.json({ success: true, data: categories });
  }

  if (cleanUrl === '/api/products' && method === 'GET') {
    const { category, featured, search, sort, page = 1, limit = 12 } = req.query;

    let filtered = [...global.mockProducts];

    if (category) {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (featured === 'true') {
      filtered = filtered.filter((p) => p.featured);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      // newest/default
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Paginate
    const total = filtered.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginated = filtered.slice(skip, skip + Number(limit));

    return res.json({
      success: true,
      data: paginated,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  }

  if (cleanUrl.startsWith('/api/products/') && method === 'GET') {
    const productId = cleanUrl.split('/').pop();
    const product = global.mockProducts.find((p) => p._id === productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, data: product });
  }

  // ─── ORDER ROUTES ───
  if (cleanUrl === '/api/orders' && method === 'POST') {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { items, shippingAddress, paymentMethod, paymentResult } = req.body;
    if (!items || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ success: false, message: 'Invalid order payload' });
    }

    const newOrder = {
      _id: `mock_order_${Date.now()}`,
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      paymentResult: paymentResult || { status: 'pending' },
      itemsPrice: items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      isPaid: paymentMethod !== 'cod',
      paidAt: paymentMethod !== 'cod' ? new Date().toISOString() : null,
      isDelivered: false,
      createdAt: new Date().toISOString()
    };

    global.mockOrders.push(newOrder);
    return res.status(201).json({ success: true, data: newOrder });
  }

  if (cleanUrl === '/api/orders/my-orders' && method === 'GET') {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const userOrders = global.mockOrders.filter((o) => o.user === req.user._id);
    return res.json({ success: true, data: userOrders });
  }

  if (cleanUrl.startsWith('/api/orders/') && method === 'GET') {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const orderId = cleanUrl.split('/').pop();
    const order = global.mockOrders.find((o) => o._id === orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, data: order });
  }

  // ─── PAYMENT ROUTES ───
  if (cleanUrl === '/api/payment/create-intent' && method === 'POST') {
    return res.json({
      success: true,
      data: {
        clientSecret: `mock_client_secret_${Date.now()}`,
        simulated: true
      }
    });
  }

  // ─── ADMIN ROUTES ───
  const isAdmin = req.user && req.user.role === 'admin';

  if (cleanUrl === '/api/admin/stats' && method === 'GET') {
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Not authorized as admin' });
    const totalRevenue = global.mockOrders
      .filter((o) => o.isPaid)
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const ordersByStatus = Object.entries(
      global.mockOrders.reduce((acc, o) => {
        const s = o.status || 'pending';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {})
    ).map(([_id, count]) => ({ _id, count }));
    return res.json({
      success: true,
      data: {
        totalProducts: global.mockProducts.length,
        totalOrders: global.mockOrders.length,
        totalUsers: global.mockUsers.length,
        totalRevenue,
        recentOrders: [...global.mockOrders].reverse().slice(0, 5).map((o) => ({
          ...o,
          user: global.mockUsers.find((u) => u._id === o.user) || { name: 'Unknown', email: '' },
        })),
        ordersByStatus,
      },
    });
  }

  if (cleanUrl === '/api/admin/orders' && method === 'GET') {
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Not authorized as admin' });
    const ordersWithUser = global.mockOrders.map((o) => ({
      ...o,
      user: global.mockUsers.find((u) => u._id === o.user) || { name: 'Deleted User', email: '' },
    }));
    return res.json({ success: true, data: [...ordersWithUser].reverse() });
  }

  if (cleanUrl.match(/^\/api\/admin\/orders\/[^/]+\/status$/) && method === 'PUT') {
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Not authorized as admin' });
    const orderId = cleanUrl.split('/')[4];
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const orderIdx = global.mockOrders.findIndex((o) => o._id === orderId);
    if (orderIdx === -1) return res.status(404).json({ success: false, message: 'Order not found' });
    global.mockOrders[orderIdx].status = status;
    if (status === 'delivered') global.mockOrders[orderIdx].deliveredAt = new Date().toISOString();
    return res.json({ success: true, data: global.mockOrders[orderIdx] });
  }

  if (cleanUrl === '/api/admin/users' && method === 'GET') {
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Not authorized as admin' });
    const safeUsers = global.mockUsers.map(({ password, ...u }) => u);
    return res.json({ success: true, data: safeUsers });
  }

  if (cleanUrl === '/api/admin/products' && method === 'POST') {
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Not authorized as admin' });
    const { name, description, price, category, image, stock } = req.body;
    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    const newProduct = {
      _id: `prod_custom_${Date.now()}`,
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock) || 0,
      rating: 0,
      numReviews: 0,
      createdAt: new Date().toISOString(),
    };
    global.mockProducts.push(newProduct);
    return res.status(201).json({ success: true, data: newProduct });
  }

  if (cleanUrl.startsWith('/api/admin/products/') && method === 'PUT') {
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Not authorized as admin' });
    const productId = cleanUrl.split('/').pop();
    const productIdx = global.mockProducts.findIndex((p) => p._id === productId);
    if (productIdx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
    global.mockProducts[productIdx] = {
      ...global.mockProducts[productIdx],
      ...req.body,
      price: Number(req.body.price) || global.mockProducts[productIdx].price,
      stock: Number(req.body.stock) || global.mockProducts[productIdx].stock,
      _id: productId,
    };
    return res.json({ success: true, data: global.mockProducts[productIdx] });
  }

  if (cleanUrl.startsWith('/api/admin/products/') && method === 'DELETE') {
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Not authorized as admin' });
    const productId = cleanUrl.split('/').pop();
    const productIdx = global.mockProducts.findIndex((p) => p._id === productId);
    if (productIdx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
    global.mockProducts.splice(productIdx, 1);
    return res.json({ success: true, message: 'Product deleted' });
  }

  // If mock mode is true but route is not mocked, return 404
  return res.status(404).json({ success: false, message: `Mock route ${method} ${cleanUrl} not implemented` });
};

module.exports = mockDatabaseMiddleware;
