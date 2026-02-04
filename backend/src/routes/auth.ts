import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { asyncHandler } from '../utils/errors';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/me', asyncHandler(authController.getMe));
router.post('/change-password', asyncHandler(authController.changePassword));

export default router;
