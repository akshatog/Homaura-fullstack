# Fullstack E-Commerce Presento

A full-stack e-commerce application built with the MERN stack (MongoDB/PostgreSQL via Prisma, Express, React, Node.js). 

## 🚀 Deployment Guide

This project is separated into a `frontend` and `backend` directory. We recommend deploying the backend on **Render** and the frontend on **Vercel**.

### Part 1: Deploying the Backend on Render

1. **Push to GitHub**: Make sure your entire project is pushed to a GitHub repository.
2. **Create a Web Service**: Log in to [Render](https://render.com) and click **New > Web Service**.
3. **Connect Repository**: Select your GitHub repository.
4. **Configuration**:
   - **Name**: e.g., `presento-backend`
   - **Root Directory**: `backend` (Crucial! This tells Render to only build the backend folder).
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**: Scroll down to Advanced > Environment Variables and add your `.env` variables from your local `backend/.env` file:
   - `DATABASE_URL` (Your production PostgreSQL/MongoDB connection string)
   - `JWT_SECRET` (A strong random string)
   - `FRONTEND_URL` (Set this temporarily to `*` or leave blank, we will update it after deploying Vercel)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - etc.
6. **Deploy**: Click "Create Web Service". Once deployed, copy the deployed URL (e.g., `https://presento-backend.onrender.com`).

### Part 2: Deploying the Frontend on Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. **Import Repository**: Select your GitHub repository.
3. **Configuration**:
   - **Framework Preset**: `Vite` (Vercel usually auto-detects this).
   - **Root Directory**: `frontend` (Click edit and select the frontend folder).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**: Add your frontend variables from `frontend/.env`:
   - `VITE_API_URL`: Paste the Render URL here with `/api` appended (e.g., `https://presento-backend.onrender.com/api`).
5. **Deploy**: Click "Deploy". 
6. **Copy URL**: Once deployed, copy the Vercel URL (e.g., `https://presento-frontend.vercel.app`).

### Part 3: Final Security Link

1. Go back to your **Render Web Service** dashboard.
2. Click on **Environment** settings.
3. Update `FRONTEND_URL` to your new Vercel URL (e.g., `https://presento-frontend.vercel.app`). This ensures CORS blocks requests from unauthorized websites.
4. Save the changes (Render will automatically redeploy).

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Framer Motion, Axios, React Router.
- **Backend**: Node.js, Express, Prisma ORM, JWT Authentication.
- **Storage**: Cloudinary for image hosting.

## 💻 Local Development

1. Clone the repository.
2. Open two terminals.
3. In terminal 1: `cd backend && npm install && npm run dev`
4. In terminal 2: `cd frontend && npm install && npm run dev`
