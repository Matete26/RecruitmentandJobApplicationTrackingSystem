import Offer from '../models/offerModel.js';
import Application from '../models/applicationModel.js';
import Job from '../models/jobModel.js';

/**
 * Send a new job offer to a candidate
 */
export const createOffer = async (req, res) => {
  try {
    const { applicationId, salary, currency, startDate } = req.body;

    // Check if application exists
    const application = await Application.findById(applicationId)
      .populate('candidate')
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if offer already exists for this application
    const existingOffer = await Offer.findOne({ application: applicationId });
    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'An offer has already been sent for this application'
      });
    }

    const offer = await Offer.create({
      application: applicationId,
      candidate: application.candidate._id,
      job: application.job._id,
      salary,
      currency: currency || 'USD',
      startDate,
      status: 'pending'
    });

    // Optional: Update application status
    await Application.findByIdAndUpdate(applicationId, {
      status: 'offered'
    });

    res.status(201).json({
      success: true,
      message: 'Offer sent successfully',
      data: offer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending offer',
      error: error.message
    });
  }
};

/**
 * Get all offers (for recruiters/admins)
 */
export const getOffers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const offers = await Offer.find(query)
      .populate('candidate', 'name email profile')
      .populate('job', 'title department')
      .populate('application')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching offers',
      error: error.message
    });
  }
};

/**
 * Get single offer by ID
 */
export const getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('candidate', 'name email profile')
      .populate('job', 'title department location')
      .populate('application');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    res.json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching offer',
      error: error.message
    });
  }
};

/**
 * Update offer (salary, start date, etc.)
 */
export const updateOffer = async (req, res) => {
  try {
    const { salary, currency, startDate } = req.body;

    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { salary, currency, startDate },
      { new: true, runValidators: true }
    ).populate('candidate').populate('job');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    res.json({
      success: true,
      message: 'Offer updated successfully',
      data: offer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating offer',
      error: error.message
    });
  }
};

/**
 * Update offer status (Accept / Decline / Expired)
 */
export const updateOfferStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('candidate').populate('job');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // If offer is accepted, update application status to 'hired'
    if (status === 'accepted') {
      await Application.findByIdAndUpdate(offer.application, {
        status: 'hired'
      });

      // Optional: Close the job if you want
      // await Job.findByIdAndUpdate(offer.job, { status: 'filled' });
    }

    res.json({
      success: true,
      message: `Offer ${status} successfully`,
      data: offer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating offer status',
      error: error.message
    });
  }
};

/**
 * Withdraw / Delete offer
 */
export const withdrawOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    res.json({
      success: true,
      message: 'Offer withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error withdrawing offer',
      error: error.message
    });
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