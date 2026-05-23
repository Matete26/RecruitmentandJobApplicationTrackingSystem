import jobService from '../services/jobService.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Create a new job posting
 */
export const createJob = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (typeof body.salary === 'number') {
      body.salary = { min: body.salary, currency: 'USD' };
    }
    if (typeof body.salary === 'string' && !Number.isNaN(Number(body.salary))) {
      body.salary = { min: Number(body.salary), currency: 'USD' };
    }

    const created = await jobService.createJob({ body, user: req.user });
    res.status(201).json({ success: true, message: 'Job posted successfully', data: created });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all jobs with advanced filtering and pagination
 */
export const getJobs = async (req, res, next) => {
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

    const { jobs, total, page: currentPage, limit: perPage } = await jobService.queryJobs({ queryParams: req.query, user: req.user });
    res.json({ success: true, count: jobs.length, total, totalPages: Math.ceil(total / perPage), currentPage, data: jobs });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single job by ID
 */
export const getJob = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

/**
 * Update job posting
 */
export const updateJob = async (req, res, next) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.body);
    res.json({ success: true, message: 'Job updated successfully', data: job });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete job posting
 */
export const deleteJob = async (req, res, next) => {
  try {
    await jobService.deleteJob(req.params.id);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get jobs posted by current recruiter/hiring manager
 */
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await jobService.getJobsByUser(req.user);
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    next(error);
  }
};

/**
 * Close / Archive a job
 */
export const closeJob = async (req, res, next) => {
  try {
    const job = await jobService.closeJob(req.params.id);
    res.json({ success: true, message: 'Job closed successfully', data: job });
  } catch (error) {
    next(error);
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