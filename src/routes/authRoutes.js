import { Router } from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  updateProfileSchema
} from '../validators/schemas.js';

const router = Router();

// Public Routes
router.post('/register', validate(registerSchema), authController.register);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

// Protected Routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.put('/profile', protect, validate(updateProfileSchema), authController.updateProfile);

export default router;