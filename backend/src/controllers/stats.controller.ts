import { Request, Response } from 'express';
import prisma from '../models/prisma';

export const statsController = {
  // 获取统计数据
  getAll: async (req: Request, res: Response) => {
    try {
      // 博主统计
      const bloggerStatsResult = await prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(*)::int as total,
          SUM(CASE WHEN type = 'wechat' THEN 1 ELSE 0 END)::int as wechat_count,
          SUM(CASE WHEN type = 'github' THEN 1 ELSE 0 END)::int as github_count,
          SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END)::int as active_count
        FROM bloggers
      `;
      const bloggerStats = bloggerStatsResult[0];

      // 内容统计
      const contentStatsResult = await prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(*)::int as total,
          SUM(CASE WHEN is_notified = false THEN 1 ELSE 0 END)::int as unread_count,
          SUM(CASE WHEN DATE(fetched_at) = CURRENT_DATE THEN 1 ELSE 0 END)::int as today_count
        FROM contents
      `;
      const contentStats = contentStatsResult[0];

      // 最近7天内容趋势
      const weeklyTrend = await prisma.$queryRaw`
        SELECT 
          TO_CHAR(fetched_at, 'YYYY-MM-DD') as date,
          COUNT(*)::int as count
        FROM contents
        WHERE fetched_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY TO_CHAR(fetched_at, 'YYYY-MM-DD')
        ORDER BY date
      `;

      // 邮件发送统计
      const emailStatsResult = await prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(*)::int as total_sent,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)::int as success_count,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::int as failed_count
        FROM email_logs
      `;
      const emailStats = emailStatsResult[0];

      // 热门博主（内容最多的前5个）
      const topBloggers = await prisma.$queryRaw`
        SELECT 
          b.id,
          b.name,
          b.type,
          COUNT(c.id)::int as content_count
        FROM bloggers b
        LEFT JOIN contents c ON b.id = c.blogger_id
        GROUP BY b.id, b.name, b.type
        ORDER BY content_count DESC
        LIMIT 5
      `;

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

  // 获取每日汇总
  getDailySummary: async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      const targetDate = (date as string) || new Date().toISOString().split('T')[0];

      // 当日内容
      const dailyContents = await prisma.$queryRaw<any[]>`
        SELECT c.*, b.name as blogger_name, b.type as blogger_type
        FROM contents c
        JOIN bloggers b ON c.blogger_id = b.id
        WHERE DATE(c.fetched_at) = DATE(${targetDate}::date)
        ORDER BY c.published_at DESC
      `;

      // 按类型统计
      const byType = await prisma.$queryRaw`
        SELECT 
          b.type,
          COUNT(*)::int as count
        FROM contents c
        JOIN bloggers b ON c.blogger_id = b.id
        WHERE DATE(c.fetched_at) = DATE(${targetDate}::date)
        GROUP BY b.type
      `;

      // Helper to map content
      const mapContent = (c: any) => ({
        id: c.id,
        blogger_id: c.blogger_id,
        title: c.title,
        content: c.content,
        url: c.url,
        published_at: c.published_at,
        fetched_at: c.fetched_at,
        is_notified: c.is_notified ? 1 : 0,
        blogger_name: c.blogger_name,
        blogger_type: c.blogger_type
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
