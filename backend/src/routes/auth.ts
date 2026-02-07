import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/me', asyncHandler(authController.getMe));
router.post('/change-password', asyncHandler(authController.changePassword));

export default router;
