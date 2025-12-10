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

  // Trust proxy - required for Render and rate limiting
  app.set('trust proxy', 1);

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
  const allowedOrigins = [
    'http://localhost:5173',
    'https://weather-g3it32edi-ghizlens-projects.vercel.app',
    process.env.CORS_ORIGIN
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.some(allowed => origin.startsWith(allowed as string))) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
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
