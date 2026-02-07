import { Request, Response } from 'express';
import prisma from '../models/prisma.js';

export const statsController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const bloggers = await prisma.blogger.findMany();
      const bloggerStats = {
        total: bloggers.length,
        wechat_count: bloggers.filter(b => b.type === 'wechat').length,
        github_count: bloggers.filter(b => b.type === 'github').length,
        active_count: bloggers.filter(b => b.isActive).length
      };

      const contents = await prisma.content.findMany();
      const contentStats = {
        total: contents.length,
        unread_count: contents.filter(c => !c.isNotified).length,
        today_count: contents.filter(c => {
          const today = new Date();
          const fetched = new Date(c.fetchedAt);
          return fetched.getDate() === today.getDate() &&
                 fetched.getMonth() === today.getMonth() &&
                 fetched.getFullYear() === today.getFullYear();
        }).length
      };

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentContents = contents.filter(c => new Date(c.fetchedAt) >= sevenDaysAgo);

      const weeklyTrend: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const count = recentContents.filter(c =>
          new Date(c.fetchedAt).toISOString().split('T')[0] === dateStr
        ).length;
        weeklyTrend.push({ date: dateStr, count });
      }

      const emailLogs = await prisma.emailLog.findMany();
      const emailStats = {
        total_sent: emailLogs.length,
        success_count: emailLogs.filter(e => e.status === 'success').length,
        failed_count: emailLogs.filter(e => e.status === 'failed').length
      };

      const bloggerContentCounts = bloggers.map(b => ({
        id: b.id,
        name: b.name,
        type: b.type,
        content_count: contents.filter(c => c.bloggerId === b.id).length
      }));
      const topBloggers = bloggerContentCounts
        .sort((a, b) => b.content_count - a.content_count)
        .slice(0, 5);

      res.json({
        success: true,
        data: {
          bloggers: bloggerStats,
          contents: contentStats,
          weeklyTrend,
          emails: emailStats,
          topBloggers
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取统计数据失败'
      });
    }
  },

  getDailySummary: async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      const targetDate = (date as string) || new Date().toISOString().split('T')[0];

      const allContents = await prisma.content.findMany({
        include: {
          blogger: {
            select: {
              name: true,
              type: true
            }
          }
        }
      });

      const dailyContents = allContents.filter(c =>
        new Date(c.fetchedAt).toISOString().split('T')[0] === targetDate
      );

      const byTypeMap = new Map<string, number>();
      dailyContents.forEach(c => {
        const type = c.blogger.type;
        byTypeMap.set(type, (byTypeMap.get(type) || 0) + 1);
      });

      const byType = Array.from(byTypeMap.entries()).map(([type, count]) => ({
        type,
        count
      }));

      const mapContent = (c: any) => ({
        id: c.id,
        blogger_id: c.bloggerId,
        title: c.title,
        content: c.content,
        url: c.url,
        published_at: c.publishedAt,
        fetched_at: c.fetchedAt,
        is_notified: c.isNotified ? 1 : 0,
        blogger_name: c.blogger.name,
        blogger_type: c.blogger.type
      });

      res.json({
        success: true,
        data: {
          date: targetDate,
          total: dailyContents.length,
          byType,
          contents: dailyContents.map(mapContent)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取每日汇总失败'
      });
    }
  }
};
