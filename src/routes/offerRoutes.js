import { Router } from 'express';
import offerController from '../controllers/offerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// Recruiter / Admin Routes
router.post('/', protect, authorize('recruiter', 'hiring_manager', 'admin'), offerController.createOffer);
router.get('/', protect, authorize('recruiter', 'hiring_manager', 'admin'), offerController.getOffers);
router.get('/:id', protect, authorize('recruiter', 'hiring_manager', 'admin'), offerController.getOffer);

router.put('/:id', protect, authorize('recruiter', 'hiring_manager', 'admin'), offerController.updateOffer);
router.patch('/:id/status', protect, authorize('recruiter', 'hiring_manager', 'admin'), offerController.updateOfferStatus);
router.delete('/:id', protect, authorize('recruiter', 'hiring_manager', 'admin'), offerController.withdrawOffer);

export default router;