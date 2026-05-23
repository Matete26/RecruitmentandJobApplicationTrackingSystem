import { Router } from 'express';
import offerController from '../controllers/offerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createOfferSchema, idParamSchema } from '../validators/schemas.js';

const router = Router();

// Recruiter / Admin Routes
router.post('/', protect, authorize('recruiter', 'hiring_manager', 'admin'), validate(createOfferSchema), offerController.createOffer);
router.get('/', protect, authorize('recruiter', 'hiring_manager', 'admin'), offerController.getOffers);
router.get('/:id', protect, authorize('recruiter', 'hiring_manager', 'admin'), validate(idParamSchema, { params: true }), offerController.getOffer);

router.put('/:id', protect, authorize('recruiter', 'hiring_manager', 'admin'), validate(idParamSchema, { params: true }), offerController.updateOffer);
router.patch('/:id/status', protect, authorize('recruiter', 'hiring_manager', 'admin'), validate(idParamSchema, { params: true }), offerController.updateOfferStatus);
router.delete('/:id', protect, authorize('recruiter', 'hiring_manager', 'admin'), validate(idParamSchema, { params: true }), offerController.withdrawOffer);

export default router;