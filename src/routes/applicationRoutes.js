import { Router } from 'express';
import * as applicationController from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { applyJobSchema, jobIdParamSchema, idParamSchema } from '../validators/schemas.js';

const router = Router();

// Candidate Routes
router.post('/jobs/:jobId/apply', protect, authorize('candidate'), validate(jobIdParamSchema, { params: true }), validate(applyJobSchema), applicationController.applyJob);
router.get('/my-applications', protect, authorize('candidate'), applicationController.getMyApplications);

// Recruiter / Hiring Manager Routes
router.get('/', protect, authorize('recruiter', 'hiring_manager', 'admin'), applicationController.getApplications);
router.get('/:id', protect, validate(idParamSchema, { params: true }), applicationController.getApplicationById);

router.put('/:id/status', protect, authorize('recruiter', 'hiring_manager', 'admin'), validate(idParamSchema, { params: true }), applicationController.updateApplicationStatus);
router.post('/:id/notes', protect, authorize('recruiter', 'hiring_manager', 'admin'), validate(idParamSchema, { params: true }), applicationController.addNote);

export default router;