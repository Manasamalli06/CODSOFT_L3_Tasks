# Deployment Guide

This guide provides step-by-step instructions to push your codebase to **GitLab** and deploy both the **Backend** (Node.js/Express) and **Frontend** (React/Vite) using free hosting providers (**Render** and **Netlify**).

---

## Part 1: Push Your Code to GitLab

### Step 1: Create a GitLab Repository
1. Go to [GitLab](https://gitlab.com) and log in to your account.
2. Click the **New project/repository** button.
3. Select **Create blank project**.
4. Set the **Project name** (e.g., `Project Management tool`).
5. Choose **Public** or **Private** visibility.
6. Make sure to **uncheck** "Initialize repository with a README" (since you already have code).
7. Click **Create project**.

### Step 2: Push Local Code to GitLab
Open your terminal in the root directory (`c:\Users\MANASA\OneDrive\Desktop\Project Management tool`) and run:

```powershell
# 1. Initialize Git (in case it is not already initialized)
git init

# 2. Add your GitLab repository as the remote origin
# (Replace with your actual GitLab project URL)
git remote add origin https://gitlab.com/YOUR_USERNAME/YOUR_PROJECT_NAME.git

# 3. Add files and make a commit
git add .
git commit -m "Initial commit for deployment"

# 4. Rename the default branch to main and push
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy the Backend (Server) to Render

Since Heroku is no longer free, **Render** is the most popular free hosting provider for Node.js apps.

### Step 1: Set Up Render Web Service
1. Sign up/log in to [Render](https://render.com).
2. Click **New** (top-right) and select **Web Service**.
3. Connect your GitLab account and select the repository you pushed in Part 1.
4. Fill in the configuration:
   * **Name:** `pm-tool-backend` (or similar)
   * **Root Directory:** `server`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
   * **Instance Type:** `Free`

### Step 2: Set Environment Variables on Render
Click on the **Environment** tab on your Render project settings and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `MONGO_URI` | `mongodb+srv://manasamalli61_db_user:AQYSGa7qSFt3EPku@cluster0.6g5mhb8.mongodb.net/?appName=Cluster0` | Your cloud MongoDB connection |
| `JWT_SECRET` | `generate-some-random-secure-string-here` | Secret key for generating auth tokens |
| `CLIENT_URL` | `https://your-frontend-domain.netlify.app` | **Note:** Set this to your Netlify URL *after* deploying the frontend. |

5. Click **Deploy Web Service**.
6. Once deployed, Render will provide you with a live URL (e.g., `https://pm-tool-backend.onrender.com`). Copy this URL.

---

## Part 3: Deploy the Frontend (Client) to Netlify

Netlify is excellent for fast, free hosting of React (Vite) apps.

### Step 1: Configure and Build
Your code already has a [netlify.toml](file:///c:/Users/MANASA/OneDrive/Desktop/Project%20Management%20tool/client/netlify.toml) configured to route traffic correctly.

### Step 2: Set Up Netlify Site
1. Log in to [Netlify](https://www.netlify.com).
2. Click **Add new site** > **Import from an existing project**.
3. Select **GitLab** and choose your repository.
4. Configure the build settings:
   * **Base directory:** `client`
   * **Build command:** `npm run build`
   * **Publish directory:** `client/dist` (Vite outputs build files to `dist`)

### Step 3: Add Frontend Environment Variables
Before deploying, click **Add environment variables** (or go to Site configuration > Environment variables later) and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://your-render-url-here.onrender.com/api` | **Must end with `/api`** (e.g. `https://pm-tool-backend.onrender.com/api`) |

5. Click **Deploy site**.
6. Once deployed, Netlify will generate a site URL (e.g., `https://pm-tool.netlify.app`). Copy this URL.

---

## Part 4: Finish Connection (CORS Setup)

To allow the frontend to safely communicate with the backend, go back to your **Render** dashboard:
1. Open your `pm-tool-backend` Web Service.
2. Go to **Environment** settings.
3. Update the `CLIENT_URL` variable to match your Netlify site URL (e.g., `https://pm-tool.netlify.app`).
4. Save changes. Render will automatically redeploy the backend with the new configuration.

Your full-stack application is now fully deployed and live!
