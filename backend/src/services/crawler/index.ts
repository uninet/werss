// 导出类型
export type {
  ICrawler,
  ICrawlerConfig,
  IContentRepository,
  CrawlResult,
  CrawlStats,
} from './types.js';

// 导出配置
export { defaultConfig, createConfig } from './config.js';

// 导出协调器
export { CrawlerOrchestrator } from './crawler-orchestrator.js';

// 导出基础类
export { BaseCrawler } from './strategies/base-crawler.js';

// 导出具体策略
export { GitHubCrawler } from './strategies/github-crawler.js';
export { WeChatCrawler } from './strategies/wechat-crawler.js';
export { RSSCrawler } from './strategies/rss-crawler.js';
export { ZhihuCrawler } from './strategies/zhihu-crawler.js';

// 导出仓库
export { ContentRepository } from '../repositories/content-repository.js';
