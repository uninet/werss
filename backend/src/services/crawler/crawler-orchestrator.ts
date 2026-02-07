import type { Blogger, Content } from '../../types/index.js';
import type {
  ICrawler,
  ICrawlerConfig,
  IContentRepository,
  CrawlResult,
  CrawlStats,
} from './types.js';

export class CrawlerOrchestrator {
  private crawlers: Map<string, ICrawler> = new Map();

  constructor(
    private config: ICrawlerConfig,
    private repository: IContentRepository
  ) {}

  registerCrawler(crawler: ICrawler): void {
    this.crawlers.set(crawler.type, crawler);
    console.log(`[Orchestrator] Registered crawler: ${crawler.type}`);
  }

  registerCrawlers(crawlers: ICrawler[]): void {
    for (const crawler of crawlers) {
      this.registerCrawler(crawler);
    }
  }

  async crawlBlogger(blogger: Blogger): Promise<CrawlResult> {
    const startTime = Date.now();
    const crawler = this.crawlers.get(blogger.type);

    if (!crawler) {
      const error = `No crawler found for type: ${blogger.type}`;
      console.error(`[Orchestrator] ${error}`);

      await this.repository.updateFetchStatus(blogger.id, 'failed', error);

      return {
        blogger,
        contents: [],
        success: false,
        error,
        duration: Date.now() - startTime,
      };
    }

    console.log(`[Orchestrator] Starting crawl for ${blogger.name} (${blogger.type})`);

    try {
      const contents = await crawler.crawl(blogger);

      // 保存到数据库
      const savedContents =
        contents.length > 0
          ? await this.repository.saveContents(blogger.id, contents)
          : [];

      // 更新状态
      await this.repository.updateFetchStatus(blogger.id, 'success');

      console.log(
        `[Orchestrator] Completed crawl for ${blogger.name}: ${savedContents.length} contents saved`
      );

      return {
        blogger,
        contents: savedContents,
        success: true,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error(`[Orchestrator] Error crawling ${blogger.name}:`, errorMessage);

      await this.repository.updateFetchStatus(blogger.id, 'failed', errorMessage);

      return {
        blogger,
        contents: [],
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
      };
    }
  }

  async crawlAll(bloggers: Blogger[]): Promise<CrawlResult[]> {
    console.log(`[Orchestrator] Starting batch crawl for ${bloggers.length} bloggers`);

    const results: CrawlResult[] = [];

    for (const blogger of bloggers) {
      const result = await this.crawlBlogger(blogger);
      results.push(result);

      // 添加延迟避免请求过快
      if (this.config.retryDelay > 0) {
        await this.delay(this.config.retryDelay);
      }
    }

    const stats = this.calculateStats(results);
    console.log(
      `[Orchestrator] Batch crawl completed: ${stats.success}/${stats.total} success, ${stats.totalDuration}ms total`
    );

    return results;
  }

  async crawlActiveBloggers(): Promise<CrawlResult[]> {
    const bloggers = await this.repository.getActiveBloggers();

    if (bloggers.length === 0) {
      console.log('[Orchestrator] No active bloggers found');
      return [];
    }

    return this.crawlAll(bloggers);
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.crawlers.keys());
  }

  private calculateStats(results: CrawlResult[]): CrawlStats {
    return {
      total: results.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
