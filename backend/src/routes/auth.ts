import { Router } from 'express';
import {
  register,
  login,
  getMe,
  saveLocation,
  getFavorites,
  deleteFavorite,
  registerValidation,
  loginValidation,
  saveLocationValidation,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * Authentication and location routes
 * Prefixed with /api/auth and /api/location
 */

// Auth routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/me', authenticate, getMe);

// Location routes
router.post('/save', authenticate, saveLocationValidation, saveLocation);
router.get('/favorites', authenticate, getFavorites);
router.delete('/favorites/:id', authenticate, deleteFavorite);

export { router as authRouter };
export default router;
