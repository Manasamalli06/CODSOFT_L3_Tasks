# NexStore — Full-Stack E-Commerce Platform

A premium, fully-featured e-commerce web application built with the **MERN stack** (MongoDB, Express.js, React, Node.js).

## 🚀 Features

### Customer-Facing
- 🛍️ **Product Catalog** — Browse products with search, filters, sorting & pagination
- 🔍 **Product Details** — Full product page with image, description, ratings, and stock info
- 🛒 **Shopping Cart** — Add/remove items, quantity controls, real-time totals
- 💳 **Checkout** — Multiple payment options: Credit Card, UPI/QR Scanner, PayPal, Cash on Delivery
- 📦 **Order History** — View all past orders with status tracking
- 👤 **User Profile** — Edit name, email, password, and default shipping address
- 🔐 **Authentication** — Secure register/login with JWT

### Admin Dashboard
- 📊 **Overview Stats** — Total revenue, orders, products, and users at a glance
- 📋 **Order Management** — View all orders, update status (Pending → Processing → Shipped → Delivered)
- 🛒 **Product Management** — Add, edit, and delete products via a modal form
- 👥 **User Management** — View all registered users and their roles

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, React Hot Toast |
| Styling | Vanilla CSS with CSS Variables (Dark Theme) |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JSON Web Tokens (JWT) + bcrypt |
| Payment | Stripe (Demo Mode) |

## 📁 Project Structure

```
CODSOFT/
├── ecommerce-backend/      # Node.js/Express API
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, error handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── seeds/              # Database seed scripts
│   └── server.js           # Entry point
│
└── ecommerce-frontend/     # React/Vite app
    └── src/
        ├── components/     # Navbar, Footer, etc.
        ├── context/        # Auth & Cart context
        ├── pages/          # All page components
        └── services/       # API service layer
```

## ⚡ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Setup Backend
```bash
cd ecommerce-backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Setup Frontend
```bash
cd ecommerce-frontend
npm install
npm run dev
```

### 4. Seed the database (optional)
```bash
cd ecommerce-backend
node seeds/seedProducts.js
```

The app will be running at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

## 🔑 Promote a user to Admin
```bash
cd ecommerce-backend
node -e "const mongoose=require('mongoose');const User=require('./models/User');require('dotenv').config();mongoose.connect(process.env.MONGODB_URI).then(async()=>{await User.findOneAndUpdate({email:'your@email.com'},{role:'admin'});console.log('Done');process.exit();})"
```

## 📜 License
MIT
