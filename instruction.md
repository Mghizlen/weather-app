## Plan: Build MERN Weather Dashboard

Complete implementation of a production-ready weather dashboard using MongoDB, Express, React, Node with TypeScript, featuring geolocation-based weather, 48-hour forecasts, Lottie animations, offline PWA support, and secure API integration.

### Steps

1. **Initialize project structure** — Create `backend/` and `frontend/` folders with `package.json`, `tsconfig.json`, Tailwind/Vite configs, and `.env.example` templates for MongoDB URI, OpenWeather API key, JWT secret.

2. **Build backend API layer** — Implement Express TypeScript server with `app.ts`, `server.ts`, create `routes/` (weather, auth), `controllers/`, `services/openWeatherService.ts` with rate limiting, `models/` (SearchCache, SavedLocation Mongoose schemas), and `middleware/` (errorHandler, rateLimiter, JWT auth).

3. **Develop React frontend** — Setup Vite+React+TypeScript with `pages/Home.tsx`, create components (`CurrentWeather`, `HourlyForecast`, `DailyForecast`, `SearchBar`, `WeatherIcon`), implement `hooks/useGeolocation.ts` and `hooks/useWeather.ts`, configure Tailwind CSS responsive design, add Lottie icon mapping in `mapIcons.ts`.

4. **Add caching, auth, and offline support** — Implement MongoDB caching layer (5min TTL) in backend `services/cache.ts`, add JWT authentication for favorites endpoints, create `service-worker.ts` for PWA offline fallback with Workbox, store recent searches in localStorage.

5. **Implement testing and CI/CD** — Write Jest+Supertest backend tests (80% coverage), React Testing Library frontend tests (70% coverage), create `.github/workflows/ci.yml` for automated linting/testing/building, add `scripts/run-local.sh` and `scripts/seed-favorites.ts`.

6. **Configure deployment and security** — Add Helmet, CORS, rate limiting, CSP headers to backend, secure API key server-side only, setup production configs for Vercel (frontend) + Render/Railway (backend) + MongoDB Atlas, configure environment variables, enable HTTPS, implement WCAG AA accessibility standards.

### Decisions Made

1. **OpenWeather API** — ✅ Use free tier: Current Weather API + 5 Day / 3 Hour Forecast API (instead of One Call 3.0). This provides current conditions and 5-day forecast in 3-hour intervals (40 data points), sufficient for the dashboard.

2. **Authentication approach** — ✅ Implement full JWT authentication from start with proper user registration/login. This is production-ready and follows best practices for secure, scalable applications.

3. **Lottie animations** — ✅ Use free animations from LottieFiles public library. Download weather-themed animations (Clear Sky, Clouds, Rain, Snow, Thunderstorm, Mist) and store in `frontend/src/assets/lottie/`. Fallback to simple SVG icons if Lottie fails to load.
