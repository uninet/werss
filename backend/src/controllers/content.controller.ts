import { Request, Response } from 'express';
import { contentService } from '../services/content-service';

export const contentController = {
  // 获取所有内容
  findAll: async (req: Request, res: Response) => {
    const { bloggerId, type, search, page, pageSize } = req.query;
 
    const filter = {
      bloggerId: bloggerId ? parseInt(bloggerId as string) : undefined,
      type: type as string,
      search: search as string
    };

    const pagination = {
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 20
    };

    const result = await contentService.findAll(filter, pagination);
    res.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    });
  },

  // 获取内容统计
  getStats: async (req: Request, res: Response) => {
    const stats = await contentService.getStats();
    res.json({
      success: true,
      data: stats
    });
  },

  // 获取单个内容
  findById: async (req: Request, res: Response) => {
    const id = (req as any).parsedId;
    const content = await contentService.findById(id);
    res.json({
      success: true,
      data: content
    });
  },

  // 获取博主的内容
  findByBloggerId: async (req: Request, res: Response) => {
    const bloggerId = (req as any).parsedId;
    const contents = await contentService.findByBloggerId(bloggerId);
    res.json({
      success: true,
      data: contents
    });
  },

  // 标记内容为已读
  markAsRead: async (req: Request, res: Response) => {
    const id = (req as any).parsedId;
    const content = await contentService.markAsRead(id);
    res.json({
      success: true,
      message: '已标记为已读',
      data: content
    });
  },

  // 批量标记已读
  markAsReadBatch: async (req: Request, res: Response) => {
    const { ids } = req.body;
    const result = await contentService.markAsReadBatch(ids);
    res.json({
      success: true,
      message: `已标记 ${result.updated} 条内容为已读`,
      data: result
    });
  },

  // 删除内容
  delete: async (req: Request, res: Response) => {
    const id = (req as any).parsedId;
    await contentService.delete(id);
    res.json({
      success: true,
      message: '内容删除成功'
    });
  }
};
