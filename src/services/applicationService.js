import Application from '../models/applicationModel.js';
import Job from '../models/jobModel.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const applyToJob = async ({ jobId, candidateId, coverLetter, resume }, { ApplicationModel = Application, JobModel = Job } = {}) => {
  const job = await JobModel.findById(jobId);
  if (!job) throw new AppError('Job not found', 404);
  if (job.status !== 'open') throw new AppError('This job is no longer accepting applications', 400);

  const existingApplication = await ApplicationModel.findOne({ job: jobId, candidate: candidateId });
  if (existingApplication) throw new AppError('You have already applied for this job', 400);

  const application = await ApplicationModel.create({ job: jobId, candidate: candidateId, coverLetter, resume, status: 'applied' });
  await JobModel.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

  const populated = await ApplicationModel.findById(application._id).populate('job', 'title department location').populate('candidate', 'name email');
  return populated;
};

export const queryApplications = async ({ queryParams }, { ApplicationModel = Application } = {}) => {
  const { status, jobId, page = 1, limit = 20 } = queryParams;
  const query = {};
  if (status) query.status = status;
  if (jobId) query.job = jobId;

  const applications = await ApplicationModel.find(query)
    .populate('candidate', 'name email profile')
    .populate('job', 'title department location')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await ApplicationModel.countDocuments(query);
  return { applications, total, page: parseInt(page), limit: parseInt(limit) };
};

export const getApplicationsByCandidate = async (candidateId, { ApplicationModel = Application } = {}) => {
  const applications = await ApplicationModel.find({ candidate: candidateId }).populate('job', 'title department location status').sort({ createdAt: -1 });
  return applications;
};

export const getApplicationById = async (id, { ApplicationModel = Application } = {}) => {
  const application = await ApplicationModel.findById(id)
    .populate('candidate', 'name email profile')
    .populate('job', 'title department location postedBy')
    .populate('notes.addedBy', 'name');

  if (!application) throw new AppError('Application not found', 404);
  return application;
};

export const updateApplicationStatus = async (id, status, { ApplicationModel = Application } = {}) => {
  const application = await ApplicationModel.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
    .populate('candidate', 'name email')
    .populate('job', 'title');

  if (!application) throw new AppError('Application not found', 404);
  return application;
};

export const addApplicationNote = async (id, text, addedBy, { ApplicationModel = Application } = {}) => {
  if (!text) throw new AppError('Note text is required', 400);
  const application = await ApplicationModel.findByIdAndUpdate(
    id,
    { $push: { notes: { text, addedBy } } },
    { new: true }
  ).populate('notes.addedBy', 'name');

  if (!application) throw new AppError('Application not found', 404);
  return application;
};

export const withdrawApplication = async (id, candidateId, { ApplicationModel = Application } = {}) => {
  const application = await ApplicationModel.findOne({ _id: id, candidate: candidateId });
  if (!application) throw new AppError('Application not found or access denied', 404);
  if (application.status === 'hired') throw new AppError('Cannot withdraw a hired application', 400);
  application.status = 'withdrawn';
  await application.save();
  return true;
};

export default { applyToJob, queryApplications, getApplicationsByCandidate, getApplicationById, updateApplicationStatus, addApplicationNote, withdrawApplication };
