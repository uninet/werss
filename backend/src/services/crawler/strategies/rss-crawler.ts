import { XMLParser } from 'fast-xml-parser';
import { BaseCrawler } from './base-crawler';
import type { Blogger, Content } from '../../../types';
import type { ICrawlerConfig } from '../types';

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

export class RSSCrawler extends BaseCrawler {
  readonly type = 'rss';
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
    const feedUrl = blogger.url.trim();
    console.log(`[RSS Crawl] Starting crawl for ${blogger.name}, URL: ${feedUrl}`);

    // 策略1: 直接抓取
    const directContents = await this.crawlDirect(feedUrl, blogger);
    if (directContents.length > 0) {
      console.log(`[RSS Crawl] Direct fetch success with ${directContents.length} items`);
      return directContents;
    }

    // 策略2: 通过 RSSHub
    const rsshubContents = await this.crawlViaRSSHub(feedUrl, blogger);
    if (rsshubContents.length > 0) {
      console.log(`[RSS Crawl] RSSHub success with ${rsshubContents.length} items`);
      return rsshubContents;
    }

    console.log(`[RSS Crawl] All strategies failed for ${blogger.name}`);
    return [];
  }

  private async crawlDirect(feedUrl: string, blogger: Blogger): Promise<Content[]> {
    try {
      const xml = await this.fetchWithRetry<string>(feedUrl, {
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        maxRedirects: 5,
      });

      return this.parseRSS(xml, blogger.id);
    } catch (error) {
      console.log(`[RSS Crawl] Direct fetch failed: ${error}`);
      return [];
    }
  }

  private async crawlViaRSSHub(feedUrl: string, blogger: Blogger): Promise<Content[]> {
    const mirrors = this.config.mirrors.rsshub || [];
    if (mirrors.length === 0) {
      return [];
    }

    const path = `/rsshub/transform/xml/${encodeURIComponent(feedUrl)}`;

    try {
      const { data: xml } = await this.fetchWithMirror<string>(mirrors, path, {
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
      });

      return this.parseRSS(xml, blogger.id);
    } catch (error) {
      console.log(`[RSS Crawl] RSSHub failed: ${error}`);
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

      for (const item of items.slice(0, 20)) {
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
      console.error('[RSS Crawl] Error parsing RSS:', error);
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
