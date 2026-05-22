import { Router } from 'express';
import * as jobController from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// Public Routes (Anyone can view open jobs)
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJob);

// Protected Routes
router.post('/', protect, authorize('recruiter', 'hiring_manager', 'admin'), jobController.createJob);
router.put('/:id', protect, authorize('recruiter', 'hiring_manager', 'admin'), jobController.updateJob);
router.delete('/:id', protect, authorize('admin'), jobController.deleteJob);

export default router;