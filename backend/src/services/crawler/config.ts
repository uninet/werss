import type { ICrawlerConfig } from './types.js';

export const defaultConfig: ICrawlerConfig = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  timeout: 15000,
  retryAttempts: 3,
  retryDelay: 1000,
  mirrors: {
    rsshub: [
      'https://rsshub.rssforever.com',
      'https://rsshub.pseudoyu.com',
      'https://rsshub.fly.dev',
      'https://rsshub.anyant.xyz',
      'https://rsshub.ktachibana.party',
      'https://rsshub.liumingye.cn',
      'https://rsshub.app',
    ],
    wechat: [
      'https://wechat2rss.xlab.app',
    ],
  },
  githubToken: process.env.GITHUB_TOKEN,
};

export function createConfig(overrides?: Partial<ICrawlerConfig>): ICrawlerConfig {
  return {
    ...defaultConfig,
    ...overrides,
  };
}
