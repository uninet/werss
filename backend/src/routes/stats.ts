import { Router } from 'express';
import { statsController } from '../controllers/stats.controller.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

router.get('/', asyncHandler(statsController.getAll));
router.get('/daily-summary', asyncHandler(statsController.getDailySummary));

export default router;
