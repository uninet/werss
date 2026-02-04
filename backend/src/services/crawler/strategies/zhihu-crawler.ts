import * as cheerio from 'cheerio';
import { BaseCrawler } from './base-crawler';
import type { Blogger, Content } from '../../../types';
import type { ICrawlerConfig } from '../types';

interface RSSItem {
  title: string;
  link: string;
  description?: string;
  content?: string;
  pubDate: string;
}

export class ZhihuCrawler extends BaseCrawler {
  readonly type = 'zhihu';

  async crawl(blogger: Blogger): Promise<Content[]> {
    const zhihuId = blogger.url.trim();
    console.log(`[Zhihu Crawl] Starting crawl for ${blogger.name}, ID: ${zhihuId}`);

    const contents: Content[] = [];

    try {
      // 策略1: 使用 RSSHub
      const rsshubContents = await this.crawlFromRSSHub(zhihuId, blogger);
      if (rsshubContents.length > 0) {
        contents.push(...rsshubContents);
      }

      // 策略2: 直接抓取
      if (contents.length === 0) {
        const directContents = await this.crawlDirect(zhihuId, blogger);
        if (directContents.length > 0) {
          contents.push(...directContents);
        }
      }

      // 开发环境生成模拟数据
      if (contents.length === 0 && process.env.NODE_ENV === 'development') {
        console.log(`[Zhihu Crawl] Generating demo data for ${blogger.name}`);
        contents.push(...this.generateDemoContents(blogger));
      }
    } catch (error) {
      console.error(`[Zhihu Crawl] Error crawling ${blogger.name}:`, error);
    }

    console.log(`[Zhihu Crawl] Total contents found for ${blogger.name}: ${contents.length}`);
    return contents;
  }

  private async crawlFromRSSHub(zhihuId: string, blogger: Blogger): Promise<Content[]> {
    const mirrors = this.config.mirrors.rsshub || [];
    const contents: Content[] = [];

    for (const mirror of mirrors) {
      try {
        const feedUrl = `${mirror}/zhihu/people/activities/${zhihuId}`;
        console.log(`[Zhihu Crawl] Trying ${feedUrl}`);

        const xml = await this.fetchWithRetry<string>(feedUrl, {
          headers: {
            Accept: 'application/rss+xml, application/xml, text/xml',
          },
          timeout: 15000,
          maxRedirects: 5,
        });

        const items = this.parseRSS(xml);

        for (const item of items.slice(0, 10)) {
          contents.push(
            this.createContent(
              blogger.id,
              item.title,
              item.description || item.content || '',
              item.link,
              item.pubDate
            )
          );
        }

        console.log(`[Zhihu Crawl] ${mirror} found ${contents.length} items`);
        break;
      } catch (error: any) {
        console.log(`[Zhihu Crawl] ${mirror} failed: ${error.message}`);
      }
    }

    return contents;
  }

  private async crawlDirect(zhihuId: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];

    try {
      const profileUrl = `https://www.zhihu.com/people/${zhihuId}`;
      console.log(`[Zhihu Crawl] Trying direct fetch: ${profileUrl}`);

      const html = await this.fetchWithRetry<string>(profileUrl, {
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        timeout: 15000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(html);
      const activityItems = $('.ContentItem, .List-item');

      activityItems.slice(0, 10).each((_, elem) => {
        const titleElem = $(elem).find('.ContentItem-title, .ContentItem-title a');
        const title = titleElem.text().trim();
        const link = titleElem.attr('href') || '';
        const content = $(elem).find('.RichContent-inner, .ContentItem-content').text().trim().slice(0, 500);

        if (title) {
          contents.push(
            this.createContent(
              blogger.id,
              title,
              content || title,
              link.startsWith('http') ? link : `https://zhihu.com${link}`,
              new Date().toISOString()
            )
          );
        }
      });

      console.log(`[Zhihu Crawl] Direct fetch found ${contents.length} items`);
    } catch (error: any) {
      console.log(`[Zhihu Crawl] Direct fetch failed: ${error.message}`);
    }

    return contents;
  }

  private parseRSS(xml: string): RSSItem[] {
    const items: RSSItem[] = [];

    try {
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const titleRegex = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/;
      const linkRegex = /<link>(.*?)<\/link>/;
      const descRegex = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/;
      const contentRegex = /<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/;
      const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;

      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];

        const titleMatch = itemXml.match(titleRegex);
        const linkMatch = itemXml.match(linkRegex);
        const descMatch = itemXml.match(descRegex);
        const contentMatch = itemXml.match(contentRegex);
        const pubDateMatch = itemXml.match(pubDateRegex);

        if (titleMatch && linkMatch) {
          items.push({
            title: this.decodeXmlEntities(titleMatch[1].trim()),
            link: linkMatch[1].trim(),
            description: descMatch ? this.decodeXmlEntities(descMatch[1].trim()) : undefined,
            content: contentMatch ? this.decodeXmlEntities(contentMatch[1].trim()) : undefined,
            pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('[Zhihu Crawl] Error parsing RSS:', error);
    }

    return items;
  }

  private decodeXmlEntities(text: string): string {
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  }

  private generateDemoContents(blogger: Blogger): Content[] {
    const contents: Content[] = [];
    const titles = [
      '如何看待最新的 AI 技术发展趋势？',
      '有哪些值得推荐的编程学习资源？',
      '深度解析：大模型时代的机遇与挑战',
      '程序员如何保持技术敏感度？',
      '分享我的技术成长之路',
    ];

    const now = new Date();

    for (let i = 0; i < 5; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i * 3);

      contents.push(
        this.createContent(
          blogger.id,
          titles[i],
          `这是 ${blogger.name} 在知乎的回答/文章。\n\n内容涉及技术分享、行业观察和职业发展等话题。\n\n查看更多内容请访问知乎。`,
          `https://zhihu.com/question/demo-${blogger.id}-${i}`,
          date.toISOString()
        )
      );
    }

    return contents;
  }
}
