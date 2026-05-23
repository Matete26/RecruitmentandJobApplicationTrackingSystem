import { Router } from 'express';
import userController from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, isAdmin } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { updateProfileSchema, idParamSchema } from '../validators/schemas.js';

const router = Router();

// Protected Routes
router.get('/', protect, authorize('recruiter', 'hiring_manager', 'admin'), userController.getUsers);
router.get('/candidates', protect, authorize('recruiter', 'hiring_manager', 'admin'), userController.searchCandidates);

router.get('/:id', protect, authorize('recruiter', 'hiring_manager', 'admin'), validate(idParamSchema, { params: true }), userController.getUserById);

router.put('/:id', protect, authorize('admin'), validate(idParamSchema, { params: true }), validate(updateProfileSchema), userController.updateUser);
router.patch('/:id/status', protect, isAdmin, validate(idParamSchema, { params: true }), userController.toggleUserStatus);

export default router;