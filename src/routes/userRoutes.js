import { Router } from 'express';
import userController from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, isAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

// Protected Routes
router.get('/', protect, authorize('recruiter', 'hiring_manager', 'admin'), userController.getUsers);
router.get('/candidates', protect, authorize('recruiter', 'hiring_manager', 'admin'), userController.searchCandidates);

router.get('/:id', protect, authorize('recruiter', 'hiring_manager', 'admin'), userController.getUserById);

router.put('/:id', protect, authorize('admin'), userController.updateUser);
router.patch('/:id/status', protect, isAdmin, userController.toggleUserStatus);

export default router;