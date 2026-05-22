import { Router } from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.put('/profile', protect, authController.updateProfile);

export default router;