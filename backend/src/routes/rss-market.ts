import { Router } from 'express';
import { rssMarketController } from '../controllers/rssMarket.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';

const router = Router();

router.get('/', asyncHandler(rssMarketController.getAll));
router.get('/:id', asyncHandler(rssMarketController.getById));
router.post('/:id/subscribe', authMiddleware, asyncHandler(rssMarketController.subscribe));
router.post('/subscribe-batch', authMiddleware, asyncHandler(rssMarketController.subscribeBatch));
router.get('/:id/subscription-status', asyncHandler(rssMarketController.getSubscriptionStatus));

export default router;
