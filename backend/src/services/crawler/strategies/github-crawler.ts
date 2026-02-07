import { BaseCrawler } from './base-crawler.js';
import type { Blogger, Content } from '../../../types/index.js';

interface GitHubRepo {
  name: string;
  full_name: string;
}

interface GitHubCommit {
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
  html_url: string;
}

interface GitHubEvent {
  type: string;
  created_at: string;
  payload?: {
    issue?: {
      title: string;
      html_url: string;
      body?: string;
    };
    pull_request?: {
      title: string;
      html_url: string;
      body?: string;
    };
    release?: {
      name?: string;
      tag_name: string;
      html_url: string;
      body?: string;
    };
  };
}

export class GitHubCrawler extends BaseCrawler {
  readonly type = 'github';

  async crawl(blogger: Blogger): Promise<Content[]> {
    const username = this.extractUsername(blogger.url);
    if (!username) {
      throw new Error(`Invalid GitHub URL: ${blogger.url}`);
    }

    console.log(`[GitHub Crawl] Starting crawl for ${blogger.name}, username: ${username}`);

    const contents: Content[] = [];

    try {
      // 获取仓库列表
      const repos = await this.fetchRepositories(username);
      console.log(`[GitHub Crawl] Found ${repos.length} repos for ${username}`);

      // 限制并发数，获取提交
      const commitContents = await this.fetchCommitsWithLimit(username, repos, 3);
      contents.push(...commitContents);

      // 获取用户活动
      const eventContents = await this.fetchEvents(username);
      contents.push(...eventContents);

    } catch (error) {
      console.error(`[GitHub Crawl] Error crawling ${blogger.name}:`, error);
    }

    console.log(`[GitHub Crawl] Total contents found for ${blogger.name}: ${contents.length}`);
    return contents;
  }

  private extractUsername(url: string): string | null {
    const match = url.match(/github\.com\/([^\/]+)/);
    return match?.[1] ?? null;
  }

  private async fetchRepositories(username: string): Promise<GitHubRepo[]> {
    return this.fetchWithRetry<GitHubRepo[]>(
      `https://api.github.com/users/${username}/repos`,
      {
        headers: this.getAuthHeaders(),
        params: {
          sort: 'updated',
          direction: 'desc',
          per_page: 10,
        },
      }
    );
  }

  private async fetchCommitsWithLimit(
    username: string,
    repos: GitHubRepo[],
    limit: number
  ): Promise<Content[]> {
    const contents: Content[] = [];

    for (let i = 0; i < repos.length; i += limit) {
      const batch = repos.slice(i, i + limit);
      const batchResults = await Promise.all(
        batch.map(repo => this.fetchRepoCommits(username, repo.name))
      );
      contents.push(...batchResults.flat());
    }

    return contents;
  }

  private async fetchRepoCommits(username: string, repoName: string): Promise<Content[]> {
    try {
      const commits = await this.fetchWithRetry<GitHubCommit[]>(
        `https://api.github.com/repos/${username}/${repoName}/commits`,
        {
          headers: this.getAuthHeaders(),
          params: { per_page: 5 },
        }
      );

      return commits.map(commit =>
        this.createContent(
          0,
          `[${repoName}] ${commit.commit.message.split('\n')[0]}`,
          commit.commit.message,
          commit.html_url,
          commit.commit.author.date
        )
      );
    } catch (error) {
      console.error(`[GitHub Crawl] Error fetching commits for ${repoName}:`, error);
      return [];
    }
  }

  private async fetchEvents(username: string): Promise<Content[]> {
    try {
      const events = await this.fetchWithRetry<GitHubEvent[]>(
        `https://api.github.com/users/${username}/events`,
        {
          headers: this.getAuthHeaders(),
          params: { per_page: 10 },
        }
      );

      const contents: Content[] = [];

      for (const event of events) {
        if (event.type === 'PushEvent') continue;

        const content = this.parseEvent(event);
        if (content) {
          contents.push(content);
        }
      }

      return contents;
    } catch (error) {
      console.error(`[GitHub Crawl] Error fetching events for ${username}:`, error);
      return [];
    }
  }

  private parseEvent(event: GitHubEvent): Content | null {
    let title = '';
    let url = '';
    let content = '';

    switch (event.type) {
      case 'IssuesEvent':
        if (event.payload?.issue) {
          title = `[Issue] ${event.payload.issue.title}`;
          url = event.payload.issue.html_url;
          content = event.payload.issue.body ?? '';
        }
        break;
      case 'PullRequestEvent':
        if (event.payload?.pull_request) {
          title = `[PR] ${event.payload.pull_request.title}`;
          url = event.payload.pull_request.html_url;
          content = event.payload.pull_request.body ?? '';
        }
        break;
      case 'ReleaseEvent':
        if (event.payload?.release) {
          title = `[Release] ${event.payload.release.name || event.payload.release.tag_name}`;
          url = event.payload.release.html_url;
          content = event.payload.release.body ?? '';
        }
        break;
      default:
        return null;
    }

    if (!title) return null;

    return this.createContent(0, title, content, url, event.created_at);
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (this.config.githubToken && this.config.githubToken !== 'your_github_token') {
      headers['Authorization'] = `token ${this.config.githubToken}`;
    }

    return headers;
  }
}
