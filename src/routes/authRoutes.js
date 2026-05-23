import { Router } from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/schemas.js';

const router = Router();

// Public Routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected Routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.put('/profile', protect, validate(updateProfileSchema), authController.updateProfile);

export default router;