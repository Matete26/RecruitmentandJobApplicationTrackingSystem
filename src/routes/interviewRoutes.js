import { Router } from 'express';
import * as interviewController from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { scheduleInterviewSchema, idParamSchema } from '../validators/schemas.js';

const router = Router();

// ==================== PROTECTED ROUTES ====================

// Schedule a new interview (Recruiters & Hiring Managers)
router.post(
  '/',
  protect,
  authorize('recruiter', 'hiring_manager', 'admin'),
  validate(scheduleInterviewSchema),
  interviewController.scheduleInterview
);

// Get all interviews (For recruiters/hiring managers)
router.get(
  '/',
  protect,
  authorize('recruiter', 'hiring_manager', 'admin'),
  interviewController.getInterviews
);

// Get candidate's own interviews
router.get(
  '/my-interviews',
  protect,
  authorize('candidate'),
  interviewController.getMyInterviews
);

// Get single interview by ID
router.get(
  '/:id',
  protect,
  validate(idParamSchema, { params: true }),
  interviewController.getInterviewById
);

// Update interview (reschedule, change location, etc.)
router.put(
  '/:id',
  protect,
  authorize('recruiter', 'hiring_manager', 'admin'),
  validate(idParamSchema, { params: true }),
  interviewController.updateInterview
);

// Submit feedback after interview
router.post(
  '/:id/feedback',
  protect,
  authorize('recruiter', 'hiring_manager', 'admin'),
  validate(idParamSchema, { params: true }),
  interviewController.submitFeedback
);

// Cancel interview
router.patch(
  '/:id/cancel',
  protect,
  authorize('recruiter', 'hiring_manager', 'admin'),
  validate(idParamSchema, { params: true }),
  interviewController.cancelInterview
);

// Reschedule interview
router.patch(
  '/:id/reschedule',
  protect,
  authorize('recruiter', 'hiring_manager', 'admin'),
  validate(idParamSchema, { params: true }),
  interviewController.rescheduleInterview
);

export default router;