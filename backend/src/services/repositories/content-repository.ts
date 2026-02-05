import prisma from '../../models/prisma';
import type { Blogger, Content } from '../../types';
import type { IContentRepository } from '../crawler/types';

// Helper to map Prisma Content to App Content
const mapContent = (c: any): Content => ({
  id: c.id,
  bloggerId: c.bloggerId,
  title: c.title,
  content: c.content || undefined,
  url: c.url,
  publishedAt: c.publishedAt ? c.publishedAt : undefined,
  fetchedAt: c.fetchedAt,
  isNotified: c.isNotified,
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
  isActive: b.isActive,
  lastCheckedAt: b.lastCheckedAt,
  fetchStatus: b.fetchStatus as any,
  fetchError: b.fetchError || undefined,
  fetchFailCount: b.fetchFailCount,
  lastFetchSuccessAt: b.lastFetchSuccessAt,
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
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
              publishedAt: content.publishedAt ? new Date(content.publishedAt) : null,
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
