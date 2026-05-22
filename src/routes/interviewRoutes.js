import { Router } from 'express';
import * as interviewController from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// ==================== PROTECTED ROUTES ====================

// Schedule a new interview (Recruiters & Hiring Managers)
router.post(
  '/',
  protect,
  authorize('recruiter', 'hiring_manager', 'admin'),
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
  interviewController.getInterviewById
);

// Update interview (reschedule, change location, etc.)
router.put(
  '/:id',
  protect,
  authorize('recruiter', 'hiring_manager', 'admin'),
  interviewController.updateInterview
);

// Submit feedback after interview
router.post(
  '/:id/feedback',
  protect,
  authorize('recruiter', 'hiring_manager', 'admin'),
  interviewController.submitFeedback
);

// Cancel interview
router.patch(
  '/:id/cancel',
  protect,
  authorize('recruiter', 'hiring_manager', 'admin'),
  interviewController.cancelInterview
);

// Reschedule interview
router.patch(
  '/:id/reschedule',
  protect,
  authorize('recruiter', 'hiring_manager', 'admin'),
  interviewController.rescheduleInterview
);

export default router;