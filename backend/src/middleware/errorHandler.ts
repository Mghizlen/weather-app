import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation errors
    statusCode = 400;
    message = err.message;
    isOperational = true;
  } else if (err.name === 'CastError') {
    // MongoDB cast errors (invalid ID format)
    statusCode = 400;
    message = 'Invalid ID format';
    isOperational = true;
  } else if (err.message) {
    message = err.message;
  }

  // Log error for debugging (only log non-operational errors in production)
  if (!isOperational || process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err,
      }),
    },
  });
};

/**
 * Catch 404 errors (route not found)
 */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
  next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
