import Job from '../models/jobModel.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Create a new job posting
 */
export const createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user.id
    });

    const populatedJob = await Job.findById(job._id).populate('postedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: populatedJob
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
};

/**
 * Get all jobs with advanced filtering and pagination
 */
export const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      department,
      type,
      location,
      search,
      minSalary,
      maxSalary
    } = req.query;

    const query = {};

    // Basic filters
    if (status) query.status = status;
    if (department) query.department = department;
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };

    // Salary range filter
    if (minSalary || maxSalary) {
      query['salary.min'] = {};
      if (minSalary) query['salary.min'].$gte = parseInt(minSalary);
      if (maxSalary) query['salary.max'] = { $lte: parseInt(maxSalary) };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Only show open jobs to public (unless recruiter/admin)
    if (!req.user || !['recruiter', 'hiring_manager', 'admin'].includes(req.user.role)) {
      query.status = 'open';
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

/**
 * Get single job by ID
 */
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email profile');

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error fetching job'
    });
  }
};

/**
 * Update job posting
 */
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name');

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
};

/**
 * Delete job posting
 */
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
};

/**
 * Get jobs posted by current recruiter/hiring manager
 */
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your posted jobs',
      error: error.message
    });
  }
};

/**
 * Close / Archive a job
 */
export const closeJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    res.json({
      success: true,
      message: 'Job closed successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error closing job',
      error: error.message
    });
  }
};

export default {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getMyJobs,
  closeJob
};