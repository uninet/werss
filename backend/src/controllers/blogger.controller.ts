import { Request, Response } from 'express';
import { bloggerService } from '../services/blogger-service';
import { crawlerService } from '../services/crawler';

export const bloggerController = {
  // 获取所有博主
  findAll: async (req: Request, res: Response) => {
    const bloggers = await bloggerService.findAll();
    res.json({
      success: true,
      data: bloggers
    });
  },

  // 获取博主统计
  getStats: async (req: Request, res: Response) => {
    const stats = await bloggerService.getStats();
    res.json({
      success: true,
      data: stats
    });
  },

  // 获取单个博主
  findById: async (req: Request, res: Response) => {
    const id = (req as any).parsedId;
    const blogger = await bloggerService.findById(id);
    res.json({
      success: true,
      data: blogger
    });
  },

  // 创建博主
  create: async (req: Request, res: Response) => {
    const blogger = await bloggerService.create(req.body);
    res.status(201).json({
      success: true,
      message: '博主添加成功',
      data: blogger
    });
  },

  // 更新博主
  update: async (req: Request, res: Response) => {
    const id = (req as any).parsedId;
    const blogger = await bloggerService.update(id, req.body);
    res.json({
      success: true,
      message: '博主更新成功',
      data: blogger
    });
  },

  // 删除博主
  delete: async (req: Request, res: Response) => {
    const id = (req as any).parsedId;
    await bloggerService.delete(id);
    res.json({
      success: true,
      message: '博主删除成功'
    });
  },

  // 切换博主活跃状态
  toggleActive: async (req: Request, res: Response) => {
    const id = (req as any).parsedId;
    const blogger = await bloggerService.toggleActive(id);
    res.json({
      success: true,
      message: `博主已${blogger.is_active ? '启用' : '禁用'}`,
      data: blogger
    });
  },

  // 触发单个博主抓取
  crawlBlogger: async (req: Request, res: Response) => {
    const id = (req as any).parsedId;
    const result = await crawlerService.crawlBlogger(id);
    res.json({
      success: true,
      message: '抓取任务已启动',
      data: result
    });
  },

  // 触发所有博主抓取
  crawlAll: async (req: Request, res: Response) => {
    const result = await crawlerService.crawlAll();
    res.json({
      success: true,
      message: '全量抓取任务已启动',
      data: result
    });
  },

  // 检查活跃博主
  checkActive: async (req: Request, res: Response) => {
    const result = await crawlerService.checkActiveBloggers();
    res.json({
      success: true,
      message: '活跃检查完成',
      data: result
    });
  },

  // 清理不活跃博主
  cleanupInactive: async (req: Request, res: Response) => {
    const result = await crawlerService.cleanupInactiveBloggers();
    res.json({
      success: true,
      message: '清理任务完成',
      data: result
    });
  }
};
