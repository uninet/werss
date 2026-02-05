import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { Blogger, Content } from '../../../types';
import type { ICrawler, ICrawlerConfig } from '../types';

export abstract class BaseCrawler implements ICrawler {
  abstract readonly type: string;
  protected httpClient: AxiosInstance;

  constructor(protected config: ICrawlerConfig) {
    this.httpClient = axios.create({
      timeout: config.timeout,
      headers: {
        'User-Agent': config.userAgent,
      },
    });

    this.setupInterceptors();
  }

  abstract crawl(blogger: Blogger): Promise<Content[]>;

  isSupported(blogger: Blogger): boolean {
    return blogger.type === this.type;
  }

  protected async fetchWithRetry<T>(
    url: string,
    options?: AxiosRequestConfig,
    retries = this.config.retryAttempts
  ): Promise<T> {
    try {
      const response = await this.httpClient.get(url, options);
      return response.data;
    } catch (error) {
      if (retries > 0) {
        const delayMs = this.config.retryDelay * (this.config.retryAttempts - retries + 1);
        await this.delay(delayMs);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  protected async fetchWithMirror<T>(
    mirrors: string[],
    path: string,
    options?: AxiosRequestConfig
  ): Promise<{ data: T; usedMirror: string }> {
    for (const mirror of mirrors) {
      try {
        const url = `${mirror}${path}`;
        const data = await this.fetchWithRetry<T>(url, {
          ...options,
          timeout: this.config.timeout,
        });
        return { data, usedMirror: mirror };
      } catch (error) {
        console.log(`[${this.type}] Mirror failed: ${mirror}`);
        continue;
      }
    }
    throw new Error(`All mirrors failed for path: ${path}`);
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected createContent(
    bloggerId: number,
    title: string,
    content: string,
    url: string,
    publishedAt: string
  ): Content {
    return {
      id: 0,
      bloggerId: bloggerId,
      title,
      content,
      url,
      publishedAt: publishedAt,
      fetchedAt: new Date().toISOString(),
      isNotified: false,
    };
  }

  private setupInterceptors(): void {
    this.httpClient.interceptors.request.use(
      (config) => {
        console.log(`[${this.type}] Request: ${config.url}`);
        return config;
      },
      (error) => {
        console.error(`[${this.type}] Request Error:`, error.message);
        return Promise.reject(error);
      }
    );

    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(`[${this.type}] Response Error:`, error.message);
        return Promise.reject(error);
      }
    );
  }
}
