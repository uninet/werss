import { type Blogger, type Content } from '@prisma/client';

export { type Blogger, type Content };

export interface CreateBloggerInput {
  name: string;
  type: string;
  url: string;
  avatar?: string;
  description?: string;
}

export interface UpdateBloggerInput {
  name?: string;
  type?: string;
  url?: string;
  avatar?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateContentInput {
  bloggerId: number;
  title: string;
  content?: string;
  url: string;
  publishedAt?: Date;
}

declare module 'express' {
  interface Request {
    user?: {
      id: number;
      username: string;
    };
  }
}

export type FlexibleBlogger = Omit<Blogger, 'isActive' | 'lastCheckedAt' | 'fetchStatus' | 'fetchError' | 'fetchFailCount' | 'lastFetchSuccessAt'> & {
  isActive?: boolean;
  is_active?: boolean;
  lastCheckedAt?: Date | null;
  last_checked_at?: Date | null;
  fetchStatus?: string | null;
  fetch_status?: string | null;
  fetchError?: string | null;
  fetch_error?: string | null;
  fetchFailCount?: number;
  fetch_fail_count?: number;
  lastFetchSuccessAt?: Date | null;
  last_fetch_success_at?: Date | null;
};

export type FlexibleContent = Omit<Content, 'bloggerId' | 'publishedAt' | 'fetchedAt' | 'isNotified'> & {
  bloggerId?: number;
  blogger_id?: number;
  publishedAt?: Date | null;
  published_at?: Date | string | null;
  fetchedAt?: Date;
  fetched_at?: Date | string;
  isNotified?: boolean;
  is_notified?: boolean | number;
};
