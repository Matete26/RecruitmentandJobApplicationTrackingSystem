import Offer from '../models/offerModel.js';
import Application from '../models/applicationModel.js';
import Job from '../models/jobModel.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const createOffer = async ({ applicationId, salary, currency, startDate }, { OfferModel = Offer, ApplicationModel = Application } = {}) => {
  const application = await ApplicationModel.findById(applicationId).populate('candidate').populate('job');
  if (!application) throw new AppError('Application not found', 404);

  const existing = await OfferModel.findOne({ application: applicationId });
  if (existing) throw new AppError('An offer has already been sent for this application', 400);

  const offer = await OfferModel.create({ application: applicationId, candidate: application.candidate._id, job: application.job._id, salary, currency: currency || 'USD', startDate, status: 'pending' });
  await ApplicationModel.findByIdAndUpdate(applicationId, { status: 'offered' });
  return offer;
};

export const queryOffers = async ({ queryParams }, { OfferModel = Offer } = {}) => {
  const { status, page = 1, limit = 20 } = queryParams;
  const query = {};
  if (status) query.status = status;

  const offers = await OfferModel.find(query).populate('candidate', 'name email profile').populate('job', 'title department').populate('application').skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 });
  return offers;
};

export const getOfferById = async (id, { OfferModel = Offer } = {}) => {
  const offer = await OfferModel.findById(id).populate('candidate', 'name email profile').populate('job', 'title department location').populate('application');
  if (!offer) throw new AppError('Offer not found', 404);
  return offer;
};

export const updateOffer = async (id, updates, { OfferModel = Offer } = {}) => {
  const { salary, currency, startDate } = updates;
  const offer = await OfferModel.findByIdAndUpdate(id, { salary, currency, startDate }, { new: true, runValidators: true }).populate('candidate').populate('job');
  if (!offer) throw new AppError('Offer not found', 404);
  return offer;
};

export const updateOfferStatus = async (id, status, { OfferModel = Offer, ApplicationModel = Application } = {}) => {
  const offer = await OfferModel.findByIdAndUpdate(id, { status }, { new: true }).populate('candidate').populate('job');
  if (!offer) throw new AppError('Offer not found', 404);
  if (status === 'accepted') {
    await ApplicationModel.findByIdAndUpdate(offer.application, { status: 'hired' });
  }
  return offer;
};

export const withdrawOffer = async (id, { OfferModel = Offer } = {}) => {
  const offer = await OfferModel.findByIdAndDelete(id);
  if (!offer) throw new AppError('Offer not found', 404);
  return true;
};

export default { createOffer, queryOffers, getOfferById, updateOffer, updateOfferStatus, withdrawOffer };
