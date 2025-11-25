Here is a complete `README.md` template for your requested MERN Weather Dashboard project. This Markdown file is structured to deliver exactly as the master prompt specifies, with detailed sections for setup, architecture, features, commands, deployment, and best practices. Use this file as the top-level README in your project ZIP, and tailor the details if your implementation varies.

***

# MERN Weather Dashboard

A production-ready, full-stack Weather Dashboard in MERN (MongoDB, Express, React, Node) with TypeScript and Vite. Features geolocation-based weather, 48-hour forecasts, animated Lottie icons, offline support, Vercel deployment, and complete API documentation.

***

## Project Structure

```
/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── controllers/
│       ├── routes/
│       ├── models/
│       ├── services/
│       └── middleware/
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── service-worker.ts
│       ├── assets/
│       │   └── lottie/
│       └── mapIcons.ts
├── scripts/
│   ├── seed-favorites.ts
│   └── run-local.sh
├── README.md
└── .github/
    └── workflows/
        └── ci.yml
```

***

## Features

- Geolocation-based weather dashboard (OpenWeather One Call API 3.0)
- Current, 48-hour hourly, and 7-day forecast
- City search with autocomplete and favorites
- Animated weather icons via Lottie
- Caching of API results (MongoDB), offline fallback with a Service Worker
- Secure server-side API key handling, JWT authentication for favorites
- Fully responsive (mobile/tablet/desktop) and accessible (WCAG AA)
- Production-ready via vercel deployment

***

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB Atlas account
- API key from OpenWeather (One Call 3.0)

### Environment Setup

1. Copy `.env.example` in backend/ to `.env` and fill in:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   OPENWEATHER_KEY=your_openweather_api_key
   JWT_SECRET=random_string
   CACHE_TTL_SECONDS=300
   ```
2. Clone repo and install dependencies:
   ```sh
   cd backend && npm install
   cd ../frontend && npm install
   ```

### Local Development (without Docker)

```sh
# At project root
chmod +x scripts/run-local.sh
./scripts/run-local.sh

```

Front-end: <http://localhost:5173>  
Back-end: <http://localhost:5000>

***

## Backend (Express + TypeScript)

- `src/app.ts` – Express app config, routes, middleware
- `src/server.ts` – Entry point (connects DB, starts server)
- `src/routes/weather.ts` – `/api/weather/*` endpoints
- `src/routes/auth.ts` – (if using auth)
- `src/services/openWeatherService.ts` – OpenWeather API wrapper (rate-limited, typed)
- `src/models/SearchCache.ts`, `SavedLocation.ts` – Mongoose models
- `src/middleware/` – error handler, rate limiter, JWT auth
- Unit tests: Jest + Supertest (`npm test`)

### API Endpoints

| Method | Endpoint                             | Description                             |
| ------ | ------------------------------------ | --------------------------------------- |
| GET    | `/api/health`                        | Health check                            |
| GET    | `/api/weather/current?lat=&lon=&units=` | Current, hourly(48), daily(7) weather   |
| GET    | `/api/weather/search?q=`             | City autocomplete (top 5 matches)       |
| POST   | `/api/location/save`                 | Save favorite location (auth required)  |

**See functional details in the project prompt above.**

***

## Frontend (Vite + React + TypeScript)

- Page: `src/pages/Home.tsx` (dashboard)
- Components:
  - CurrentWeather
  - HourlyForecast
  - DailyForecast
  - SearchBar (debounced autocomplete)
  - WeatherIcon (animated via Lottie)
- Utility: `src/hooks/useGeolocation.ts`
- Offline: `src/service-worker.ts` (Workbox/manual)
- State: localStorage for recent searches, favorites
- Accessibility: keyboard navigation, alt text, contrast

```sh
npm run dev        # Start dev server
npm run build      # Build production assets
npm run preview    # Preview built site
npm run lint       # Lint
npm run test       # Unit tests
```

***

## Animated Icons (Lottie)

- Place major weather group Lottie JSON files in `frontend/src/assets/lottie/`
- Use `mapIcons.ts` to map OpenWeather weather codes to files
- Fallback to SVG if Lottie fails
- To add icons: Download from [LottieFiles](https://lottiefiles.com/), save as JSON, and update mapping

***

## Scripts

- `scripts/seed-favorites.ts` – Seed sample saved location data
- `scripts/run-local.sh` – Starts backend and frontend for dev

***

## vercel & Deployment


- Sets up backend, frontend, and local MongoDB (Mongo Express optional)

### Cloud Deployment

- Frontend: Vercel/Netlify (build static, set `REACT_APP_BACKEND_URL`)
- Backend: Render/Heroku/Railway (Node, connect to Atlas, env config)
- DB: MongoDB Atlas (cloud cluster, copy URI to backend)

***

## CI/CD

- GitHub Actions: Lints, tests, and builds both frontend and backend on push/PR
- Coverage thresholds: 80% backend, 70% frontend (see `ci.yml`)

***

## Security & Performance

- OPENWEATHER_KEY is never exposed to client; backend only
- Backend: Helmet, CORS, rate-limiting, JWT, CSP headers
- Input validation/sanitization everywhere
- PWA: Service Worker caches last weather results for fallback
- Static assets served with Gzip/Brotli, cache headers
- Monitoring: recommend Sentry/LogDNA (docs inside code)
- Consider Redis for cache scale/migration (see code comments)

***

## Environment Variables

See `backend/.env.example`:

```
PORT=5000
MONGODB_URI=your_mongo_uri
OPENWEATHER_KEY=your_openweather
JWT_SECRET=
CACHE_TTL_SECONDS=300
CORS_ORIGIN=http://localhost:5173
```

***

## Testing

### Backend

- `npm run test` (Jest + Supertest)
- External calls mocked (nock)
- Route and cache unit tests

### Frontend

- `npm run test` (Jest + React Testing Library)
- Snapshot and logic tests for components
- Example Cypress E2E test for full dashboard geolocation flow

***

## Notes

- See inline code comments throughout for details, explanations, and customization tips.
- For authentication, disable in routes for demo mode as noted in controllers.
- Follow the Security & Monitoring checklist before going live.
- For scaling (e.g., Redis cache), see `src/services/cache.ts` migration notes.

***

Happy hacking – see source files and code comments for further documentation and guides! If you adapt or extend this project, update this README accordingly.