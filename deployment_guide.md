# Production Deployment Guide: Render & Vercel

Everything in the code is fully prepared for production deployment! I have just added a `vercel.json` file to the frontend folder to ensure routing works perfectly on Vercel.

Here is your step-by-step guide to deploying the platform:

## Phase 1: Deploy Backend to Render

1. Go to [Render](https://dashboard.render.com/) and log in.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`SD-Sagar/Sudhara-Finance`).
4. **Configuration Settings**:
   - **Name**: `sudhara-backend`
   - **Root Directory**: `backend` (This is critical!)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**: Open your local `backend/.env` file and copy ALL the variables into Render's Environment tab. 
   - *Crucial Update*: Change `FRONTEND_URL` to what your Vercel URL will be (e.g., `https://sudhara-finance.vercel.app`), or leave it temporarily and update it after Phase 2.
   - *MongoDB Note*: If you are using local MongoDB (`mongodb://localhost:27017`), you must switch to a **MongoDB Atlas** (cloud) URI so Render can connect to it.
6. Click **Create Web Service**. Wait 2-3 minutes for it to build and give you a live `.onrender.com` URL.

## Phase 2: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/) and log in.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository (`SD-Sagar/Sudhara-Finance`).
4. **Configuration Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (Click Edit and select the `frontend` folder).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   - Add a new variable named `VITE_API_URL`
   - Set its value to your new Render backend URL (e.g., `https://sudhara-backend.onrender.com`)
6. Click **Deploy**.

## Phase 3: Final Wiring

1. Copy your new live Vercel URL (e.g., `https://sudhara.vercel.app`).
2. Go back to your Render Dashboard -> Environment Variables.
3. Update `FRONTEND_URL` to match your Vercel URL exactly (no trailing slash).
4. Save the changes on Render (this will auto-restart the backend).

> [!IMPORTANT]
> **Free Tier Cold Starts**
> Because Render's free tier spins down after 15 minutes of inactivity, the backend might take 30-50 seconds to wake up the first time a user visits the site. We already built a beautiful full-screen loading overlay (`ServerWakeupLoader`) in the frontend that seamlessly handles this delay and tells the user what's happening!

> [!WARNING]
> **Email Notifications**
> For your Gmail SMTP notifications to work in production, you *must* use a 16-character Google App Password for `SMTP_PASS` in your Render Environment Variables, not your standard Gmail login password.
