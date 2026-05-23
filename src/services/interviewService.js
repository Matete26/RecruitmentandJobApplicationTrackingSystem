import Interview from '../models/interviewModel.js';
import Application from '../models/applicationModel.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const scheduleInterview = async ({ applicationId, type, date, duration, location, interviewers, requesterId }, { InterviewModel = Interview, ApplicationModel = Application } = {}) => {
  const application = await ApplicationModel.findById(applicationId).populate('candidate', 'name email').populate('job', 'title');
  if (!application) throw new AppError('Application not found', 404);
  if (application.status !== 'shortlisted' && application.status !== 'interview') throw new AppError('Application must be shortlisted before scheduling interview', 400);

  const interview = await InterviewModel.create({
    application: applicationId,
    candidate: application.candidate._id,
    job: application.job._id,
    type,
    date,
    duration: duration || 60,
    location,
    interviewers: interviewers || [requesterId],
    status: 'scheduled'
  });

  await ApplicationModel.findByIdAndUpdate(applicationId, { status: 'interview' });

  const populatedInterview = await InterviewModel.findById(interview._id).populate('candidate', 'name email profile').populate('job', 'title department').populate('interviewers', 'name email');
  return populatedInterview;
};

export const queryInterviews = async ({ queryParams }, { InterviewModel = Interview } = {}) => {
  const { status, page = 1, limit = 20 } = queryParams;
  const query = {};
  if (status) query.status = status;

  const interviews = await InterviewModel.find(query)
    .populate('candidate', 'name email')
    .populate('job', 'title department')
    .populate('interviewers', 'name')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ date: 1 });

  return interviews;
};

export const getInterviewsByCandidate = async (candidateId, { InterviewModel = Interview } = {}) => {
  const interviews = await InterviewModel.find({ candidate: candidateId }).populate('job', 'title department location').populate('interviewers', 'name email').sort({ date: 1 });
  return interviews;
};

export const getInterviewById = async (id, { InterviewModel = Interview } = {}) => {
  const interview = await InterviewModel.findById(id).populate('candidate', 'name email profile').populate('job', 'title department').populate('interviewers', 'name email').populate('application');
  if (!interview) throw new AppError('Interview not found', 404);
  return interview;
};

export const updateInterview = async (id, updates, { InterviewModel = Interview } = {}) => {
  const interview = await InterviewModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('candidate').populate('job').populate('interviewers', 'name');
  if (!interview) throw new AppError('Interview not found', 404);
  return interview;
};

export const submitFeedback = async (id, { rating, comments, strengths, weaknesses, interviewerId }, { InterviewModel = Interview } = {}) => {
  const interview = await InterviewModel.findById(id);
  if (!interview) throw new AppError('Interview not found', 404);

  interview.feedback.push({ interviewer: interviewerId, rating, comments, strengths, weaknesses });
  interview.status = 'completed';
  await interview.save();

  const updated = await InterviewModel.findById(id).populate('feedback.interviewer', 'name');
  return updated;
};

export const cancelInterview = async (id, { InterviewModel = Interview } = {}) => {
  const interview = await InterviewModel.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
  if (!interview) throw new AppError('Interview not found', 404);
  return interview;
};

export const rescheduleInterview = async (id, { date, duration, location }, { InterviewModel = Interview } = {}) => {
  const interview = await InterviewModel.findByIdAndUpdate(id, { date, duration, location, status: 'scheduled' }, { new: true }).populate('candidate').populate('job');
  if (!interview) throw new AppError('Interview not found', 404);
  return interview;
};

export default { scheduleInterview, queryInterviews, getInterviewsByCandidate, getInterviewById, updateInterview, submitFeedback, cancelInterview, rescheduleInterview };
