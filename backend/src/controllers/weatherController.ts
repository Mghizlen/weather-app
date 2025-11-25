// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { weatherstackService as openWeatherService } from '../services/weatherstackService';
import { cacheService } from '../services/cacheService';

/**
 * Get current weather and forecast by coordinates
 * GET /api/weather/current?lat=<lat>&lon=<lon>&units=<units>
 */
export const getCurrentWeather = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const { lat, lon, units = 'metric' } = req.query;

    // Check cache first
    const cachedData = await cacheService.get(
      parseFloat(lat as string),
      parseFloat(lon as string),
      units as string
    );

    if (cachedData) {
      res.json({
        success: true,
        data: cachedData,
        cached: true,
      });
      return;
    }

    // Fetch from OpenWeather API
    const weatherData = await openWeatherService.getWeatherByCoordinates(
      parseFloat(lat as string),
      parseFloat(lon as string),
      units as 'metric' | 'imperial' | 'standard'
    );

    // Cache the response
    await cacheService.set(
      parseFloat(lat as string),
      parseFloat(lon as string),
      units as string,
      weatherData as any
    );

    return res.json({
      success: true,
      data: weatherData,
      cached: false,
    });
  }
);

/**
 * Search for cities by name (autocomplete)
 * GET /api/weather/search?q=<query>
 */
export const searchCities = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      throw new ApiError(400, 'Search query is required');
    }

    const cities = await openWeatherService.searchCities(q, 5);

    res.json({
      success: true,
      data: cities,
      count: cities.length,
    });
  }
);

/**
 * Validation rules for getCurrentWeather
 */
export const getCurrentWeatherValidation = [
  query('lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lon')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('units')
    .optional()
    .isIn(['metric', 'imperial', 'standard'])
    .withMessage('Units must be metric, imperial, or standard'),
];

/**
 * Validation rules for searchCities
 */
export const searchCitiesValidation = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isString()
    .withMessage('Search query must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
];
