# Project Management Tool (ProjectFlow)

A premium, full-stack project management application allowing users to manage projects, assign tasks, set deadlines, and track progress using Kanban boards and dashboard charts.

## Technologies Used

- **Frontend**: React (Vite), Axios, React Icons, Custom Dark Theme CSS
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Auth, Express-Validator
- **Hosting**: Netlify (Frontend) + Render.com (Backend)

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (for database connection string)

### Database Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Go to **Network Access** and whitelist your current IP address (or `0.0.0.0/0` for production).
3. Under **Database Access**, create a user with read/write privileges.
4. Click **Connect** and select **Drivers** to get your connection URI.

---

### Backend Setup

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Create a `.env` file based on `.env.example`:
   ```bash
   copy .env.example .env
   ```
3. Set your environment variables in `.env`:
   - `MONGO_URI`: Your MongoDB connection URI
   - `JWT_SECRET`: A strong secret key string
   - `PORT`: Server port (default: `5000`)
   - `CLIENT_URL`: `http://localhost:5173`
4. Start the server:
   - For production: `npm start`
   - For development: `npm run dev`

---

### Frontend Setup

1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build the production package:
   ```bash
   npm run build
   ```

---

## GitLab Integration & Deployment Guide

### Check in Code to GitLab

1. Create a new repository on [GitLab](https://gitlab.com).
2. Initialize Git in the project root folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of full-stack project management tool"
   ```
3. Link your GitLab repository and push:
   ```bash
   git remote add origin https://gitlab.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### Deploy to Render (Backend)

1. Sign up/log in at [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitLab repository.
4. Set the following config:
   - **Name**: `pm-tool-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. In the **Environment** tab, add your environment variables:
   - `MONGO_URI`: Your MongoDB connection URI
   - `JWT_SECRET`: Your secret key
   - `CLIENT_URL`: The URL of your deployed frontend (e.g., `https://your-app.netlify.app`)

### Deploy to Netlify (Frontend)

1. Sign up/log in at [Netlify.com](https://netlify.com).
2. Click **Add new site** and select **Import from an existing project** (Connect GitLab).
3. Set the following config:
   - **Root directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
4. Go to **Site settings** → **Environment variables** and add:
   - `VITE_API_URL`: The URL of your Render backend API (e.g., `https://pm-tool-backend.onrender.com/api`)
