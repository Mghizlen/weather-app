import { Router } from 'express';
import {
  getCurrentWeather,
  searchCities,
  getCurrentWeatherValidation,
  searchCitiesValidation,
} from '../controllers/weatherController';
import { weatherLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * Weather routes
 * All routes are prefixed with /api/weather
 */

// GET /api/weather/current - Get current weather and forecast by coordinates
router.get(
  '/current',
  weatherLimiter,
  getCurrentWeatherValidation,
  getCurrentWeather
);

// GET /api/weather/search - Search for cities
router.get(
  '/search',
  weatherLimiter,
  searchCitiesValidation,
  searchCities
);

export default router;
