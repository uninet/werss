import prisma from '../models/prisma';
import { AppError } from '../utils/errors';
import type { Content, CreateContentInput } from '../types';

const mapContent = (c: any): any => {
  if (c.bloggerId !== undefined) {
    return {
      id: c.id,
      blogger_id: c.bloggerId,
      title: c.title,
      content: c.content,
      url: c.url,
      published_at: c.publishedAt,
      fetched_at: c.fetchedAt,
      is_notified: c.isNotified ? 1 : 0,
    };
  }
  return {
    ...c,
    is_notified: c.is_notified === true ? 1 : (c.is_notified === false ? 0 : c.is_notified),
  };
};

export interface ContentFilter {
  bloggerId?: number;
  type?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  isNotified?: boolean;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export class ContentService {
  async findAll(filter: ContentFilter = {}, pagination: PaginationOptions = {}) {
    const { page = 1, pageSize = 20 } = pagination;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filter.bloggerId) {
      where.bloggerId = filter.bloggerId;
    }

    if (filter.type) {
      where.blogger = { type: filter.type };
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { content: { contains: filter.search, mode: 'insensitive' } }
      ];
    }

    if (filter.isNotified !== undefined) {
      where.isNotified = filter.isNotified;
    }

    if (filter.startDate || filter.endDate) {
      where.publishedAt = {};
      if (filter.startDate) where.publishedAt.gte = filter.startDate;
      if (filter.endDate) where.publishedAt.lte = filter.endDate;
    }

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        include: {
          blogger: {
            select: {
              id: true,
              name: true,
              type: true,
              avatar: true
            }
          }
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.content.count({ where })
    ]);

    return {
      items: contents.map(mapContent),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async findById(id: number) {
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        blogger: {
          select: {
            id: true,
            name: true,
            type: true,
            avatar: true
          }
        }
      }
    });

    if (!content) {
      throw new AppError('内容不存在', 404);
    }

    return mapContent(content);
  }

  async findByBloggerId(bloggerId: number) {
    const contents = await prisma.content.findMany({
      where: { bloggerId },
      orderBy: { publishedAt: 'desc' },
      include: {
        blogger: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    return contents.map(mapContent);
  }

  async create(data: CreateContentInput) {
    const content = await prisma.content.create({
      data: {
        bloggerId: data.bloggerId,
        title: data.title,
        content: data.content,
        url: data.url,
        publishedAt: data.publishedAt,
        isNotified: false
      }
    });

    return mapContent(content);
  }

  async markAsRead(id: number) {
    const content = await prisma.content.findUnique({ where: { id } });

    if (!content) {
      throw new AppError('内容不存在', 404);
    }

    const updated = await prisma.content.update({
      where: { id },
      data: { isNotified: true }
    });

    return mapContent(updated);
  }

  async markAsReadBatch(ids: number[]) {
    await prisma.content.updateMany({
      where: { id: { in: ids } },
      data: { isNotified: true }
    });

    return { updated: ids.length };
  }

  async delete(id: number) {
    const content = await prisma.content.findUnique({ where: { id } });

    if (!content) {
      throw new AppError('内容不存在', 404);
    }

    await prisma.content.delete({ where: { id } });
    return { id };
  }

  async getStats() {
    const [
      total,
      unread,
      today
    ] = await Promise.all([
      prisma.content.count(),
      prisma.content.count({ where: { isNotified: false } }),
      prisma.content.count({
        where: {
          fetchedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // 按博主统计内容数量
    const byBlogger = await prisma.content.groupBy({
      by: ['bloggerId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    // 获取博主信息
    const bloggerIds = byBlogger.map((b: { bloggerId: number }) => b.bloggerId);
    const bloggers = await prisma.blogger.findMany({
      where: { id: { in: bloggerIds } },
      select: { id: true, name: true, type: true }
    });

    const byType = byBlogger.map((item: { bloggerId: number; _count: { id: number } }) => {
      const blogger = bloggers.find((b: { id: number }) => b.id === item.bloggerId);
      return {
        bloggerId: item.bloggerId,
        bloggerName: blogger?.name || '未知',
        bloggerType: blogger?.type || 'unknown',
        count: item._count.id
      };
    });

    return {
      total,
      unread,
      today,
      byType
    };
  }

  async cleanupOldContent(days: number = 90) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await prisma.content.deleteMany({
      where: {
        publishedAt: { lt: cutoffDate },
        isNotified: true
      }
    });

    return { deleted: result.count };
  }
}

export const contentService = new ContentService();
