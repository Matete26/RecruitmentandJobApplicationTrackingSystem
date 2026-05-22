import Application from '../models/applicationModel.js';
import Job from '../models/jobModel.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Apply for a job
 */
export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.status !== 'open') {
      throw new AppError('This job is no longer accepting applications', 400);
    }

    // Check if candidate already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user.id
    });

    if (existingApplication) {
      throw new AppError('You have already applied for this job', 400);
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      coverLetter,
      resume: req.user.profile?.resume,
      status: 'applied'
    });

    // Increment applicant count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title department location')
      .populate('candidate', 'name email');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: populatedApplication
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error submitting application'
    });
  }
};

/**
 * Get all applications (For recruiters and hiring managers)
 */
export const getApplications = async (req, res) => {
  try {
    const { status, jobId, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (jobId) query.job = jobId;

    const applications = await Application.find(query)
      .populate('candidate', 'name email profile')
      .populate('job', 'title department location')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

/**
 * Get candidate's own applications
 */
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title department location status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your applications',
      error: error.message
    });
  }
};

/**
 * Get single application by ID
 */
export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email profile')
      .populate('job', 'title department location postedBy')
      .populate('notes.addedBy', 'name');

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Candidates can only view their own applications
    if (req.user.role === 'candidate' && application.candidate._id.toString() !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update application status (Recruiter only)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
    .populate('candidate', 'name email')
    .populate('job', 'title');

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};

/**
 * Add note/feedback to application
 */
export const addNote = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      throw new AppError('Note text is required', 400);
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            text,
            addedBy: req.user.id
          }
        }
      },
      { new: true }
    ).populate('notes.addedBy', 'name');

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding note',
      error: error.message
    });
  }
};

/**
 * Withdraw application (Candidate only)
 */
export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      candidate: req.user.id
    });

    if (!application) {
      throw new AppError('Application not found or access denied', 404);
    }

    if (application.status === 'hired') {
      throw new AppError('Cannot withdraw a hired application', 400);
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
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