import { XMLParser } from 'fast-xml-parser';
import { BaseCrawler } from './base-crawler.js';
import type { Blogger, Content } from '../../../types/index.js';
import type { ICrawlerConfig } from '../types.js';

interface RSSItem {
  title?: string;
  link?: string;
  description?: string;
  'content:encoded'?: string;
  pubDate?: string;
}

interface RSSFeed {
  rss?: {
    channel?: {
      item?: RSSItem | RSSItem[];
    };
  };
}

export class WeChatCrawler extends BaseCrawler {
  readonly type = 'wechat';
  private xmlParser: XMLParser;

  constructor(config: ICrawlerConfig) {
    super(config);
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true,
    });
  }

  async crawl(blogger: Blogger): Promise<Content[]> {
    const wechatId = blogger.url.trim();
    console.log(`[WeChat Crawl] Starting crawl for ${blogger.name}, ID: ${wechatId}`);

    const extractedId = this.extractWeChatId(wechatId);
    if (!extractedId) {
      console.log(`[WeChat Crawl] Failed to extract WeChat ID from: ${wechatId}`);
      return [];
    }

    console.log(`[WeChat Crawl] Extracted ID: ${extractedId}`);

    // 策略1: 使用 wechat2rss
    const wechat2rssContents = await this.crawlFromWechat2RSS(extractedId, blogger);
    if (wechat2rssContents.length > 0) {
      console.log(`[WeChat Crawl] Wechat2RSS success with ${wechat2rssContents.length} items`);
      return wechat2rssContents;
    }

    // 策略2: 使用 RSSHub
    const rsshubContents = await this.crawlFromRSSHub(extractedId, blogger);
    if (rsshubContents.length > 0) {
      console.log(`[WeChat Crawl] RSSHub success with ${rsshubContents.length} items`);
      return rsshubContents;
    }

    console.log(`[WeChat Crawl] All strategies failed for ${blogger.name}`);
    return [];
  }

  private extractWeChatId(input: string): string | null {
    // 支持多种格式：
    // - 纯ID: MzI5NjY1MDY4MA==
    // - URL: https://mp.weixin.qq.com/s/xxx
    // - 带参数: __biz=MzI5NjY1MDY4MA==

    if (/^[A-Za-z0-9+/=]+$/.test(input)) {
      return input;
    }

    const bizMatch = input.match(/[?&]__biz=([A-Za-z0-9+/=]+)/);
    if (bizMatch) {
      return bizMatch[1];
    }

    const urlMatch = input.match(/mp\.weixin\.qq\.com.*[?&]__biz=([A-Za-z0-9+/=]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }

    return null;
  }

  private async crawlFromWechat2RSS(wechatId: string, blogger: Blogger): Promise<Content[]> {
    try {
      const mirrors = this.config.mirrors.wechat || ['https://wechat2rss.xlab.app'];
      const path = `/feed/${encodeURIComponent(wechatId)}`;

      const { data: xml } = await this.fetchWithMirror<string>(mirrors, path, {
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
      });

      return this.parseRSS(xml, blogger.id);
    } catch (error) {
      console.log(`[WeChat Crawl] Wechat2RSS failed: ${error}`);
      return [];
    }
  }

  private async crawlFromRSSHub(wechatId: string, blogger: Blogger): Promise<Content[]> {
    const mirrors = this.config.mirrors.rsshub || [];
    if (mirrors.length === 0) {
      return [];
    }

    const path = `/wechat/mp/${encodeURIComponent(wechatId)}`;

    try {
      const { data: xml } = await this.fetchWithMirror<string>(mirrors, path, {
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
      });

      return this.parseRSS(xml, blogger.id);
    } catch (error) {
      console.log(`[WeChat Crawl] RSSHub failed: ${error}`);
      return [];
    }
  }

  private parseRSS(xml: string, bloggerId: number): Content[] {
    try {
      const parsed = this.xmlParser.parse(xml) as RSSFeed;
      const channel = parsed.rss?.channel;

      if (!channel?.item) {
        return [];
      }

      const items = Array.isArray(channel.item) ? channel.item : [channel.item];
      const contents: Content[] = [];

      for (const item of items.slice(0, 10)) {
        if (item.title && item.link) {
          contents.push(
            this.createContent(
              bloggerId,
              this.cleanText(item.title),
              this.cleanText(item['content:encoded'] || item.description || ''),
              item.link,
              item.pubDate || new Date().toISOString()
            )
          );
        }
      }

      return contents;
    } catch (error) {
      console.error('[WeChat Crawl] Error parsing RSS:', error);
      return [];
    }
  }

  private cleanText(text: string | undefined): string {
    if (!text) return '';
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .trim();
  }
}
