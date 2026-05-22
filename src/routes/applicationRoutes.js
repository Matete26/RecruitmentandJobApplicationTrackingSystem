import { Router } from 'express';
import * as applicationController from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// Candidate Routes
router.post('/jobs/:jobId/apply', protect, authorize('candidate'), applicationController.applyJob);
router.get('/my-applications', protect, authorize('candidate'), applicationController.getMyApplications);

// Recruiter / Hiring Manager Routes
router.get('/', protect, authorize('recruiter', 'hiring_manager', 'admin'), applicationController.getApplications);
router.get('/:id', protect, applicationController.getApplicationById);

router.put('/:id/status', protect, authorize('recruiter', 'hiring_manager', 'admin'), applicationController.updateApplicationStatus);
router.post('/:id/notes', protect, authorize('recruiter', 'hiring_manager', 'admin'), applicationController.addNote);

export default router;