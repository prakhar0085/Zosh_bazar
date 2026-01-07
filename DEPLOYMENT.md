# Deployment Guide: Zosh Bazaar (Multi-vendor E-commerce)

This guide provides step-by-step instructions to deploy both the **Backend** and **Frontend** of your project on Vercel.

## Prerequisites
1.  A [Vercel Account](https://vercel.com).
2.  Your project pushed to a **GitHub** repository.
3.  A **MongoDB Atlas** database connection string (`MONGO_URI`).

---

## Step 1: Prepare Your Code (Updated ✅)
I have added a bridge file and updated the configuration:
-   **Backend**: Added `backend/index.js` (bridge) and `backend/vercel.json`.
-   **Frontend**: Added `frontend/vercel.json` for React Router.

---

## Troubleshooting "404: NOT_FOUND"
If you still see a 404 after deploying:
1.  **Check the "Logs" Tab**: In the Vercel Dashboard, go to your project -> **Deployments** -> Click the latest one -> **Logs**. Look for any red errors (like "Module not found" or "Database connection failed").
2.  **Environment Variables**: Double-check that `MONGO_URI` is correctly pasted in the Vercel Settings -> Environment Variables. If the DB fails to connect, the server might crash.
3.  **Redeploy**: After I've made these new fixes, you **must** push the changes to GitHub for Vercel to pick them up.

---

## Step 2: Deploy the Backend
1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New"** -> **"Project"**.
2.  Import your GitHub repository.
3.  **Project Name**: `zosh-bazaar-backend` (or similar).
4.  **Root Directory**: Set this to `backend`.
5.  **Framework Preset**: Select **"Other"**.
6.  **Environment Variables**: Add all variables from your `backend/.env` file:
    -   `MONGO_URI`
    -   `JWT_SECRET`
    -   `STRIPE_SECRET_KEY`
    -   `RAZORPAY_KEY_ID`
    -   `RAZORPAY_KEY_SECRET`
    -   `NODE_ENV` = `production`
7.  Click **"Deploy"**.
8.  **Once deployed**, copy the "Production URL" (e.g., `https://zosh-bazaar-backend.vercel.app`).

---

## Step 3: Deploy the Frontend
1.  Click **"Add New"** -> **"Project"** again.
2.  Import the **same** GitHub repository.
3.  **Project Name**: `zosh-bazaar-frontend`.
4.  **Root Directory**: Set this to `frontend`.
5.  **Framework Preset**: Select **"Create React App"**.
6.  **Environment Variables**:
    -   Go to `frontend/src/Config/Api.ts`.
    -   You can either change the `API_URL` directly in the code to your Backend URL from Step 2, or use an environment variable (recommended).
    -   *If using env variable:* Add `REACT_APP_API_URL` = `https://zosh-bazaar-backend.vercel.app`.
7.  Click **"Deploy"**.

---

## Step 4: Final Verification
-   Visit your Frontend URL.
-   Check if products are loading (this confirms Frontend -> Backend communication).
-   If products don't load, check the Console for CORS errors. (CORS is already enabled in `backend/src/index.js`).

## Notes
-   **Static Files**: The backend currently serves images from `/uploads`. Vercel's filesystem is read-only in production. For a real production app, you should use **Cloudinary** or **AWS S3** for image uploads.
-   **Cold Starts**: The first request to the backend might take a few seconds as Vercel wakes up the serverless function.
