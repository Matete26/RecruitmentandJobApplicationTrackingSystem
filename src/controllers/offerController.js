import offerService from '../services/offerService.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Send a new job offer to a candidate
 */
export const createOffer = async (req, res, next) => {
  try {
    const { applicationId, salary, currency, startDate } = req.body;
    const offer = await offerService.createOffer({ applicationId, salary, currency, startDate });
    res.status(201).json({ success: true, message: 'Offer sent successfully', data: offer });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all offers (for recruiters/admins)
 */
export const getOffers = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offers = await offerService.queryOffers({ queryParams: req.query });
    res.json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single offer by ID
 */
export const getOffer = async (req, res, next) => {
  try {
    const offer = await offerService.getOfferById(req.params.id);
    res.json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

/**
 * Update offer (salary, start date, etc.)
 */
export const updateOffer = async (req, res, next) => {
  try {
    const updated = await offerService.updateOffer(req.params.id, req.body);
    res.json({ success: true, message: 'Offer updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Update offer status (Accept / Decline / Expired)
 */
export const updateOfferStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const offer = await offerService.updateOfferStatus(req.params.id, status);
    res.json({ success: true, message: `Offer ${status} successfully`, data: offer });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw / Delete offer
 */
export const withdrawOffer = async (req, res, next) => {
  try {
    await offerService.withdrawOffer(req.params.id);
    res.json({ success: true, message: 'Offer withdrawn successfully' });
  } catch (error) {
    next(error);
  }
};

export default {
  createOffer,
  getOffers,
  getOffer,
  updateOffer,
  updateOfferStatus,
  withdrawOffer
};