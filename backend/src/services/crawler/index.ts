// 导出类型
export type {
  ICrawler,
  ICrawlerConfig,
  IContentRepository,
  CrawlResult,
  CrawlStats,
} from './types';

// 导出配置
export { defaultConfig, createConfig } from './config';

// 导出协调器
export { CrawlerOrchestrator } from './crawler-orchestrator';

// 导出基础类
export { BaseCrawler } from './strategies/base-crawler';

// 导出具体策略
export { GitHubCrawler } from './strategies/github-crawler';
export { WeChatCrawler } from './strategies/wechat-crawler';
export { RSSCrawler } from './strategies/rss-crawler';
export { ZhihuCrawler } from './strategies/zhihu-crawler';

// 导出仓库
export { ContentRepository } from '../repositories/content-repository';
