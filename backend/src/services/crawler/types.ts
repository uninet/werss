import type { Blogger, Content } from '../../types';

export interface ICrawler {
  readonly type: string;
  crawl(blogger: Blogger): Promise<Content[]>;
  isSupported(blogger: Blogger): boolean;
}

export interface ICrawlerConfig {
  userAgent: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  mirrors: Record<string, string[]>;
  githubToken?: string;
}

export interface IContentRepository {
  saveContents(bloggerId: number, contents: Content[]): Promise<Content[]>;
  updateFetchStatus(
    bloggerId: number,
    status: 'success' | 'failed',
    error?: string
  ): Promise<void>;
  getActiveBloggers(): Promise<Blogger[]>;
  getAllBloggers(): Promise<Blogger[]>;
}

export interface CrawlResult {
  blogger: Blogger;
  contents: Content[];
  success: boolean;
  error?: string;
  duration: number;
}

export interface CrawlStats {
  total: number;
  success: number;
  failed: number;
  totalDuration: number;
}
