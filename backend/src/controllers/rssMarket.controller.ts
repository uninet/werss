import { Request, Response } from 'express';
import prisma from '../models/prisma.js';

// Helper to map Prisma result to API response
const mapRssFeed = (f: any): any => ({
  id: f.id,
  name: f.name,
  url: f.url,
  description: f.description,
  category: f.category,
  icon: f.icon,
  language: f.language,
  is_featured: f.isFeatured ? 1 : 0,
  subscriber_count: f.subscriberCount,
  created_at: f.createdAt,
});

export const rssMarketController = {
  // 获取 RSS 市场列表
  getAll: async (req: Request, res: Response) => {
    try {
      const { category, search, featured } = req.query;

      const where: any = {};

      // 按分类筛选
      if (category && category !== 'all') {
        where.category = category as string;
      }

      // 搜索
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      // 精选
      if (featured === '1') {
        where.isFeatured = true;
      }

      const feeds = await prisma.rssMarket.findMany({
        where,
        orderBy: [
          { isFeatured: 'desc' },
          { subscriberCount: 'desc' },
          { name: 'asc' }
        ]
      });

      // 获取分类列表
      const categories = await prisma.rssMarket.findMany({
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' }
      });

      res.json({
        success: true,
        data: feeds.map(mapRssFeed),
        categories: categories.map(c => c.category)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取 RSS 市场列表失败'
      });
    }
  },

  // 获取单个 RSS 源详情
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const feed = await prisma.rssMarket.findUnique({ where: { id } });

      if (!feed) {
        return res.status(404).json({
          success: false,
          message: 'RSS 源不存在'
        });
      }

      res.json({
        success: true,
        data: mapRssFeed(feed)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取 RSS 源详情失败'
      });
    }
  },

  // 订阅 RSS 源
  subscribe: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      // 获取 RSS 源信息
      const feed = await prisma.rssMarket.findUnique({ where: { id } });

      if (!feed) {
        return res.status(404).json({
          success: false,
          message: 'RSS 源不存在'
        });
      }

      // 检查是否已订阅
      const existing = await prisma.blogger.findFirst({
        where: {
          type: 'rss',
          url: feed.url
        }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: '该 RSS 源已订阅'
        });
      }

      // 添加到博主表
      const newBlogger = await prisma.blogger.create({
        data: {
          name: feed.name,
          type: 'rss',
          url: feed.url,
          description: feed.description,
          isActive: true
        }
      });

      // 更新订阅数
      await prisma.rssMarket.update({
        where: { id },
        data: { subscriberCount: { increment: 1 } }
      });

      res.json({
        success: true,
        message: '订阅成功',
        data: {
          id: newBlogger.id,
          name: feed.name,
          url: feed.url
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '订阅失败'
      });
    }
  },

  // 批量订阅
  subscribeBatch: async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供 RSS 源 ID 数组'
        });
      }

      const subscribed: Array<{ id: number; name: string; url: string }> = [];
      const skipped: number[] = [];

      for (const id of ids) {
        // 获取 RSS 源信息
        const feed = await prisma.rssMarket.findUnique({ where: { id: parseInt(id) } });

        if (!feed) {
          skipped.push(id);
          continue;
        }

        // 检查是否已订阅
        const existing = await prisma.blogger.findFirst({
          where: {
            type: 'rss',
            url: feed.url
          }
        });

        if (existing) {
          skipped.push(id);
          continue;
        }

        // 添加到博主表
        const newBlogger = await prisma.blogger.create({
          data: {
            name: feed.name,
            type: 'rss',
            url: feed.url,
            description: feed.description,
            isActive: true
          }
        });

        // 更新订阅数
        await prisma.rssMarket.update({
          where: { id: parseInt(id) },
          data: { subscriberCount: { increment: 1 } }
        });

        subscribed.push({
          id: newBlogger.id,
          name: feed.name,
          url: feed.url
        });
      }

      res.json({
        success: true,
        message: `成功订阅 ${subscribed.length} 个源，跳过 ${skipped.length} 个已订阅`,
        data: { subscribed, skipped }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '批量订阅失败'
      });
    }
  },

  // 检查订阅状态
  getSubscriptionStatus: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const feed = await prisma.rssMarket.findUnique({ where: { id } });

      if (!feed) {
        return res.status(404).json({
          success: false,
          message: 'RSS 源不存在'
        });
      }

      const existing = await prisma.blogger.findFirst({
        where: {
          type: 'rss',
          url: feed.url
        }
      });

      res.json({
        success: true,
        data: {
          isSubscribed: !!existing,
          bloggerId: existing ? existing.id : null
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '检查订阅状态失败'
      });
    }
  }
};
