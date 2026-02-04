<template>
  <div class="h-full flex flex-col">
    <!-- 阅读器头部 -->
    <header class="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-light)] bg-[var(--color-bg-elevated)] sticky top-0 z-10">
      <button 
        @click="$emit('close')" 
        class="flex items-center space-x-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors touch-target"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        <span class="hidden sm:inline">返回</span>
      </button>
      
      <div class="flex items-center space-x-1">
        <button 
          @click="$emit('toggle-font')" 
          class="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors touch-target"
          title="字体大小"
        >
          <svg class="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
          </svg>
        </button>
        
        <a
          v-if="article.url"
          :href="article.url"
          target="_blank"
          class="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors touch-target"
          title="查看原文"
        >
          <svg class="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
      </div>
    </header>

    <!-- 文章内容 -->
    <div class="flex-1 overflow-y-auto">
      <article :class="mobile ? 'p-4' : 'p-8'" class="max-w-3xl mx-auto">
        <!-- 文章元信息 -->
        <div class="mb-4 md:mb-6">
          <div class="flex items-center space-x-2 mb-3">
            <span class="badge-primary text-xs">{{ getTypeLabel(article.blogger_type) }}</span>
            <span class="text-xs text-[var(--color-text-muted)]">{{ formatDate(article.published_at) }}</span>
          </div>
          
          <h1 :class="mobile ? 'text-xl' : 'text-2xl'" class="font-bold text-[var(--color-text)] leading-tight">
            {{ article.title }}
          </h1>
          
          <div class="flex items-center space-x-3 mt-3 text-sm text-[var(--color-text-muted)]">
            <span class="font-medium text-[var(--color-text-secondary)]">{{ article.blogger_name }}</span>
          </div>
        </div>

        <!-- 文章正文 -->
        <div
          class="article-content prose prose-slate max-w-none"
          :class="{ 
            'text-lg': fontSize === 'large', 
            'text-sm': fontSize === 'small',
            'text-base': fontSize === 'normal'
          }"
          v-html="sanitizedContent"
        ></div>

        <!-- 文章底部导航 -->
        <footer class="mt-8 md:mt-12 pt-6 border-t border-[var(--color-border-light)]">
          <div class="flex items-center justify-between">
            <button
              v-if="prevArticle"
              @click="$emit('prev', prevArticle)"
              class="flex items-center space-x-2 text-left group touch-target"
            >
              <div class="w-8 h-8 rounded-lg bg-[var(--color-bg-muted)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                <svg class="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </div>
              <div class="max-w-[120px] md:max-w-[200px]">
                <p class="text-xs text-[var(--color-text-muted)] mb-0.5">上一篇</p>
                <p class="text-xs md:text-sm font-medium text-[var(--color-text)] line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">{{ prevArticle.title }}</p>
              </div>
            </button>
            <div v-else class="w-8"></div>

            <button
              v-if="nextArticle"
              @click="$emit('next', nextArticle)"
              class="flex items-center space-x-2 text-right group touch-target"
            >
              <div class="max-w-[120px] md:max-w-[200px]">
                <p class="text-xs text-[var(--color-text-muted)] mb-0.5">下一篇</p>
                <p class="text-xs md:text-sm font-medium text-[var(--color-text)] line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">{{ nextArticle.title }}</p>
              </div>
              <div class="w-8 h-8 rounded-lg bg-[var(--color-bg-muted)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                <svg class="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
            <div v-else class="w-8"></div>
          </div>
        </footer>
        
        <!-- 底部留白（移动端） -->
        <div v-if="mobile" class="h-8"></div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

interface Article {
  id: number
  title: string
  content?: string
  blogger_name: string
  blogger_type: string
  published_at: string
  url?: string
}

const props = defineProps<{
  article: Article
  prevArticle: Article | null
  nextArticle: Article | null
  fontSize: 'normal' | 'large' | 'small'
  mobile?: boolean
}>()

defineEmits<{
  close: []
  prev: [article: Article]
  next: [article: Article]
  'toggle-font': []
}>()

const sanitizedContent = computed(() => {
  if (!props.article?.content) {
    return '<p class="text-center text-[var(--color-text-muted)] py-12 italic">暂无内容</p>'
  }

  let content = props.article.content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')

  if (!content.trim().startsWith('<')) {
    content = `<p>${content}</p>`
  }

  return content
})

const formatDate = (date: string) => {
  if (!date) return ''
  const d = dayjs(date)
  const now = dayjs()

  if (d.isSame(now, 'day')) {
    return d.format('HH:mm')
  } else if (d.isSame(now.subtract(1, 'day'), 'day')) {
    return '昨天 ' + d.format('HH:mm')
  } else if (d.isSame(now, 'year')) {
    return d.format('MM-DD HH:mm')
  } else {
    return d.format('YYYY-MM-DD HH:mm')
  }
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    github: 'GitHub',
    wechat: '微信公众号',
    rss: 'RSS',
    zhihu: '知乎'
  }
  return labels[type] || type
}
</script>

<style scoped>
/* 文章正文样式 */
.article-content :deep(p) {
  margin-bottom: 1.25em;
  line-height: 1.8;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.4;
}

.article-content :deep(h1) { font-size: 1.5em; }
.article-content :deep(h2) { font-size: 1.3em; }
.article-content :deep(h3) { font-size: 1.15em; }
.article-content :deep(h4) { font-size: 1.05em; }

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5em 0;
}

.article-content :deep(a) {
  color: var(--color-accent);
  text-decoration: none;
  word-break: break-all;
}

.article-content :deep(a:hover) {
  text-decoration: underline;
}

.article-content :deep(code) {
  font-family: var(--code-font);
  font-size: 0.875em;
  background: var(--color-bg-muted);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  color: var(--color-text);
}

.article-content :deep(pre) {
  background: var(--color-primary);
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
  -webkit-overflow-scrolling: touch;
}

.article-content :deep(pre code) {
  background: transparent;
  color: #e2e8f0;
  padding: 0;
}

.article-content :deep(blockquote) {
  border-left: 3px solid var(--color-accent);
  padding-left: 1em;
  margin: 1em 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 1em 0;
  padding-left: 1.5em;
}

.article-content :deep(li) {
  margin-bottom: 0.5em;
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 0.875em;
  overflow-x: auto;
  display: block;
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 0.5em;
  border: 1px solid var(--color-border);
  text-align: left;
}

.article-content :deep(th) {
  background: var(--color-bg-muted);
  font-weight: 600;
}

.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
