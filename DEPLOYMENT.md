# ☁️ Free-Tier Cloud Deployment Guide — Dexterity Learn

This guide explains how to deploy **Dexterity Learn** smoothly on free tiers using **MongoDB Atlas** (Database), **Render** (Backend REST API), and **Vercel** (Frontend Client).

---

## 1. 🍃 MongoDB Atlas (Free M0 Cluster)

1. Sign up / Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Free Shared Cluster (M0)**.
3. Under **Database Access**, create a database user (e.g. `dexterityuser` and secure password).
4. Under **Network Access**, click **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> Choose **Drivers (Node.js)** -> Copy connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/dexterity_learn?retryWrites=true&w=majority
   ```

---

## 2. 🚀 Render (Backend Deployment)

1. Push your repository to **GitHub**.
2. Log in to [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following fields:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Add **Environment Variables**:
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<A strong random secret string>`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://your-app.vercel.app`
6. Click **Deploy Web Service**. Render will give you a backend URL like `https://dexterity-learn-api.onrender.com`.

---

## 3. ⚡ Vercel (Frontend Deployment)

1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project** -> Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:
   - `VITE_API_URL`: `https://dexterity-learn-api.onrender.com/api` *(your Render backend URL)*
5. Click **Deploy**. Vercel will build and assign a free domain `https://your-app.vercel.app`.

---

## 🔑 Initializing Production Database

After deployment, to seed your MongoDB Atlas database with initial courses, lessons, textbooks, and admin accounts:
```bash
cd backend
# Temporarily set MONGODB_URI in backend/.env to your Atlas URL
npm run seed
```
Your production app is now live with zero costs!
