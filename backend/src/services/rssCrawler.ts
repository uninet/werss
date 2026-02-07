import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import type { Blogger, Content } from '../types/index.js';

/**
 * RSS 抓取服务
 * 整合多种抓取策略，提高 RSS 源获取成功率
 */
export class RssCrawlerService {
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  private xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
  });

  /**
   * 主抓取方法
   */
  async crawlRSS(blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];
    const feedUrl = blogger.url.trim();

    console.log(`[RSS Crawl] Starting crawl for ${blogger.name}, URL: ${feedUrl}`);

    // 策略1: 直接抓取原始 RSS 源
    const directContents = await this.crawlDirect(feedUrl, blogger);
    if (directContents.length > 0) {
      console.log(`[RSS Crawl] Direct fetch success with ${directContents.length} items`);
      return directContents;
    }

    // 策略2: 通过 RSSHub 转换
    const rsshubContents = await this.crawlViaRSSHub(feedUrl, blogger);
    if (rsshubContents.length > 0) {
      console.log(`[RSS Crawl] RSSHub success with ${rsshubContents.length} items`);
      return rsshubContents;
    }

    // 策略3: 通过 rss2json 服务
    const rss2jsonContents = await this.crawlViaRss2Json(feedUrl, blogger);
    if (rss2jsonContents.length > 0) {
      console.log(`[RSS Crawl] RSS2JSON success with ${rss2jsonContents.length} items`);
      return rss2jsonContents;
    }

    // 策略4: 通过 FeedX 服务
    const feedxContents = await this.crawlViaFeedx(feedUrl, blogger);
    if (feedxContents.length > 0) {
      console.log(`[RSS Crawl] FeedX success with ${feedxContents.length} items`);
      return feedxContents;
    }

    // 策略5: 通过 allorigins 代理
    const alloriginsContents = await this.crawlViaAllOrigins(feedUrl, blogger);
    if (alloriginsContents.length > 0) {
      console.log(`[RSS Crawl] AllOrigins success with ${alloriginsContents.length} items`);
      return alloriginsContents;
    }

    // 策略6: 通过 rssbridge 服务
    const rssbridgeContents = await this.crawlViaRSSBridge(feedUrl, blogger);
    if (rssbridgeContents.length > 0) {
      console.log(`[RSS Crawl] RSSBridge success with ${rssbridgeContents.length} items`);
      return rssbridgeContents;
    }

    console.log(`[RSS Crawl] All strategies failed for ${blogger.name}`);
    return contents;
  }

  /**
   * 策略1: 直接抓取
   */
  private async crawlDirect(feedUrl: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];

    try {
      const response = await axios.get(feedUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, application/json, text/html',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        timeout: 20000,
        maxRedirects: 10,
        responseType: 'text',
      });

      const data = response.data;

      // 尝试解析 JSON Feed
      if (typeof data === 'object') {
        return this.parseJsonFeed(data, blogger);
      }

      // 解析 XML RSS
      if (typeof data === 'string' && (data.includes('<rss') || data.includes('<feed') || data.includes('<channel'))) {
        const items = this.parseRSS(data);
        for (const item of items.slice(0, 20)) {
          contents.push(this.createContent(item, blogger));
        }
      }

      console.log(`[RSS Crawl] Direct fetch found ${contents.length} items`);
    } catch (error: any) {
      console.log(`[RSS Crawl] Direct fetch failed: ${error.message}`);
    }

    return contents;
  }

  /**
   * 策略2: 通过 RSSHub 转换
   */
  private async crawlViaRSSHub(feedUrl: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];

    // RSSHub 路由转换服务 - 更新可用实例列表
    const rsshubInstances = [
      'https://rsshub.rssforever.com',
      'https://rsshub.pseudoyu.com',
      'https://rsshub.fly.dev',
      'https://rsshub.anyant.xyz',
      'https://rsshub.ktachibana.party',
      'https://rsshub.liumingye.cn',
      'https://rsshub.app',
    ];

    for (const instance of rsshubInstances) {
      try {
        // 尝试使用 RSSHub 的 rss 路由
        const apiUrl = `${instance}/rss/${encodeURIComponent(feedUrl)}`;
        console.log(`[RSS Crawl] Trying RSSHub: ${apiUrl}`);

        const response = await axios.get(apiUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
          timeout: 15000,
        });

        const items = this.parseRSS(response.data);
        for (const item of items.slice(0, 20)) {
          contents.push(this.createContent(item, blogger));
        }

        if (contents.length > 0) {
          console.log(`[RSS Crawl] RSSHub ${instance} found ${contents.length} items`);
          break;
        }
      } catch (error: any) {
        console.log(`[RSS Crawl] RSSHub ${instance} failed: ${error.message}`);
      }
    }

    return contents;
  }

  /**
   * 策略3: 通过 rss2json 服务
   */
  private async crawlViaRss2Json(feedUrl: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];

    const rss2jsonServices = [
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
      `https://rss2json.com/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
    ];

    for (const apiUrl of rss2jsonServices) {
      try {
        console.log(`[RSS Crawl] Trying RSS2JSON: ${apiUrl}`);

        const response = await axios.get(apiUrl, {
          headers: {
            'User-Agent': this.userAgent,
          },
          timeout: 15000,
        });

          const data = response.data;
          if (data.status === 'ok' && data.items) {
            for (const item of data.items.slice(0, 20)) {
              contents.push({
                id: 0,
                bloggerId: blogger.id,
                title: item.title || '无标题',
                content: item.content || item.description || '',
                url: item.link || item.url || '',
                publishedAt: item.pubDate || item.published || new Date(),
                fetchedAt: new Date(),
                isNotified: false,
              } as any);
            }
          }

        if (contents.length > 0) {
          console.log(`[RSS Crawl] RSS2JSON found ${contents.length} items`);
          break;
        }
      } catch (error: any) {
        console.log(`[RSS Crawl] RSS2JSON failed: ${error.message}`);
      }
    }

    return contents;
  }

  /**
   * 策略4: 通过 FeedX 服务
   */
  private async crawlViaFeedx(feedUrl: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];

    const feedxServices = [
      `https://feedx.net/rss/${encodeURIComponent(feedUrl)}`,
      `https://feedx.co/rss/${encodeURIComponent(feedUrl)}`,
    ];

    for (const apiUrl of feedxServices) {
      try {
        console.log(`[RSS Crawl] Trying FeedX: ${apiUrl}`);

        const response = await axios.get(apiUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
          timeout: 15000,
        });

        const items = this.parseRSS(response.data);
        for (const item of items.slice(0, 20)) {
          contents.push(this.createContent(item, blogger));
        }

        if (contents.length > 0) {
          console.log(`[RSS Crawl] FeedX found ${contents.length} items`);
          break;
        }
      } catch (error: any) {
        console.log(`[RSS Crawl] FeedX failed: ${error.message}`);
      }
    }

    return contents;
  }

  /**
   * 策略5: 通过 allorigins 代理
   */
  private async crawlViaAllOrigins(feedUrl: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];

    const proxyServices = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
    ];

    for (const proxyUrl of proxyServices) {
      try {
        console.log(`[RSS Crawl] Trying proxy: ${proxyUrl}`);

        const response = await axios.get(proxyUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/rss+xml, application/xml, text/xml, application/json',
          },
          timeout: 20000,
        });

        const data = response.data;

        // 尝试解析 JSON
        if (typeof data === 'object') {
          return this.parseJsonFeed(data, blogger);
        }

        // 解析 XML
        if (typeof data === 'string') {
          const items = this.parseRSS(data);
          for (const item of items.slice(0, 20)) {
            contents.push(this.createContent(item, blogger));
          }
        }

        if (contents.length > 0) {
          console.log(`[RSS Crawl] Proxy found ${contents.length} items`);
          break;
        }
      } catch (error: any) {
        console.log(`[RSS Crawl] Proxy failed: ${error.message}`);
      }
    }

    return contents;
  }

  /**
   * 策略6: 通过 RSSBridge 服务
   */
  private async crawlViaRSSBridge(feedUrl: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];

    const rssbridgeInstances = [
      'https://rssbridge.org/bridge01',
      'https://rss-bridge.org/bridge01',
    ];

    for (const instance of rssbridgeInstances) {
      try {
        const apiUrl = `${instance}/?action=display&bridge=FeedExpander&url=${encodeURIComponent(feedUrl)}&format=Atom`;
        console.log(`[RSS Crawl] Trying RSSBridge: ${apiUrl}`);

        const response = await axios.get(apiUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
          },
          timeout: 15000,
        });

        const items = this.parseRSS(response.data);
        for (const item of items.slice(0, 20)) {
          contents.push(this.createContent(item, blogger));
        }

        if (contents.length > 0) {
          console.log(`[RSS Crawl] RSSBridge found ${contents.length} items`);
          break;
        }
      } catch (error: any) {
        console.log(`[RSS Crawl] RSSBridge failed: ${error.message}`);
      }
    }

    return contents;
  }

  /**
   * 解析 JSON Feed
   */
  private parseJsonFeed(data: any, blogger: Blogger): Content[] {
    const contents: Content[] = [];

    try {
      // JSON Feed 1.0/1.1 格式
      if (data.items || data.articles) {
        const items = data.items || data.articles || [];
        for (const item of items.slice(0, 20)) {
          contents.push({
            id: 0,
            bloggerId: blogger.id,
            title: item.title || '无标题',
            content: item.content_html || item.content_text || item.content || item.description || '',
            url: item.url || item.link || item.id || '',
            publishedAt: item.date_published || item.published || item.date || new Date(),
            fetchedAt: new Date(),
            isNotified: false,
          } as any);
        }
      }
      // RSS2JSON 格式
      else if (data.status === 'ok' && Array.isArray(data.items)) {
        for (const item of data.items.slice(0, 20)) {
          contents.push({
            id: 0,
            bloggerId: blogger.id,
            title: item.title || '无标题',
            content: item.content || item.description || '',
            url: item.link || item.url || '',
            publishedAt: item.pubDate || item.published || new Date(),
            fetchedAt: new Date(),
            isNotified: false,
          });
        }
      }
    } catch (error) {
      console.error('[RSS Crawl] JSON parse error:', error);
    }

    return contents;
  }

  /**
   * 解析 RSS XML
   */
  private parseRSS(xml: string): any[] {
    try {
      const parsed = this.xmlParser.parse(xml);

      // RSS 2.0 格式
      if (parsed.rss?.channel?.item) {
        const items = parsed.rss.channel.item;
        return Array.isArray(items) ? items : [items];
      }

      // Atom 格式
      if (parsed.feed?.entry) {
        const entries = parsed.feed.entry;
        return Array.isArray(entries) ? entries : [entries];
      }

      return [];
    } catch (error) {
      console.error('[RSS Crawl] RSS parse error:', error);
      return [];
    }
  }

  /**
   * 创建内容对象
   */
  private createContent(item: any, blogger: Blogger): Content {
    // 处理 Atom 格式
    if (item['@_href']) {
      return {
        id: 0,
        bloggerId: blogger.id,
        title: item.title || '无标题',
        content: item.content || item.summary || item.description || '',
        url: item.link?.['@_href'] || item.id || '',
        publishedAt: item.updated || item.published || item.pubDate || new Date(),
        fetchedAt: new Date(),
        isNotified: false,
      } as any;
    }

    // 处理 RSS 2.0 格式
    return {
      id: 0,
      bloggerId: blogger.id,
      title: item.title || '无标题',
      content: item['content:encoded'] || item.description || item.content || '',
      url: item.link || item.guid || item['@_href'] || '',
      publishedAt: item.pubDate || item.pubdate || item.published || new Date(),
      fetchedAt: new Date(),
      isNotified: false,
    } as any;
  }
}

export const rssCrawlerService = new RssCrawlerService();
