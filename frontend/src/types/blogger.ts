// Type definitions for Blogger entity
export interface Blogger {
  id: number;
  name: string;
  type: 'github' | 'wechat' | 'zhihu' | 'rss';
  url: string;
  avatar?: string;
  description?: string;
  is_active: boolean;
  last_checked_at?: string;
  fetch_status?: string;
  fetch_error?: string;
  fetch_fail_count: number;
  last_fetch_success_at?: string;
  created_at: string;
  updated_at: string;
}

export type BloggerType = 'github' | 'wechat' | 'zhihu' | 'rss';

export interface CreateBloggerInput {
  name: string;
  type: BloggerType;
  url: string;
  avatar?: string;
  description?: string;
}

export interface UpdateBloggerInput {
  name?: string;
  avatar?: string;
  description?: string;
}
