import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * General API rate limiter
 * Limits requests to prevent abuse
 */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per window
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
      },
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Weather API rate limiter
 * Moderate limits for weather data requests
 */
export const weatherLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    error: {
      message: 'Too many weather requests, please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
