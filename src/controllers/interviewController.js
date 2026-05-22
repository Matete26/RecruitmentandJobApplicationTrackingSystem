import Interview from '../models/interviewModel.js';
import Application from '../models/applicationModel.js';
import User from '../models/userModel.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Schedule a new interview
 */
export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, type, date, duration, location, interviewers } = req.body;

    // Validate application exists and is in correct stage
    const application = await Application.findById(applicationId)
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    if (application.status !== 'shortlisted' && application.status !== 'interview') {
      throw new AppError('Application must be shortlisted before scheduling interview', 400);
    }

    // Create interview
    const interview = await Interview.create({
      application: applicationId,
      candidate: application.candidate._id,
      job: application.job._id,
      type,
      date,
      duration: duration || 60,
      location,
      interviewers: interviewers || [req.user.id], // Default to current user
      status: 'scheduled'
    });

    // Update application status
    await Application.findByIdAndUpdate(applicationId, {
      status: 'interview'
    });

    const populatedInterview = await Interview.findById(interview._id)
      .populate('candidate', 'name email profile')
      .populate('job', 'title department')
      .populate('interviewers', 'name email');

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: populatedInterview
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error scheduling interview'
    });
  }
};

/**
 * Get all interviews (For recruiters/hiring managers)
 */
export const getInterviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const interviews = await Interview.find(query)
      .populate('candidate', 'name email')
      .populate('job', 'title department')
      .populate('interviewers', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ date: 1 });

    res.json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching interviews',
      error: error.message
    });
  }
};

/**
 * Get candidate's own interviews
 */
export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ candidate: req.user.id })
      .populate('job', 'title department location')
      .populate('interviewers', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your interviews',
      error: error.message
    });
  }
};

/**
 * Get single interview by ID
 */
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidate', 'name email profile')
      .populate('job', 'title department')
      .populate('interviewers', 'name email')
      .populate('application');

    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    // Allow access if user is admin/recruiter or the candidate
    if (req.user.role === 'candidate' && interview.candidate._id.toString() !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update interview details (Reschedule, change type, etc.)
 */
export const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('candidate')
    .populate('job')
    .populate('interviewers', 'name');

    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    res.json({
      success: true,
      message: 'Interview updated successfully',
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating interview',
      error: error.message
    });
  }
};

/**
 * Submit interview feedback
 */
export const submitFeedback = async (req, res) => {
  try {
    const { rating, comments, strengths, weaknesses } = req.body;

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    interview.feedback.push({
      interviewer: req.user.id,
      rating,
      comments,
      strengths,
      weaknesses
    });

    interview.status = 'completed';
    await interview.save();

    const updatedInterview = await Interview.findById(req.params.id)
      .populate('feedback.interviewer', 'name');

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: updatedInterview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

/**
 * Cancel interview
 */
export const cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    res.json({
      success: true,
      message: 'Interview cancelled successfully',
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling interview',
      error: error.message
    });
  }
};

/**
 * Reschedule interview
 */
export const rescheduleInterview = async (req, res) => {
  try {
    const { date, duration, location } = req.body;

    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      {
        date,
        duration,
        location,
        status: 'scheduled'
      },
      { new: true }
    )
    .populate('candidate')
    .populate('job');

    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    res.json({
      success: true,
      message: 'Interview rescheduled successfully',
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rescheduling interview',
      error: error.message
    });
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