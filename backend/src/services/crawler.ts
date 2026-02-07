import { CrawlerOrchestrator } from './crawler/crawler-orchestrator.js';
import { ContentRepository } from './repositories/content-repository.js';
import { GitHubCrawler } from './crawler/strategies/github-crawler.js';
import { WeChatCrawler } from './crawler/strategies/wechat-crawler.js';
import { RSSCrawler } from './crawler/strategies/rss-crawler.js';
import { ZhihuCrawler } from './crawler/strategies/zhihu-crawler.js';
import { createConfig } from './crawler/config.js';
import type { Blogger, Content } from '../types/index.js';
import type { CrawlResult } from './crawler/types.js';

/**
 * 爬虫服务
 * 基于新的策略模式架构，提供统一的抓取接口
 */
class CrawlerServiceFacade {
  private orchestrator: CrawlerOrchestrator;

  constructor() {
    const config = createConfig();
    const repository = new ContentRepository();

    this.orchestrator = new CrawlerOrchestrator(config, repository);

    // 注册所有抓取策略
    this.orchestrator.registerCrawlers([
      new GitHubCrawler(config),
      new WeChatCrawler(config),
      new RSSCrawler(config),
      new ZhihuCrawler(config),
    ]);
  }

  /**
   * 抓取单个博主的内容
   */
  async crawlBlogger(blogger: Blogger): Promise<Content[]> {
    const result = await this.orchestrator.crawlBlogger(blogger);
    return result.contents;
  }

  /**
   * 抓取所有活跃的博主
   */
  async crawlAllActiveBloggers(): Promise<{ blogger: Blogger; contents: Content[] }[]> {
    const repository = new ContentRepository();
    const bloggers = await repository.getActiveBloggers();

    const results = await this.orchestrator.crawlAll(bloggers);

    return results.map((result: CrawlResult) => ({
      blogger: result.blogger,
      contents: result.contents,
    }));
  }

  /**
   * 抓取所有博主（别名方法，兼容旧代码）
   */
  async crawlAll(): Promise<{ blogger: Blogger; contents: Content[] }[]> {
    return this.crawlAllActiveBloggers();
  }

  /**
   * 检查活跃博主状态
   * 返回活跃博主列表
   */
  async checkActiveBloggers(): Promise<{ id: number; name: string; isActive: boolean }[]> {
    const repository = new ContentRepository();
    const bloggers = await repository.getActiveBloggers();
    
    return bloggers.map(blogger => ({
      id: blogger.id,
      name: blogger.name,
      isActive: blogger.isActive === true
    }));
  }

  /**
   * 清理不活跃博主
   * 返回被清理的博主列表
   */
  async cleanupInactiveBloggers(): Promise<{ id: number; name: string }[]> {
    const repository = new ContentRepository();
    const allBloggers = await repository.getAllBloggers();
    const inactiveBloggers = allBloggers.filter(b => !b.isActive);
    
    // 这里可以实现实际的清理逻辑
    // 目前只是返回不活跃的博主列表
    return inactiveBloggers.map(blogger => ({
      id: blogger.id,
      name: blogger.name
    }));
  }
}

// 懒加载单例实例，避免在模块加载时初始化
let crawlerServiceInstance: CrawlerServiceFacade | null = null;

export function getCrawlerService(): CrawlerServiceFacade {
  if (!crawlerServiceInstance) {
    console.log('[CrawlerService] Initializing crawler service...');
    crawlerServiceInstance = new CrawlerServiceFacade();
  }
  return crawlerServiceInstance;
}

// 为了保持向后兼容，使用 getter 导出
export const crawlerService = {
  get instance() {
    return getCrawlerService();
  }
};

// 为了保持向后兼容，保留旧的导出方式
export { CrawlerServiceFacade as CrawlerService };
