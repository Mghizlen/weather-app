# Deployment Guide

## Environment Variables Required

### Backend (Render/Railway/Heroku)

You must manually configure these environment variables in your hosting dashboard:

#### Required Variables:

1. **MONGODB_URI** (Required)
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - Get from: MongoDB Atlas connection string
   - Example: `mongodb+srv://user:pass@cluster0.mongodb.net/weather-dashboard?retryWrites=true&w=majority`

2. **OPENWEATHER_API_KEY** (Required)
   - Format: 32-character alphanumeric string
   - Get from: https://openweathermap.org/api (free tier)
   - Example: `d10b45c67fed40481125bd37cc50cc0e`

3. **JWT_SECRET** (Required)
   - Format: Random 64+ character string
   - Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - Example: `8f9a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a`

4. **CORS_ORIGIN** (Required)
   - Format: Full URL with protocol
   - Set to your frontend URL
   - Example: `https://your-app.vercel.app`
   - For development: `http://localhost:5173`
   - For multiple origins: `https://app1.com,https://app2.com`

#### Optional Variables (with defaults):

5. **NODE_ENV**
   - Default: `development`
   - Production: `production`

6. **PORT**
   - Default: `5000`
   - Render/Railway set this automatically

7. **JWT_EXPIRES_IN**
   - Default: `7d`
   - Format: `7d`, `24h`, `30m`, etc.

8. **CACHE_TTL_SECONDS**
   - Default: `300` (5 minutes)
   - Format: Number in seconds

---

## Render Deployment Steps

1. **Create MongoDB Atlas Database**
   - Sign up at https://mongodb.com/cloud/atlas
   - Create free cluster
   - Create database user
   - Whitelist IP: `0.0.0.0/0` (all IPs)
   - Get connection string from "Connect" → "Drivers"

2. **Deploy Backend to Render**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `weather-app-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Add Environment Variables in Render**
   - Go to "Environment" tab
   - Click "Add Environment Variable" for each:
     - `MONGODB_URI` = `<your-mongodb-atlas-connection-string>`
     - `OPENWEATHER_API_KEY` = `<your-openweather-api-key>`
     - `JWT_SECRET` = `<generate-random-64-char-string>`
     - `CORS_ORIGIN` = `https://your-frontend.vercel.app`
     - `NODE_ENV` = `production`
   - Click "Save Changes"

4. **Wait for Deployment**
   - Render will automatically deploy
   - Check logs for any errors
   - Copy your backend URL (e.g., `https://weather-app-backend.onrender.com`)

---

## Vercel Frontend Deployment

1. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

2. **Add Environment Variable**
   - Go to "Settings" → "Environment Variables"
   - Add:
     - Key: `VITE_API_URL`
     - Value: `https://your-backend.onrender.com` (your Render backend URL)
   - Click "Save"

3. **Redeploy**
   - Go to "Deployments"
   - Click "..." → "Redeploy"

---

## Troubleshooting

### Backend fails with "MONGODB_URI is not defined"
- Verify environment variable is set in Render dashboard
- Ensure variable name is exactly `MONGODB_URI` (case-sensitive)
- No quotes around the value

### Backend fails with "OPENWEATHER_API_KEY is not defined"
- Add the variable in Render Environment tab
- Verify the API key is valid at https://openweathermap.org

### Frontend can't connect to backend
- Verify `VITE_API_URL` in Vercel matches your backend URL
- Check CORS settings: `CORS_ORIGIN` in backend must match frontend URL
- Enable HTTPS on both frontend and backend

### MongoDB connection fails
- Verify connection string format
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Ensure database user has read/write permissions
- Test connection string locally first

---

## Production Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Backend deployed to Render with all environment variables
- [ ] Frontend deployed to Vercel with `VITE_API_URL`
- [ ] CORS_ORIGIN set to frontend URL
- [ ] OpenWeather API key is valid and has credits
- [ ] JWT_SECRET is a strong random string (64+ chars)
- [ ] Test the deployed app with real location data
- [ ] Monitor logs for any runtime errors

---

## Quick Reference

### MongoDB Connection String Format:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Test Backend Health:
```bash
curl https://your-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-12-09T..."
}
```
