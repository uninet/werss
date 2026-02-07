import { Router } from 'express';
import { bloggerController } from '../controllers/blogger.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateId, bloggerValidation } from '../middleware/validation.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

// 获取所有博主
router.get('/', asyncHandler(bloggerController.findAll));

// 获取博主统计
router.get('/stats/overview', asyncHandler(bloggerController.getStats));

// 获取单个博主
router.get('/:id', validateId, asyncHandler(bloggerController.findById));

// 创建博主 (公开接口，无需认证)
router.post('/', bloggerValidation.create, asyncHandler(bloggerController.create));

// 更新博主
router.put('/:id', authMiddleware, validateId, bloggerValidation.update, asyncHandler(bloggerController.update));

// 删除博主
router.delete('/:id', authMiddleware, validateId, asyncHandler(bloggerController.delete));

// 切换博主活跃状态
router.patch('/:id/toggle-active', authMiddleware, validateId, asyncHandler(bloggerController.toggleActive));

// 触发单个博主抓取
router.post('/:id/crawl', authMiddleware, validateId, asyncHandler(bloggerController.crawlBlogger));

// 触发所有博主抓取
router.post('/crawl-all', authMiddleware, asyncHandler(bloggerController.crawlAll));

// 检查活跃博主
router.post('/check-active', authMiddleware, asyncHandler(bloggerController.checkActive));

// 清理不活跃博主
router.post('/cleanup-inactive', authMiddleware, asyncHandler(bloggerController.cleanupInactive));

export default router;
