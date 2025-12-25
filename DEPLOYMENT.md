# ShadowTalk Deployment Guide

This guide explains how to deploy the ShadowTalk.

## 1. Backend Deployment (Render / Railway)

### Option A: Render (Recommended for Free Tier)
1. **Push Code to GitHub**: Ensure your project is in a GitHub repository.
2. **Create Web Service**:
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repo.
3. **Configuration**:
   - **Root Directory**: `backend`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/social-platform-0.0.1-SNAPSHOT.jar`
   - **Environment Variables**:
     - `spring.datasource.url`: Your Production MySQL URL (e.g., from Aiven or Railway MySQL).
     - `spring.datasource.username`: DB Username.
     - `spring.datasource.password`: DB Password.
     - `jwt.secret`: A long random string.
     - `server.port`: `8080` (Render usually expects 10000 or detects env PORT, Spring Boot adapts if using `server.port=${PORT:8080}`).

> **Note**: For MySQL, you can create a free database on [Aiven](https://aiven.io) or [ElephantSQL] (Postgres, if adapted) or use Render's managed PostgreSQL (requires changing driver in `pom.xml`). Sticking to MySQL is easiest with Aiven or Railway.

### Option B: Railway
1. **New Project**: Select "Deploy from GitHub".
2. **Variables**: Add the same variables as above. Railway provides a MySQL plugin easily.
   - Add MySQL plugin -> It gives `MYSQL_URL`.
   - Update `application.properties` to read from env: `spring.datasource.url=${MYSQL_URL}`.

---

## 2. Frontend Deployment (Vercel)

1. **Push Code to GitHub** (same repo).
2. **Create Project on Vercel**:
   - Go to [vercel.com](https://vercel.com).
   - Import the repository.
3. **Configuration**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Environment Variables**:
     - `VITE_API_URL`: The URL of your deployed Backend (e.g., `https://my-backend.onrender.com`).
4. **Update Frontend Code**:
   - In `frontend/src/api/axios.js`, replace `baseURL: 'http://localhost:8080'` with:
     ```javascript
     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
     ```
   - In `frontend/src/components/ChatBox.jsx`, update the WebSocket URL similarly.

5. **Deploy**: Click Deploy. Vercel will build and host your site.

## 3. Post-Deployment Checks
- Ensure the backend `CorsConfiguration` allows the Vercel domain (Update `SecurityConfig.java` to allow `https://your-vercel-app.vercel.app` instead of just localhost).
- Verify WebSocket connection (WSS vs WS). Production usually requires `wss://`.

**Done! Your anonymous network is live.** 👻
