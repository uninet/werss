import { Router } from 'express';
import { schedulerController } from '../controllers/scheduler.controller';
import { asyncHandler } from '../utils/errors';

const router = Router();

router.get('/status', asyncHandler(schedulerController.getStatus));
router.post('/crawl', asyncHandler(schedulerController.crawl));
router.post('/send-email', asyncHandler(schedulerController.sendEmail));
router.post('/test-email', asyncHandler(schedulerController.testEmail));

export default router;
