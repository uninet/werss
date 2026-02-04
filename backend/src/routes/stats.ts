import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';
import { asyncHandler } from '../utils/errors';

const router = Router();

router.get('/', asyncHandler(statsController.getAll));
router.get('/daily-summary', asyncHandler(statsController.getDailySummary));

export default router;
