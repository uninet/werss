<template>
  <div class="h-full flex flex-col">
    <!-- 加载状态 -->
    <div v-if="loading && contents.length === 0" class="flex-1 flex flex-col items-center justify-center p-8">
      <div class="animate-spin w-10 h-10 border-3 border-[var(--color-primary)] border-t-transparent rounded-full mb-4"></div>
      <p class="text-[var(--color-text)] font-medium mb-2">正在加载内容...</p>
      <p v-if="crawling" class="text-sm text-[var(--color-text-muted)] text-center max-w-xs">
        首次访问，正在从订阅源获取最新文章，请稍候
      </p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="contents.length === 0" class="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)] p-8">
      <div class="w-16 h-16 bg-[var(--color-bg-muted)] rounded-2xl flex items-center justify-center mb-4">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="1.5"/>
          <path d="M9 9h6M9 15h6" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="text-center">暂无内容</p>
    </div>

    <!-- 文章列表 -->
    <div v-else class="flex-1 overflow-y-auto">
      <div :class="mobile ? 'p-3 space-y-3' : 'p-3 space-y-2'">
        <article
          v-for="content in contents"
          :key="content.id"
          @click="$emit('select', content)"
          :class="[
            selectedArticle?.id === content.id
              ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/30'
              : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)]',
            !content.is_notified ? 'border-l-4 border-l-[var(--color-accent)]' : '',
            mobile ? 'p-4 rounded-xl shadow-sm' : 'p-4 rounded-xl'
          ]"
          class="border cursor-pointer transition-all duration-200 active:scale-[0.98]"
        >
          <!-- 头部信息 -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-medium text-[var(--color-primary)]">{{ content.blogger_name }}</span>
              <span v-if="!content.is_notified" class="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
            </div>
            <span class="text-xs text-[var(--color-text-muted)]">{{ formatDate(content.published_at) }}</span>
          </div>
          
          <!-- 标题 -->
          <h3 
            :class="mobile ? 'text-base' : 'text-sm'"
            class="font-semibold text-[var(--color-text)] leading-snug mb-2 line-clamp-2"
          >
            {{ content.title }}
          </h3>
          
          <!-- 摘要 -->
          <p v-if="content.content" class="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
            {{ stripHtml(content.content).slice(0, mobile ? 150 : 100) }}...
          </p>
          
          <!-- 移动端底部信息 -->
          <div v-if="mobile" class="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-light)]">
            <span class="text-xs text-[var(--color-text-muted)]">
              {{ getTypeLabel(content.blogger_type) }}
            </span>
            <svg class="w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </article>

        <!-- 加载更多 -->
        <div v-if="hasMore" class="pt-4 pb-2 text-center">
          <button
            @click="$emit('load-more')"
            :disabled="loadingMore"
            class="btn-secondary w-full text-sm py-3"
          >
            <span v-if="loadingMore" class="flex items-center justify-center">
              <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              加载中...
            </span>
            <span v-else>加载更多</span>
          </button>
        </div>
        
        <!-- 底部留白（移动端） -->
        <div v-if="mobile" class="h-4"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

interface Content {
  id: number
  title: string
  content?: string
  blogger_name: string
  blogger_type: string
  published_at: string
  is_notified?: number
}

defineProps<{
  contents: Content[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  selectedArticle: Content | null
  mobile?: boolean
  crawling?: boolean
}>()

defineEmits<{
  select: [content: Content]
  'load-more': []
}>()

const formatDate = (date: string) => {
  if (!date) return ''
  const d = dayjs(date)
  const now = dayjs()

  if (d.isSame(now, 'day')) {
    return d.format('HH:mm')
  } else if (d.isSame(now.subtract(1, 'day'), 'day')) {
    return '昨天'
  } else if (d.isSame(now, 'year')) {
    return d.format('MM-DD')
  } else {
    return d.format('YYYY-MM-DD')
  }
}

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    github: 'GitHub',
    wechat: '公众号',
    rss: 'RSS',
    zhihu: '知乎'
  }
  return labels[type] || type
}
</script>
