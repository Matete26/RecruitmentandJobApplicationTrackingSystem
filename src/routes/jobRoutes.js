import { Router } from 'express';
import * as jobController from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createJobSchema, idParamSchema } from '../validators/schemas.js';

const router = Router();

// Public Routes (Anyone can view open jobs)
router.get('/', jobController.getJobs);
router.get('/:id', validate(idParamSchema, { params: true }), jobController.getJob);

// Protected Routes
router.post('/', protect, authorize('recruiter', 'hiring_manager', 'admin'), validate(createJobSchema), jobController.createJob);
router.put('/:id', protect, authorize('recruiter', 'hiring_manager', 'admin'), validate(idParamSchema, { params: true }), jobController.updateJob);
router.delete('/:id', protect, authorize('admin'), validate(idParamSchema, { params: true }), jobController.deleteJob);

export default router;