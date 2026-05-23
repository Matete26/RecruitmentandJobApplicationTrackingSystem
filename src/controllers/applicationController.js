import applicationService from '../services/applicationService.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Apply for a job
 */
export const applyJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const resume = req.user.profile?.resume;
    const application = await applicationService.applyToJob({ jobId, candidateId: req.user._id || req.user.id, coverLetter, resume });
    res.status(201).json({ success: true, message: 'Application submitted successfully', data: application });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all applications (For recruiters and hiring managers)
 */
export const getApplications = async (req, res, next) => {
  try {
    const result = await applicationService.queryApplications({ queryParams: req.query });
    res.json({ success: true, count: result.applications.length, total: result.total, totalPages: Math.ceil(result.total / result.limit), currentPage: result.page, data: result.applications });
  } catch (error) {
    next(error);
  }
};

/**
 * Get candidate's own applications
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getApplicationsByCandidate(req.user._id || req.user.id);
    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single application by ID
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await applicationService.getApplicationById(req.params.id);
    // Candidates can only view their own applications
    if (req.user.role === 'candidate' && application.candidate._id.toString() !== (req.user._id || req.user.id).toString()) {
      throw new AppError('Access denied', 403);
    }
    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

/**
 * Update application status (Recruiter only)
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await applicationService.updateApplicationStatus(req.params.id, status);
    res.json({ success: true, message: `Application status updated to ${status}`, data: application });
  } catch (error) {
    next(error);
  }
};

/**
 * Add note/feedback to application
 */
export const addNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    const application = await applicationService.addApplicationNote(req.params.id, text, req.user._id || req.user.id);
    res.json({ success: true, message: 'Note added successfully', data: application });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw application (Candidate only)
 */
export const withdrawApplication = async (req, res, next) => {
  try {
    await applicationService.withdrawApplication(req.params.id, req.user._id || req.user.id);
    res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (error) {
    next(error);
  }
};

export default {
  applyJob,
  getApplications,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  addNote,
  withdrawApplication
};