import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * 文章全文抓取服务
 * 用于从原始链接抓取完整文章内容
 */
export class ArticleFetcherService {
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  /**
   * 抓取文章全文
   */
  async fetchFullContent(url: string, type: string): Promise<string> {
    try {
      console.log(`[ArticleFetcher] Fetching full content from: ${url}`);

      // 根据类型选择不同的抓取策略
      switch (type) {
        case 'wechat':
          return await this.fetchWeChatArticle(url);
        case 'zhihu':
          return await this.fetchZhihuArticle(url);
        case 'rss':
          return await this.fetchGenericArticle(url);
        case 'github':
          return await this.fetchGitHubContent(url);
        default:
          return await this.fetchGenericArticle(url);
      }
    } catch (error: any) {
      console.error(`[ArticleFetcher] Error fetching content: ${error.message}`);
      return '';
    }
  }

  /**
   * 抓取微信公众号文章
   */
  private async fetchWeChatArticle(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        timeout: 20000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      // 尝试多种可能的内容选择器
      const contentSelectors = [
        '#js_content',           // 新版公众号
        '#img-content',          // 旧版公众号
        '.rich_media_content',   // 通用
        '#content',              // 备选
        'article',               // HTML5 article
        '.post-content',         // 通用博客
        '.entry-content',        // WordPress
        '.article-content',      // 通用
      ];

      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          // 清理内容
          element.find('script, style, iframe, .js_ad_area').remove();

          // 处理图片
          element.find('img').each((_, img) => {
            const $img = $(img);
            const dataSrc = $img.attr('data-src');
            if (dataSrc) {
              $img.attr('src', dataSrc);
            }
          });

          const content = element.html() || '';
          if (content.trim().length > 100) {
            console.log(`[ArticleFetcher] WeChat content found with selector: ${selector}`);
            return this.cleanContent(content);
          }
        }
      }

      // 如果没找到，返回整个 body
      const bodyContent = $('body').html() || '';
      return this.cleanContent(bodyContent);
    } catch (error: any) {
      console.error(`[ArticleFetcher] WeChat fetch error: ${error.message}`);
      return '';
    }
  }

  /**
   * 抓取知乎文章
   */
  private async fetchZhihuArticle(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 20000,
      });

      const $ = cheerio.load(response.data);

      // 知乎内容选择器
      const selectors = [
        '.RichContent-inner',     // 知乎回答/文章
        '.Post-RichTextContainer', // 知乎文章
        '.ContentItem-richText',   // 知乎内容
        '.AnswerCard-mainContent',
        'article',
      ];

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          element.find('script, style').remove();
          const content = element.html() || '';
          if (content.trim().length > 100) {
            console.log(`[ArticleFetcher] Zhihu content found with selector: ${selector}`);
            return this.cleanContent(content);
          }
        }
      }

      return '';
    } catch (error: any) {
      console.error(`[ArticleFetcher] Zhihu fetch error: ${error.message}`);
      return '';
    }
  }

  /**
   * 抓取通用网站文章
   */
  private async fetchGenericArticle(url: string): Promise<string> {
    try {
      // 根据 URL 判断是否是特定网站，使用专门的抓取策略
      if (url.includes('huxiu.com')) {
        return await this.fetchHuxiuArticle(url);
      }
      if (url.includes('bohaishibei.com') || url.includes('bhsb.net')) {
        return await this.fetchBohaishibeiArticle(url);
      }

      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Referer': new URL(url).origin,
        },
        timeout: 20000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      // 尝试 readability 风格的选择器
      const selectors = [
        'article',
        '[role="main"]',
        'main',
        '.post-content',
        '.entry-content',
        '.article-content',
        '.content',
        '#content',
        '.post',
        '.article',
        // 中文网站常见选择器
        '.article-detail',
        '.article-body',
        '.article-main',
        '.post-body',
        '.entry',
        '.detail-content',
        '.news-content',
        '.text-content',
      ];

      // 计算每个选择器的内容长度，选择最长的
      let bestContent = '';
      let maxLength = 0;

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          element.find('script, style, nav, header, footer, aside, .sidebar, .ads, .comments').remove();
          const content = element.html() || '';
          const textLength = element.text().trim().length;

          if (textLength > maxLength && textLength > 200) {
            maxLength = textLength;
            bestContent = content;
            console.log(`[ArticleFetcher] Generic content found with selector: ${selector}, length: ${textLength}`);
          }
        }
      }

      if (bestContent) {
        return this.cleanContent(bestContent);
      }

      // 如果都没找到，尝试 body
      const body = $('body');
      body.find('script, style, nav, header, footer, aside, .sidebar, .ads, .comments').remove();
      return this.cleanContent(body.html() || '');
    } catch (error: any) {
      console.error(`[ArticleFetcher] Generic fetch error: ${error.message}`);
      return '';
    }
  }

  /**
   * 抓取虎嗅网文章
   */
  private async fetchHuxiuArticle(url: string): Promise<string> {
    try {
      console.log(`[ArticleFetcher] Fetching Huxiu article: ${url}`);

      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Referer': 'https://www.huxiu.com/',
        },
        timeout: 20000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      // 虎嗅网内容选择器
      const selectors = [
        '.article-content',
        '.article-detail-content',
        '.article-detail',
        '.article-body',
        '.content-wrapper',
        'article',
        '[class*="article-content"]',
        '[class*="article-body"]',
      ];

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          // 清理不需要的元素
          element.find('script, style, .ads, .share-box, .author-info, .related-articles, .comments, .app-download, .qr-code').remove();

          // 处理图片
          element.find('img').each((_, img) => {
            const $img = $(img);
            const dataSrc = $img.attr('data-src') || $img.attr('data-original');
            const src = $img.attr('src');
            if (dataSrc && !src?.startsWith('http')) {
              $img.attr('src', dataSrc);
            }
          });

          const content = element.html() || '';
          const textLength = element.text().trim().length;

          if (textLength > 200) {
            console.log(`[ArticleFetcher] Huxiu content found with selector: ${selector}, length: ${textLength}`);
            return this.cleanContent(content);
          }
        }
      }

      // 如果没找到，尝试通用方法
      return await this.fetchGenericArticle(url);
    } catch (error: any) {
      console.error(`[ArticleFetcher] Huxiu fetch error: ${error.message}`);
      return '';
    }
  }

  /**
   * 抓取博海拾贝文章
   */
  private async fetchBohaishibeiArticle(url: string): Promise<string> {
    try {
      console.log(`[ArticleFetcher] Fetching Bohaishibei article: ${url}`);

      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Referer': 'http://www.bohaishibei.com/',
        },
        timeout: 20000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      // 博海拾贝内容选择器
      const selectors = [
        '.post-content',
        '.entry-content',
        '.article-content',
        '.content',
        '#content',
        '.post',
        'article',
        '.main-content',
        '.post-body',
      ];

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          // 清理不需要的元素
          element.find('script, style, .ads, .share, .related-posts, .comments, .post-meta, .entry-meta').remove();

          // 处理图片
          element.find('img').each((_, img) => {
            const $img = $(img);
            const dataSrc = $img.attr('data-src') || $img.attr('data-original');
            const src = $img.attr('src');
            if (dataSrc && !src?.startsWith('http')) {
              $img.attr('src', dataSrc);
            }
          });

          const content = element.html() || '';
          const textLength = element.text().trim().length;

          if (textLength > 200) {
            console.log(`[ArticleFetcher] Bohaishibei content found with selector: ${selector}, length: ${textLength}`);
            return this.cleanContent(content);
          }
        }
      }

      // 如果没找到，尝试通用方法
      return await this.fetchGenericArticle(url);
    } catch (error: any) {
      console.error(`[ArticleFetcher] Bohaishibei fetch error: ${error.message}`);
      return '';
    }
  }

  /**
   * 抓取 GitHub 内容
   */
  private async fetchGitHubContent(url: string): Promise<string> {
    // GitHub 内容已经在爬虫中获取，这里直接返回空
    // 如果需要更详细的 GitHub 内容，可以在这里扩展
    return '';
  }

  /**
   * 清理内容
   */
  private cleanContent(content: string): string {
    if (!content) return '';

    return content
      // 移除空标签
      .replace(/<[^/>][^>]*>\s*<\/[^>]+>/g, '')
      // 移除事件处理器
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/on\w+='[^']*'/g, '')
      // 移除 javascript: 链接
      .replace(/javascript:/gi, '')
      // 清理样式
      .replace(/style="[^"]*"/g, '')
      // 移除 data-* 属性（保留图片的 data-src）
      .replace(/data-(?!src)[^=]*="[^"]*"/g, '')
      // 清理多余空白
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }
}

export const articleFetcher = new ArticleFetcherService();
