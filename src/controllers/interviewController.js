import interviewService from '../services/interviewService.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Schedule a new interview
 */
export const scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, type, date, duration, location, interviewers } = req.body;
    const interview = await interviewService.scheduleInterview({ applicationId, type, date, duration, location, interviewers, requesterId: req.user._id || req.user.id });
    res.status(201).json({ success: true, message: 'Interview scheduled successfully', data: interview });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all interviews (For recruiters/hiring managers)
 */
export const getInterviews = async (req, res, next) => {
  try {
    const interviews = await interviewService.queryInterviews({ queryParams: req.query });
    res.json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    next(error);
  }
};

/**
 * Get candidate's own interviews
 */
export const getMyInterviews = async (req, res, next) => {
  try {
    const interviews = await interviewService.getInterviewsByCandidate(req.user._id || req.user.id);
    res.json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single interview by ID
 */
export const getInterviewById = async (req, res, next) => {
  try {
    const interview = await interviewService.getInterviewById(req.params.id);
    if (req.user.role === 'candidate' && interview.candidate._id.toString() !== (req.user._id || req.user.id).toString()) {
      throw new AppError('Access denied', 403);
    }
    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

/**
 * Update interview details (Reschedule, change type, etc.)
 */
export const updateInterview = async (req, res, next) => {
  try {
    const interview = await interviewService.updateInterview(req.params.id, req.body);
    res.json({ success: true, message: 'Interview updated successfully', data: interview });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit interview feedback
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comments, strengths, weaknesses } = req.body;
    const updated = await interviewService.submitFeedback(req.params.id, { rating, comments, strengths, weaknesses, interviewerId: req.user._id || req.user.id });
    res.json({ success: true, message: 'Feedback submitted successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel interview
 */
export const cancelInterview = async (req, res, next) => {
  try {
    const interview = await interviewService.cancelInterview(req.params.id);
    res.json({ success: true, message: 'Interview cancelled successfully', data: interview });
  } catch (error) {
    next(error);
  }
};

/**
 * Reschedule interview
 */
export const rescheduleInterview = async (req, res, next) => {
  try {
    const { date, duration, location } = req.body;
    const interview = await interviewService.rescheduleInterview(req.params.id, { date, duration, location });
    res.json({ success: true, message: 'Interview rescheduled successfully', data: interview });
  } catch (error) {
    next(error);
  }
};

export default {
  scheduleInterview,
  getInterviews,
  getMyInterviews,
  getInterviewById,
  updateInterview,
  submitFeedback,
  cancelInterview,
  rescheduleInterview
};