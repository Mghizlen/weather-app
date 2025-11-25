import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';

/**
 * Interface for JWT payload
 */
export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Extend Express Request to include user data
 */
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * Middleware to verify JWT token and authenticate requests
 */
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided. Please authenticate.');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new ApiError(401, 'No token provided. Please authenticate.');
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, 'Token has expired. Please login again.');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, 'Invalid token. Please login again.');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT token for authenticated user
 */
export const generateToken = (payload: JWTPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiresIn || '7d',
  } as jwt.SignOptions);
};

/**
 * Optional authentication middleware
 * Adds user data if token is valid, but doesn't block unauthenticated requests
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const jwtSecret = process.env.JWT_SECRET;

      if (jwtSecret && token) {
        try {
          const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
          req.user = decoded;
        } catch (error) {
          // Silently ignore invalid tokens for optional auth
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
