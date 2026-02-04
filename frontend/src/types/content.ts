// Type definitions for Content entity
export interface Content {
  id: number;
  blogger_id: number;
  title: string;
  content?: string;
  url: string;
  published_at?: string;
  fetched_at: string;
  is_notified: boolean;
  blogger?: Blogger;
}

export interface ContentFilter {
  bloggerId?: number;
  type?: string;
  search?: string;
}

export interface ContentPagination {
  page: number;
  pageSize: number;
}

export interface ContentListResponse {
  contents: Content[];
  total: number;
  page: number;
  pageSize: number;
}

import type { Blogger } from './blogger';

export interface MarkAsReadInput {
  ids: number[];
}

export interface MarkAsReadResponse {
  updated: number;
}
