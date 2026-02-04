<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 bg-[var(--color-bg-elevated)]/95 backdrop-blur-md border-b border-[var(--color-border)]">
      <div class="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <button @click="goBack" class="btn-ghost text-sm">
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          返回
        </button>
        <div class="flex items-center space-x-2">
          <button @click="toggleFontSize" class="btn-ghost" title="字体大小">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
            </svg>
          </button>
          <a v-if="article?.url" :href="article.url" target="_blank" class="btn-ghost" title="查看原文">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>
      </div>
    </header>

    <!-- 文章主体 -->
    <main class="max-w-3xl mx-auto px-6 py-12">
      <article v-if="article" class="animate-fade-in">
        <!-- 文章头部信息 -->
        <header class="mb-10 pb-8 border-b border-[var(--color-border-light)]">
          <div class="flex items-center space-x-3 mb-4">
            <span class="badge-primary text-xs">{{ sourceLabel }}</span>
            <span class="text-sm text-[var(--color-text-muted)]">{{ formatDate(article.published_at) }}</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-[var(--color-text)] leading-tight mb-6">{{ article.title }}</h1>
          <div class="flex items-center space-x-4 text-sm">
            <span class="font-medium text-[var(--color-text-secondary)]">{{ article.blogger_name }}</span>
            <span v-if="article.fetched_at" class="text-[var(--color-text-muted)]">抓取于 {{ formatDate(article.fetched_at) }}</span>
          </div>
        </header>

        <!-- 文章正文 -->
        <div
          class="article-content prose prose-slate max-w-none"
          :class="{ 'text-lg': fontSize === 'large', 'text-base': fontSize === 'normal', 'text-sm': fontSize === 'small' }"
          v-html="sanitizedContent"
        ></div>

        <!-- 文章底部导航 -->
        <footer class="mt-16 pt-8 border-t border-[var(--color-border-light)]">
          <!-- 上一篇/下一篇导航 -->
          <div class="flex items-center justify-between mb-8">
            <button
              v-if="article.prev"
              @click="goToArticle(article.prev.id)"
              class="flex items-center space-x-3 text-left group"
            >
              <div class="w-10 h-10 rounded-xl bg-[var(--color-bg-muted)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                <svg class="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </div>
              <div class="max-w-[200px]">
                <p class="text-xs text-[var(--color-text-muted)] mb-1">上一篇</p>
                <p class="text-sm font-medium text-[var(--color-text)] line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">{{ article.prev.title }}</p>
              </div>
            </button>
            <div v-else></div>

            <button
              v-if="article.next"
              @click="goToArticle(article.next.id)"
              class="flex items-center space-x-3 text-right group"
            >
              <div class="max-w-[200px]">
                <p class="text-xs text-[var(--color-text-muted)] mb-1">下一篇</p>
                <p class="text-sm font-medium text-[var(--color-text)] line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">{{ article.next.title }}</p>
              </div>
              <div class="w-10 h-10 rounded-xl bg-[var(--color-bg-muted)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                <svg class="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
            <div v-else></div>
          </div>

          <!-- 文章操作 -->
          <div class="flex items-center justify-center space-x-4">
            <button
              @click="markAsRead"
              :class="isRead ? 'btn-primary' : 'btn-secondary'"
              class="text-sm"
            >
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="isRead" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                <circle v-else cx="12" cy="12" r="10" stroke-width="2"/>
              </svg>
              {{ isRead ? '已读' : '标记已读' }}
            </button>
            <a v-if="article.url" :href="article.url" target="_blank" rel="noopener" class="btn-primary text-sm">
              查看原文
              <svg class="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
          </div>
        </footer>
      </article>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="flex flex-col items-center justify-center py-24 text-[var(--color-text-muted)]">
        <div class="animate-spin w-10 h-10 border-2 border-[var(--color-primary)] border-t-transparent rounded-full mb-4"></div>
        <p class="text-lg font-medium mb-2">加载文章中...</p>
        <p class="text-sm">正在获取全文内容，请稍候</p>
      </div>

      <!-- 错误状态 -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-[var(--color-text-muted)]">
        <div class="w-16 h-16 bg-[var(--color-bg-muted)] rounded-2xl flex items-center justify-center mb-4">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <p class="text-lg font-medium mb-4">文章加载失败</p>
        <button @click="fetchArticle" class="btn-primary">
          重试
        </button>
      </div>
    </main>

    <!-- 字体大小选择弹窗 -->
    <div v-if="showFontPanel" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50" @click="showFontPanel = false">
      <div class="bg-[var(--color-bg-elevated)] rounded-2xl p-6 shadow-2xl" @click.stop>
        <h3 class="text-lg font-semibold text-[var(--color-text)] mb-4">字体大小</h3>
        <div class="flex space-x-3">
          <button
            v-for="size in fontSizes"
            :key="size.value"
            @click="setFontSize(size.value)"
            :class="fontSize === size.value ? 'btn-primary' : 'btn-secondary'"
            class="flex-1"
          >
            {{ size.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { contentApi } from '../api'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const article = ref<any>(null)
const loading = ref(false)
const isRead = ref(false)
const fontSize = ref<'normal' | 'large' | 'small'>('normal')
const showFontPanel = ref(false)

const fontSizes = [
  { value: 'small', label: '小' },
  { value: 'normal', label: '中' },
  { value: 'large', label: '大' }
]

const sourceLabel = computed(() => {
  const type = article.value?.blogger_type
  const labels: Record<string, string> = {
    github: 'GitHub',
    wechat: '微信公众号',
    rss: 'RSS',
    zhihu: '知乎'
  }
  return labels[type] || type
})

const sanitizedContent = computed(() => {
  if (!article.value?.content) return '<p class="text-center text-[var(--color-text-muted)] py-12 italic">暂无内容</p>'

  let content = article.value.content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')

  // 为图片添加错误处理
  content = content.replace(/<img([^>]*)>/gi, (match: string, attrs: string) => {
    if (attrs.includes('onerror')) return match
    return `<img${attrs} onerror="this.style.display='none'; this.nextElementSibling?.style?.display='flex'" style="max-width: 100%; height: auto;"><div class="image-error" style="display: none; padding: 20px; background: var(--color-bg-muted); border-radius: 12px; text-align: center; color: var(--color-text-muted); font-size: 14px;">图片加载失败</div>`
  })

  if (!content.trim().startsWith('<')) {
    content = `<p>${content}</p>`
  }

  return content
})

const formatDate = (date: string) => {
  if (!date) return ''
  return dayjs(date).format('YYYY年M月D日 HH:mm')
}

const fetchArticle = async () => {
  const id = route.params.id
  if (!id) return

  loading.value = true
  try {
    const res: any = await contentApi.getById(Number(id))
    if (res.success) {
      article.value = res.data
      isRead.value = res.data.is_notified === 1
    }
  } catch (error) {
    console.error('获取文章失败:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}

const toggleFontSize = () => {
  showFontPanel.value = !showFontPanel.value
}

const setFontSize = (size: string) => {
  fontSize.value = size as 'normal' | 'large' | 'small'
  showFontPanel.value = false
  localStorage.setItem('reader-font-size', size)
}

const markAsRead = async () => {
  if (!article.value || isRead.value) return

  try {
    const res: any = await contentApi.markAsRead(article.value.id)
    if (res.success) {
      isRead.value = true
      article.value.is_notified = 1
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

onMounted(() => {
  fetchArticle()

  // 恢复用户偏好
  const savedFontSize = localStorage.getItem('reader-font-size') as 'normal' | 'large' | 'small'
  if (savedFontSize) fontSize.value = savedFontSize
})
</script>

<style scoped>
/* 文章正文样式 */
.article-content {
  font-family: var(--reading-font);
  line-height: 1.8;
  color: var(--color-text);
}

.article-content :deep(p) {
  margin-bottom: 1.5em;
  text-align: justify;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  font-family: var(--ui-font);
  font-weight: 700;
  color: var(--color-text);
  margin-top: 2em;
  margin-bottom: 0.8em;
  line-height: 1.4;
}

.article-content :deep(h1) { font-size: 1.75em; }
.article-content :deep(h2) { font-size: 1.5em; }
.article-content :deep(h3) { font-size: 1.25em; }
.article-content :deep(h4) { font-size: 1.125em; }

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 2em 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.article-content :deep(a) {
  color: var(--color-accent);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.article-content :deep(a:hover) {
  border-bottom-color: var(--color-accent);
}

.article-content :deep(blockquote) {
  border-left: 4px solid var(--color-accent);
  padding-left: 1.5em;
  margin: 1.5em 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 1.25em 0;
  padding-left: 1.5em;
}

.article-content :deep(li) {
  margin-bottom: 0.5em;
}

.article-content :deep(code) {
  font-family: var(--code-font);
  font-size: 0.875em;
  background: var(--color-bg-muted);
  padding: 0.2em 0.4em;
  border-radius: 6px;
  color: var(--color-accent);
}

.article-content :deep(pre) {
  background: var(--color-primary);
  padding: 1.5em;
  border-radius: 12px;
  overflow-x: auto;
  margin: 1.5em 0;
}

.article-content :deep(pre code) {
  background: transparent;
  color: #e2e8f0;
  padding: 0;
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 0.75em;
  border: 1px solid var(--color-border);
  text-align: left;
}

.article-content :deep(th) {
  background: var(--color-bg-muted);
  font-weight: 600;
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
</style>
