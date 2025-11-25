import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, generateToken } from '../middleware/auth';
import { SavedLocation } from '../models/SavedLocation';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, 'User already exists with this email');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  }
);

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
        },
        token,
      },
    });
  }
);

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  }
);

/**
 * Save a favorite location
 * POST /api/location/save
 */
export const saveLocation = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { city, country, lat, lon } = req.body;

    // Check if location already saved
    const existing = await SavedLocation.findOne({
      userId: req.user.userId,
      lat,
      lon,
    });

    if (existing) {
      throw new ApiError(400, 'Location already saved');
    }

    // Create saved location
    const savedLocation = await SavedLocation.create({
      userId: req.user.userId,
      city,
      country,
      lat,
      lon,
    });

    res.status(201).json({
      success: true,
      data: savedLocation,
    });
  }
);

/**
 * Get user's saved locations
 * GET /api/location/favorites
 */
export const getFavorites = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const favorites = await SavedLocation.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: favorites,
      count: favorites.length,
    });
  }
);

/**
 * Delete a saved location
 * DELETE /api/location/favorites/:id
 */
export const deleteFavorite = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id } = req.params;

    const location = await SavedLocation.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!location) {
      throw new ApiError(404, 'Location not found or unauthorized');
    }

    res.json({
      success: true,
      message: 'Location deleted successfully',
    });
  }
);

/**
 * Validation rules for register
 */
export const registerValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

/**
 * Validation rules for login
 */
export const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for saveLocation
 */
export const saveLocationValidation = [
  body('city').notEmpty().withMessage('City is required').trim(),
  body('country').notEmpty().withMessage('Country is required').trim(),
  body('lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('lon')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
];
