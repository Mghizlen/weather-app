import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import weatherRoutes from './routes/weather';
import authRoutes from './routes/auth';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

/**
 * Create and configure Express application
 */
const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Apply rate limiting to all routes
  app.use(apiLimiter);

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Weather API is running',
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use('/api/weather', weatherRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/location', authRoutes); // Location routes also in authRoutes

  // 404 handler
  app.use(notFound);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
