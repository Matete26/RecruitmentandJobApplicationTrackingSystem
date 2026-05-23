import Job from '../models/jobModel.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const createJob = async ({ body, user }, { JobModel = Job } = {}) => {
  const job = await JobModel.create({ ...body, postedBy: user._id || user.id });
  const populatedJob = await JobModel.findById(job._id).populate('postedBy', 'name email');
  return populatedJob;
};

export const queryJobs = async ({ queryParams, user }, { JobModel = Job } = {}) => {
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
  } = queryParams;

  const query = {};
  if (status) query.status = status;
  if (department) query.department = department;
  if (type) query.type = type;
  if (location) query.location = { $regex: location, $options: 'i' };

  if (minSalary || maxSalary) {
    query['salary.min'] = {};
    if (minSalary) query['salary.min'].$gte = parseInt(minSalary);
    if (maxSalary) query['salary.max'] = { $lte: parseInt(maxSalary) };
  }

  if (search) query.$text = { $search: search };

  if (!user || !['recruiter', 'hiring_manager', 'admin'].includes(user.role)) {
    query.status = 'open';
  }

  const jobs = await JobModel.find(query)
    .populate('postedBy', 'name email')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await JobModel.countDocuments(query);

  return { jobs, total, page: parseInt(page), limit: parseInt(limit) };
};

export const getJobById = async (id, { JobModel = Job } = {}) => {
  const job = await JobModel.findById(id).populate('postedBy', 'name email profile');
  if (!job) throw new AppError('Job not found', 404);
  return job;
};

export const updateJob = async (id, updates, { JobModel = Job } = {}) => {
  const job = await JobModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('postedBy', 'name');
  if (!job) throw new AppError('Job not found', 404);
  return job;
};

export const deleteJob = async (id, { JobModel = Job } = {}) => {
  const job = await JobModel.findById(id);
  if (!job) throw new AppError('Job not found', 404);
  await JobModel.findByIdAndDelete(id);
  return true;
};

export const getJobsByUser = async (user, { JobModel = Job } = {}) => {
  const jobs = await JobModel.find({ postedBy: user._id || user.id }).populate('postedBy', 'name').sort({ createdAt: -1 });
  return jobs;
};

export const closeJob = async (id, { JobModel = Job } = {}) => {
  const job = await JobModel.findByIdAndUpdate(id, { status: 'closed' }, { new: true });
  if (!job) throw new AppError('Job not found', 404);
  return job;
};

export default { createJob, queryJobs, getJobById, updateJob, deleteJob, getJobsByUser, closeJob };
