import prisma from '../../models/prisma';
import type { Blogger, Content } from '../../types';
import type { IContentRepository } from '../crawler/types';

// Helper to map Prisma Content to App Content
const mapContent = (c: any): Content => ({
  id: c.id,
  blogger_id: c.bloggerId,
  title: c.title,
  content: c.content || undefined,
  url: c.url,
  published_at: c.publishedAt ? c.publishedAt.toISOString() : undefined,
  fetched_at: c.fetchedAt.toISOString(),
  is_notified: c.isNotified ? 1 : 0,
  // blogger: ... if needed
});

// Helper to map Prisma Blogger to App Blogger
const mapBlogger = (b: any): Blogger => ({
  id: b.id,
  name: b.name,
  type: b.type as any,
  url: b.url,
  avatar: b.avatar || undefined,
  description: b.description || undefined,
  is_active: b.isActive ? 1 : 0,
  last_checked_at: b.lastCheckedAt ? b.lastCheckedAt.toISOString() : undefined,
  fetch_status: b.fetchStatus as any,
  fetch_error: b.fetchError || undefined,
  fetch_fail_count: b.fetchFailCount,
  last_fetch_success_at: b.lastFetchSuccessAt ? b.lastFetchSuccessAt.toISOString() : undefined,
  created_at: b.createdAt.toISOString(),
  updated_at: b.updatedAt.toISOString(),
});

export class ContentRepository implements IContentRepository {
  async saveContents(bloggerId: number, contents: Content[]): Promise<Content[]> {
    const savedContents: Content[] = [];

    for (const content of contents) {
      try {
        const existing = await prisma.content.findFirst({
          where: {
            bloggerId: bloggerId,
            url: content.url,
          },
        });

        if (!existing) {
          const newContent = await prisma.content.create({
            data: {
              bloggerId: bloggerId,
              title: content.title,
              content: content.content,
              url: content.url,
              publishedAt: content.published_at ? new Date(content.published_at) : null,
              isNotified: false,
            },
          });
          savedContents.push(mapContent(newContent));
        }
      } catch (error) {
        console.error('[ContentRepository] Error saving content:', error);
      }
    }

    return savedContents;
  }

  async updateFetchStatus(
    bloggerId: number,
    status: 'success' | 'failed',
    error?: string
  ): Promise<void> {
    try {
      const data: any = {
        fetchStatus: status,
        lastCheckedAt: new Date(),
      };

      if (status === 'success') {
        data.fetchError = null;
        data.fetchFailCount = 0;
        data.lastFetchSuccessAt = new Date();
      } else {
        data.fetchError = error || null;
        data.fetchFailCount = { increment: 1 };
      }

      await prisma.blogger.update({
        where: { id: bloggerId },
        data: data,
      });
    } catch (dbError) {
      console.error('[ContentRepository] Error updating fetch status:', dbError);
    }
  }

  async getActiveBloggers(): Promise<Blogger[]> {
    try {
      const bloggers = await prisma.blogger.findMany({
        where: { isActive: true },
      });
      return bloggers.map(mapBlogger);
    } catch (error) {
      console.error('[ContentRepository] Error getting active bloggers:', error);
      return [];
    }
  }

  async getAllBloggers(): Promise<Blogger[]> {
    try {
      const bloggers = await prisma.blogger.findMany();
      return bloggers.map(mapBlogger);
    } catch (error) {
      console.error('[ContentRepository] Error getting all bloggers:', error);
      return [];
    }
  }
}
