# ShadowTalk Deployment Guide

This guide will help you host **ShadowTalk** online using free tiers from **Render** (Backend & Database) and **Vercel** (Frontend).

## Prerequisites
1.  **GitHub Account**: Ensure your project is pushed to a GitHub repository.
2.  **Render Account**: [render.com](https://render.com)
3.  **Vercel Account**: [vercel.com](https://vercel.com)

---

## Part 1: Database (Free MySQL on Railway or Aiven)
*Note: Render's free PostgreSQL is easier, but we are using MySQL. We recommend **Railway** or **Aiven** for a free MySQL database, or Render if you are okay with a trial.*

**Recommended: Aiven (Free Tier)**
1.  Sign up at [aiven.io](https://aiven.io).
2.  Create a new **MySQL** service (select the Free plan).
3.  Copy the **Service URI** (looks like `mysql://avnadmin:password@host:port/defaultdb...`).
4.  **Important**: You will need this URL for the Backend configuration.

---

## Part 2: Backend Deployment (Render)

1.  Log in to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository (`ShadowTalk`).
4.  **Root Directory**: `backend` (Important! Tell Render the backend code is in this folder).
5.  **Runtime**: Docker (It will automatically find the `Dockerfile` we created).
6.  **Instance Type**: Free.
7.  **Environment Variables**:
    Scroll down to "Environment Variables" and add the following:

    | Key | Value |
    | --- | --- |
    | `DB_URL` | Your MySQL URL from Part 1 (e.g., `jdbc:mysql://host:port/defaultdb?ssl-mode=REQUIRED`) |
    | `DB_USERNAME` | The username from Part 1 (e.g., `avnadmin`) |
    | `DB_PASSWORD` | The password from Part 1 |
    | `JWT_SECRET` | Generate a random long string (or use the one from your local file) |
    | `MAIL_USERNAME` | `verify.shadowtalk@gmail.com` |
    | `MAIL_PASSWORD` | `rpks splx upxs abbb` |
    | `GOOGLE_CLIENT_ID` | Your Google Client ID |
    | `PORT` | `8080` |
    | `ALLOWED_ORIGINS` | Your Vercel Frontend URL (e.g., `https://shadowtalk.vercel.app`) |

8.  Click **Create Web Service**.
9.  Wait for the build to finish. Once live, Render will give you a URL (e.g., `https://shadowtalk-backend.onrender.com`). **Copy this URL.**

---

## Part 3: Frontend Deployment (Vercel)

1.  Log in to [Vercel](https://vercel.com/new).
2.  Import your GitHub repository.
3.  **Root Directory**: Click "Edit" and select `frontend`.
4.  **Framework Preset**: Vite (should be auto-detected).
5.  **Environment Variables**:
    Add the following variable to tell the frontend where the backend is:

    | Key | Value |
    | --- | --- |
    | `VITE_API_URL` | The Render Backend URL you copied (e.g., `https://shadowtalk-backend.onrender.com`) |

6.  Click **Deploy**.
7.  Once finished, Vercel will give you a live domain (e.g., `https://shadowtalk.vercel.app`).

---

## Part 4: Final Configuration

1.  **Update Backend CORS**:
    Your backend needs to know it's safe to accept requests from your new Vercel domain.
    *   Go back to **Render** -> Dashboard -> Select your Backend Service.
    *   Go to **Environment Variables**.
    *   (Actually, our code currently allows `http://localhost:...`. For strict security, we should add your Vercel domain to `SecurityConfig.java`. But for now, if you experience CORS errors, let me know and we will add a `ALLOWED_ORIGINS` env var to the backend code).

    *Current Code Check*: Our `SecurityConfig.java` allows specific localhost ports. **We should probably update the code to allow all origins OR allow an environment variable for origins before you deploy.**

    **Action**: I will update `SecurityConfig.java` to read `ALLOWED_ORIGINS` from environment variables before you push.

---

## Step-by-Step Summary for You
1.  **Push** all current changes to GitHub.
2.  **Create MySQL DB** (Aiven or Railway).
3.  **Create Backend on Render** (set Env Vars).
4.  **Create Frontend on Vercel** (set `VITE_API_URL`).
5.  **Test**: Open your Vercel link and sign up!
