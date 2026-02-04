import prisma from '../models/prisma';
import { AppError } from '../utils/errors';
import type { Blogger, CreateBloggerInput, UpdateBloggerInput } from '../types';

// Helper to map Prisma result to API response
const mapBlogger = (b: any): any => {
  if (b.isActive !== undefined) {
    return {
      id: b.id,
      name: b.name,
      type: b.type,
      url: b.url,
      avatar: b.avatar,
      description: b.description,
      is_active: b.isActive ? 1 : 0,
      last_checked_at: b.lastCheckedAt,
      fetch_status: b.fetchStatus,
      fetch_error: b.fetchError,
      fetch_fail_count: b.fetchFailCount,
      last_fetch_success_at: b.lastFetchSuccessAt,
      created_at: b.createdAt,
      updated_at: b.updatedAt,
    };
  }
  return {
    ...b,
    is_active: b.is_active === true ? 1 : (b.is_active === false ? 0 : b.is_active),
  };
};

export class BloggerService {
  async findAll() {
    const bloggers = await prisma.$queryRaw`
      SELECT b.*, 
        (SELECT COUNT(*) FROM contents WHERE blogger_id = b.id) as total_contents,
        (SELECT COUNT(*) FROM contents WHERE blogger_id = b.id AND is_notified = false) as unread_count
      FROM bloggers b
      ORDER BY 
        CASE WHEN b.is_active = true THEN 0 ELSE 1 END,
        b.fetch_fail_count ASC,
        unread_count DESC,
        b.last_fetch_success_at DESC NULLS LAST,
        b.created_at DESC
    `;

    return (bloggers as any[]).map(b => ({
      ...mapBlogger(b),
      total_contents: Number(b.total_contents),
      unread_count: Number(b.unread_count)
    }));
  }

  async findById(id: number) {
    const blogger = await prisma.blogger.findUnique({
      where: { id },
      include: {
        _count: {
          select: { contents: true }
        }
      }
    });

    if (!blogger) {
      throw new AppError('博主不存在', 404);
    }

    return {
      ...mapBlogger(blogger),
      content_count: blogger._count.contents
    };
  }

  async create(data: CreateBloggerInput) {
    // Validate type
    const validTypes = ['wechat', 'github', 'rss', 'zhihu'];
    if (!validTypes.includes(data.type)) {
      throw new AppError(`无效的类型，必须是: ${validTypes.join(', ')}`, 400);
    }

    // Check for duplicate URL
    const existing = await prisma.blogger.findUnique({
      where: { url: data.url }
    });

    if (existing) {
      throw new AppError('该URL已被添加', 409);
    }

    const blogger = await prisma.blogger.create({
      data: {
        name: data.name,
        type: data.type,
        url: data.url,
        avatar: data.avatar,
        description: data.description,
        isActive: true,
        fetchStatus: 'pending'
      }
    });

    return mapBlogger(blogger);
  }

  async update(id: number, data: UpdateBloggerInput) {
    const existing = await prisma.blogger.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('博主不存在', 404);
    }

    // Check URL uniqueness if updating URL
    if (data.url && data.url !== existing.url) {
      const duplicate = await prisma.blogger.findUnique({
        where: { url: data.url }
      });

      if (duplicate) {
        throw new AppError('该URL已被使用', 409);
      }
    }

    const blogger = await prisma.blogger.update({
      where: { id },
      data: {
        name: data.name,
        url: data.url,
        avatar: data.avatar,
        description: data.description
      }
    });

    return mapBlogger(blogger);
  }

  async delete(id: number) {
    const existing = await prisma.blogger.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('博主不存在', 404);
    }

    await prisma.blogger.delete({ where: { id } });
    return { id };
  }

  async toggleActive(id: number) {
    const blogger = await prisma.blogger.findUnique({ where: { id } });

    if (!blogger) {
      throw new AppError('博主不存在', 404);
    }

    const updated = await prisma.blogger.update({
      where: { id },
      data: { isActive: !blogger.isActive }
    });

    return mapBlogger(updated);
  }

  async getStats() {
    const [
      total,
      active,
      byType,
      recent
    ] = await Promise.all([
      prisma.blogger.count(),
      prisma.blogger.count({ where: { isActive: true } }),
      prisma.blogger.groupBy({
        by: ['type'],
        _count: { id: true }
      }),
      prisma.blogger.findMany({
        where: { isActive: true },
        orderBy: { lastFetchSuccessAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          type: true,
          lastFetchSuccessAt: true
        }
      })
    ]);

    return {
      total,
      active,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      recent
    };
  }
}

export const bloggerService = new BloggerService();
