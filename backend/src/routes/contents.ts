import { Router } from 'express';
import { contentController } from '../controllers/content.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateId, contentValidation } from '../middleware/validation.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

// 获取所有内容
router.get('/', asyncHandler(contentController.findAll));

// 获取内容统计
router.get('/stats', asyncHandler(contentController.getStats));

// 获取单个内容
router.get('/:id', validateId, asyncHandler(contentController.findById));

// 获取博主的内容
router.get('/blogger/:bloggerId', validateId, asyncHandler(contentController.findByBloggerId));

// 标记内容为已读
router.post('/:id/mark-read', authMiddleware, validateId, asyncHandler(contentController.markAsRead));

// 批量标记已读
router.post('/mark-read-batch', authMiddleware, contentValidation.markReadBatch, asyncHandler(contentController.markAsReadBatch));

// 删除内容
router.delete('/:id', authMiddleware, validateId, asyncHandler(contentController.delete));

export default router;
