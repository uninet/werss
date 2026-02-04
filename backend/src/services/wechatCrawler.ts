import axios from 'axios';
import * as cheerio from 'cheerio';
import { XMLParser } from 'fast-xml-parser';
import type { Blogger, Content } from '../types';

/**
 * 微信公众号抓取服务
 * 整合多种抓取方案，提高成功率
 */
export class WeChatCrawlerService {
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  private xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
  });

  /**
   * 主抓取方法
   */
  async crawlWeChat(blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];
    const wechatId = blogger.url.trim();
    
    console.log(`[WeChat Crawl] Starting crawl for ${blogger.name}, ID: ${wechatId}`);
    
    // 提取微信公众号 ID（支持多种格式）
    const extractedId = this.extractWeChatId(wechatId);
    if (!extractedId) {
      console.log(`[WeChat Crawl] Failed to extract WeChat ID from: ${wechatId}`);
      return contents;
    }
    
    console.log(`[WeChat Crawl] Extracted ID: ${extractedId}`);
    
    // 策略1: 使用 wechat2rss.xlab.app（相对稳定）
    const wechat2rssContents = await this.crawlFromWechat2RSS(extractedId, blogger);
    if (wechat2rssContents.length > 0) {
      console.log(`[WeChat Crawl] Wechat2RSS success with ${wechat2rssContents.length} items`);
      contents.push(...wechat2rssContents);
      return contents;
    }
    
    // 策略2: 使用 RSSHub 镜像
    const rsshubContents = await this.crawlFromRSSHub(extractedId, blogger);
    if (rsshubContents.length > 0) {
      console.log(`[WeChat Crawl] RSSHub success with ${rsshubContents.length} items`);
      contents.push(...rsshubContents);
      return contents;
    }
    
    // 策略3: 使用 Newlearner RSS 服务
    const newlearnerContents = await this.crawlFromNewlearner(extractedId, blogger);
    if (newlearnerContents.length > 0) {
      console.log(`[WeChat Crawl] Newlearner success with ${newlearnerContents.length} items`);
      contents.push(...newlearnerContents);
      return contents;
    }
    
    // 策略4: 使用 WeWe-RSS 服务（基于微信读书）
    const weweContents = await this.crawlFromWeWeRSS(extractedId, blogger);
    if (weweContents.length > 0) {
      console.log(`[WeChat Crawl] WeWe-RSS success with ${weweContents.length} items`);
      contents.push(...weweContents);
      return contents;
    }
    
    // 策略5: 使用 ssr1.net RSS 服务
    const ssr1Contents = await this.crawlFromSSR1(extractedId, blogger);
    if (ssr1Contents.length > 0) {
      console.log(`[WeChat Crawl] SSR1 success with ${ssr1Contents.length} items`);
      contents.push(...ssr1Contents);
      return contents;
    }
    
    // 策略6: 使用第三方聚合服务
    const aggregatedContents = await this.crawlFromAggregatedServices(extractedId, blogger);
    if (aggregatedContents.length > 0) {
      console.log(`[WeChat Crawl] Aggregated services success with ${aggregatedContents.length} items`);
      contents.push(...aggregatedContents);
      return contents;
    }
    
    // 策略7: 使用搜狗微信搜索（作为最后手段）
    const sogouContents = await this.crawlFromSogou(extractedId, blogger);
    if (sogouContents.length > 0) {
      console.log(`[WeChat Crawl] Sogou success with ${sogouContents.length} items`);
      contents.push(...sogouContents);
      return contents;
    }
    
    console.log(`[WeChat Crawl] All strategies failed for ${blogger.name}`);
    return contents;
  }

  /**
   * 提取微信公众号 ID
   * 支持格式：
   * - 纯 ID: gh_xxx 或 MP_WXS_xxx
   * - 文章 URL: https://mp.weixin.qq.com/s/xxx
   * - 公众号主页: https://mp.weixin.qq.com/mp/profile_ext?...
   * - 完整 URL: https://mp.weixin.qq.com/mp/getmasssendmsg?...
   */
  private extractWeChatId(input: string): string | null {
    // 清理输入
    const cleanInput = input.trim();
    
    // 1. 如果是纯 ID（gh_ 开头或 MP_WXS_ 开头）
    if (/^(gh_|MP_WXS_)/.test(cleanInput)) {
      return cleanInput;
    }
    
    // 2. 从文章 URL 提取
    const articleMatch = cleanInput.match(/mp\.weixin\.qq\.com\/s\/([^?\s]+)/);
    if (articleMatch) {
      return cleanInput; // 返回完整 URL
    }
    
    // 3. 从公众号主页 URL 提取 __biz 参数
    const bizMatch = cleanInput.match(/__biz=([^&\s]+)/);
    if (bizMatch) {
      return bizMatch[1];
    }
    
    // 4. 尝试作为公众号名称搜索
    if (cleanInput.length > 0 && cleanInput.length < 50) {
      return cleanInput;
    }
    
    return null;
  }

  /**
   * 策略1: wechat2rss.xlab.app（推荐）
   * 提供稳定的微信公众号 RSS 服务
   */
  private async crawlFromWechat2RSS(wechatId: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];
    
    try {
      const feedUrl = `https://wechat2rss.xlab.app/feed/${encodeURIComponent(wechatId)}`;
      console.log(`[WeChat Crawl] Trying wechat2rss: ${feedUrl}`);
      
      const response = await axios.get(feedUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
        timeout: 20000,
        maxRedirects: 5,
      });
      
      const items = this.parseRSS(response.data);
      for (const item of items.slice(0, 15)) {
        contents.push(this.createContent(item, blogger));
      }
      
      console.log(`[WeChat Crawl] wechat2rss found ${contents.length} items`);
    } catch (error: any) {
      console.log(`[WeChat Crawl] wechat2rss failed: ${error.message}`);
    }
    
    return contents;
  }

  /**
   * 策略2: RSSHub 镜像
   */
  private async crawlFromRSSHub(wechatId: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];
    
    const mirrors = [
      'https://rsshub.rssforever.com',
      'https://rsshub.pseudoyu.com',
      'https://rsshub.fly.dev',
      'https://rsshub.anyant.xyz',
      'https://rsshub.ktachibana.party',
      'https://rsshub.liumingye.cn',
      'https://rsshub.app',
    ];
    
    for (const mirror of mirrors) {
      try {
        const feedUrl = `${mirror}/wechat/mp/${encodeURIComponent(wechatId)}`;
        console.log(`[WeChat Crawl] Trying RSSHub: ${feedUrl}`);
        
        const response = await axios.get(feedUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
          timeout: 15000,
          maxRedirects: 5,
        });
        
        const items = this.parseRSS(response.data);
        for (const item of items.slice(0, 15)) {
          contents.push(this.createContent(item, blogger));
        }
        
        if (contents.length > 0) {
          console.log(`[WeChat Crawl] RSSHub ${mirror} found ${contents.length} items`);
          break;
        }
      } catch (error: any) {
        console.log(`[WeChat Crawl] RSSHub ${mirror} failed: ${error.message}`);
      }
    }
    
    return contents;
  }

  /**
   * 策略3: Newlearner RSS 服务
   */
  private async crawlFromNewlearner(wechatId: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];
    
    try {
      // Newlearner 提供微信公众号 RSS
      const feedUrl = `https://rsshub.newlearner.top/wechat/mp/${encodeURIComponent(wechatId)}`;
      console.log(`[WeChat Crawl] Trying Newlearner: ${feedUrl}`);
      
      const response = await axios.get(feedUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
        timeout: 15000,
        maxRedirects: 5,
      });
      
      const items = this.parseRSS(response.data);
      for (const item of items.slice(0, 15)) {
        contents.push(this.createContent(item, blogger));
      }
    } catch (error: any) {
      console.log(`[WeChat Crawl] Newlearner failed: ${error.message}`);
    }
    
    return contents;
  }

  /**
   * 策略4: WeWe-RSS 服务（基于微信读书）
   * 需要用户自己部署或使用公共实例
   */
  private async crawlFromWeWeRSS(wechatId: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];
    
    // WeWe-RSS 公共实例列表
    const weweInstances = [
      'https://wewe-rss-deploy.vercel.app',
      'https://wewe-rss-nine.vercel.app',
      'https://wewe-rss-demo.vercel.app',
    ];
    
    for (const instance of weweInstances) {
      try {
        // 尝试获取 RSS feed
        const feedUrl = `${instance}/feed/${encodeURIComponent(wechatId)}`;
        console.log(`[WeChat Crawl] Trying WeWe-RSS: ${feedUrl}`);
        
        const response = await axios.get(feedUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
          },
          timeout: 15000,
          maxRedirects: 5,
        });
        
        const items = this.parseRSS(response.data);
        for (const item of items.slice(0, 15)) {
          contents.push(this.createContent(item, blogger));
        }
        
        if (contents.length > 0) break;
      } catch (error: any) {
        console.log(`[WeChat Crawl] WeWe-RSS ${instance} failed: ${error.message}`);
      }
    }
    
    return contents;
  }

  /**
   * 策略5: ssr1.net RSS 服务
   */
  private async crawlFromSSR1(wechatId: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];
    
    try {
      const feedUrl = `https://rsshub.ssr1.net/wechat/mp/${encodeURIComponent(wechatId)}`;
      console.log(`[WeChat Crawl] Trying ssr1.net: ${feedUrl}`);
      
      const response = await axios.get(feedUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
        timeout: 15000,
        maxRedirects: 5,
      });
      
      const items = this.parseRSS(response.data);
      for (const item of items.slice(0, 15)) {
        contents.push(this.createContent(item, blogger));
      }
    } catch (error: any) {
      console.log(`[WeChat Crawl] ssr1.net failed: ${error.message}`);
    }
    
    return contents;
  }

  /**
   * 策略6: 第三方聚合服务
   * 尝试多个小众 RSS 服务
   */
  private async crawlFromAggregatedServices(wechatId: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];
    
    // 其他可能的 RSS 服务
    const services = [
      { url: `https://rsshub.uneasy.win/wechat/mp/${encodeURIComponent(wechatId)}`, name: 'uneasy.win' },
      { url: `https://rsshub.mirror.xyz/wechat/mp/${encodeURIComponent(wechatId)}`, name: 'mirror.xyz' },
      { url: `https://wechat.ereee.cc/feed/${encodeURIComponent(wechatId)}`, name: 'ereee.cc' },
      { url: `https://rsshub.xiaobingkj.com/wechat/mp/${encodeURIComponent(wechatId)}`, name: 'xiaobingkj.com' },
    ];
    
    for (const service of services) {
      try {
        console.log(`[WeChat Crawl] Trying ${service.name}: ${service.url}`);
        
        const response = await axios.get(service.url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
          timeout: 10000,
          maxRedirects: 5,
        });
        
        const items = this.parseRSS(response.data);
        for (const item of items.slice(0, 15)) {
          contents.push(this.createContent(item, blogger));
        }
        
        if (contents.length > 0) break;
      } catch (error: any) {
        console.log(`[WeChat Crawl] ${service.name} failed: ${error.message}`);
      }
    }
    
    return contents;
  }

  /**
   * 策略7: 搜狗微信搜索
   * 通过搜狗搜索引擎抓取公众号文章
   */
  private async crawlFromSogou(wechatId: string, blogger: Blogger): Promise<Content[]> {
    const contents: Content[] = [];
    
    try {
      // 使用公众号名称搜索
      const searchUrl = `https://weixin.sogou.com/weixin?type=2&query=${encodeURIComponent(blogger.name)}&ie=utf8`;
      console.log(`[WeChat Crawl] Trying Sogou search: ${searchUrl}`);
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Referer': 'https://weixin.sogou.com/',
        },
        timeout: 15000,
        maxRedirects: 5,
      });
      
      const $ = cheerio.load(response.data);
      const articles = $('.news-list li');
      
      articles.slice(0, 10).each((_, elem) => {
        const titleElem = $(elem).find('h3 a');
        const title = titleElem.text().trim();
        const link = titleElem.attr('href') || '';
        const summary = $(elem).find('.txt-info').text().trim();
        const timeText = $(elem).find('.s2').text().trim();
        
        // 解析时间
        let publishedAt = new Date().toISOString();
        if (timeText.includes('天前')) {
          const days = parseInt(timeText.match(/(\d+)天前/)?.[1] || '0');
          const date = new Date();
          date.setDate(date.getDate() - days);
          publishedAt = date.toISOString();
        } else if (timeText.includes('小时前')) {
          const hours = parseInt(timeText.match(/(\d+)小时前/)?.[1] || '0');
          const date = new Date();
          date.setHours(date.getHours() - hours);
          publishedAt = date.toISOString();
        }
        
        if (title && link) {
          contents.push({
            id: 0,
            blogger_id: blogger.id,
            title: title,
            content: summary || title,
            url: link.startsWith('http') ? link : `https://weixin.sogou.com${link}`,
            published_at: publishedAt,
            fetched_at: new Date().toISOString(),
            is_notified: 0,
          });
        }
      });
      
      console.log(`[WeChat Crawl] Sogou found ${contents.length} items`);
    } catch (error: any) {
      console.log(`[WeChat Crawl] Sogou failed: ${error.message}`);
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
      console.error('[WeChat Crawl] RSS parse error:', error);
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
        blogger_id: blogger.id,
        title: item.title || '无标题',
        content: item.content || item.summary || item.description || '',
        url: item.link?.['@_href'] || item.id || '',
        published_at: item.updated || item.published || new Date().toISOString(),
        fetched_at: new Date().toISOString(),
        is_notified: 0,
      };
    }
    
    // 处理 RSS 2.0 格式
    return {
      id: 0,
      blogger_id: blogger.id,
      title: item.title || '无标题',
      content: item['content:encoded'] || item.description || item.content || '',
      url: item.link || item.guid || '',
      published_at: item.pubDate || item.pubdate || new Date().toISOString(),
      fetched_at: new Date().toISOString(),
      is_notified: 0,
    };
  }
}

export const wechatCrawlerService = new WeChatCrawlerService();
