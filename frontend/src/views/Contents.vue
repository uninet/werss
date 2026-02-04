<template>
  <div class="contents-page h-full flex flex-col">
    <!-- 顶部工具栏 -->
    <header class="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
      <div class="flex items-center space-x-2 md:space-x-4">
        <!-- 移动端返回按钮 -->
        <button
          v-if="isMobile && mobileView !== 'bloggers'"
          @click="goBack"
          class="md:hidden p-2 -ml-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
        >
          <svg class="w-5 h-5 text-[var(--color-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <h1 class="text-lg md:text-xl font-bold text-[var(--color-text)]">内容列表</h1>
        <span class="hidden md:inline text-sm text-[var(--color-text-muted)]">
          {{ selectedBloggerId ? getBloggerName(selectedBloggerId) : '全部文章' }}
          <span class="ml-1">({{ filteredContents.length }})</span>
        </span>
      </div>
      
      <div class="flex items-center space-x-2 md:space-x-3">
        <!-- 移动端博主选择下拉框 -->
        <div class="md:hidden">
          <select
            v-model="selectedBloggerId"
            @change="onBloggerChange"
            class="text-sm bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            <option :value="null">全部博主</option>
            <option v-for="blogger in bloggerStore.bloggers" :key="blogger.id" :value="blogger.id">
              {{ blogger.name }}
            </option>
          </select>
        </div>
        
        <button
          @click="toggleUnreadFilter"
          :class="showUnreadOnly ? 'btn-primary' : 'btn-secondary'"
          class="text-xs md:text-sm px-3 md:px-4"
        >
          <svg class="w-4 h-4 mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <circle v-if="showUnreadOnly" cx="12" cy="12" r="4" fill="currentColor"/>
          </svg>
          <span class="hidden sm:inline">仅未读</span>
        </button>
        
        <button @click="markAllAsRead" class="btn-secondary text-xs md:text-sm hidden sm:flex">
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          全部已读
        </button>
        
        <button
          @click="refreshContents"
          :disabled="contentStore.isLoading"
          class="btn-secondary text-xs md:text-sm p-2 md:px-4"
        >
          <svg
            :class="{ 'animate-spin': contentStore.isLoading }"
            class="w-4 h-4 md:mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          <span class="hidden md:inline">{{ contentStore.isLoading ? '刷新中...' : '刷新' }}</span>
        </button>
      </div>
    </header>

    <!-- 桌面端：三栏布局 -->
    <div class="hidden md:flex flex-1 overflow-hidden">
      <!-- 左侧：博主列表 -->
      <aside class="w-64 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)] flex flex-col">
        <div class="p-4 border-b border-[var(--color-border-light)] flex items-center justify-between">
          <h2 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">订阅源</h2>
          <button
            @click="crawlAllBloggers"
            :disabled="crawlingAll"
            class="text-xs px-2 py-1 rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors disabled:opacity-50"
            title="更新全部 RSS 源"
          >
            <svg
              :class="{ 'animate-spin': crawlingAll }"
              class="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <!-- 全部订阅 -->
          <button
            @click="selectBlogger(null)"
            :class="selectedBloggerId === null ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]'"
            class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          >
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke-width="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke-width="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke-width="2"/>
              </svg>
            </div>
            <div class="flex-1 text-left">
              <span class="font-medium text-sm">全部文章</span>
            </div>
            <span v-if="totalUnread > 0" class="badge-accent text-xs">{{ totalUnread }}</span>
          </button>

          <!-- 博主列表 -->
          <button
            v-for="blogger in bloggerStore.bloggers"
            :key="blogger.id"
            @click="selectBlogger(blogger.id)"
            :class="selectedBloggerId === blogger.id ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]'"
            class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
          >
            <div class="w-9 h-9 rounded-lg bg-[var(--color-bg-muted)] flex items-center justify-center text-lg">
              {{ getTypeIcon(blogger.type) }}
            </div>
            <div class="flex-1 text-left min-w-0">
              <span class="font-medium text-sm truncate block">{{ blogger.name }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <button
                @click="crawlSingleBlogger(blogger.id, $event)"
                :disabled="crawlingSingle === blogger.id"
                class="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[var(--color-primary)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all disabled:opacity-100"
                title="更新此 RSS 源"
              >
                <svg
                  :class="{ 'animate-spin': crawlingSingle === blogger.id }"
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
              <span v-if="getUnreadCount(blogger) > 0" class="badge-accent text-xs">{{ getUnreadCount(blogger) }}</span>
            </div>
          </button>
        </div>
      </aside>

      <!-- 中间：文章列表 -->
      <div class="w-96 bg-[var(--color-bg)] border-r border-[var(--color-border)] flex flex-col">
        <ArticleList
          :contents="filteredContents"
          :loading="contentStore.isLoading || crawlingAll"
          :loading-more="loadingMore"
          :has-more="hasMore"
          :selected-article="selectedArticle"
          :crawling="crawlingAll"
          @select="selectArticle"
          @load-more="loadMore"
        />
      </div>

      <!-- 右侧：文章阅读区 -->
      <article class="flex-1 bg-[var(--color-bg-elevated)] overflow-y-auto">
        <ArticleReader
          v-if="selectedArticle"
          :article="selectedArticle"
          :prev-article="prevArticle"
          :next-article="nextArticle"
          :font-size="fontSize"
          @close="closeArticle"
          @prev="selectArticle"
          @next="selectArticle"
          @toggle-font="toggleFontSize"
        />
        <EmptyReader v-else />
      </article>
    </div>

    <!-- 移动端：单栏视图 -->
    <div class="md:hidden flex-1 overflow-hidden">
      <!-- 博主列表视图 -->
      <div v-if="mobileView === 'bloggers'" class="h-full overflow-y-auto bg-[var(--color-bg-elevated)]">
        <div class="p-4 border-b border-[var(--color-border-light)] flex items-center justify-between">
          <h2 class="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">订阅源</h2>
          <button
            @click="crawlAllBloggers"
            :disabled="crawlingAll"
            class="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors disabled:opacity-50 flex items-center space-x-1"
          >
            <svg
              :class="{ 'animate-spin': crawlingAll }"
              class="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>更新全部</span>
          </button>
        </div>
        <div class="p-3 space-y-2">
          <button
            @click="selectBloggerMobile(null)"
            :class="selectedBloggerId === null ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20' : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)]'"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all duration-200"
          >
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke-width="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke-width="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke-width="2"/>
              </svg>
            </div>
            <div class="flex-1 text-left">
              <span class="font-medium text-[var(--color-text)]">全部文章</span>
              <p class="text-xs text-[var(--color-text-muted)]">{{ filteredContents.length }} 篇文章</p>
            </div>
            <span v-if="totalUnread > 0" class="badge-accent text-xs px-2 py-1">{{ totalUnread }} 未读</span>
          </button>

          <button
            v-for="blogger in bloggerStore.bloggers"
            :key="blogger.id"
            @click="selectBloggerMobile(blogger.id)"
            :class="selectedBloggerId === blogger.id ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20' : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)]'"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all duration-200"
          >
            <div class="w-10 h-10 rounded-xl bg-[var(--color-bg-muted)] flex items-center justify-center text-xl">
              {{ getTypeIcon(blogger.type) }}
            </div>
            <div class="flex-1 text-left min-w-0">
              <span class="font-medium text-[var(--color-text)] truncate block">{{ blogger.name }}</span>
              <p class="text-xs text-[var(--color-text-muted)]">{{ getTypeLabel(blogger.type) }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span v-if="getUnreadCount(blogger) > 0" class="badge-accent text-xs px-2 py-1">
                {{ getUnreadCount(blogger) }}
              </span>
              <svg class="w-5 h-5 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- 文章列表视图 -->
      <div v-else-if="mobileView === 'articles'" class="h-full bg-[var(--color-bg)]">
        <ArticleList
          :contents="filteredContents"
          :loading="contentStore.isLoading || crawlingAll"
          :loading-more="loadingMore"
          :has-more="hasMore"
          :selected-article="selectedArticle"
          :crawling="crawlingAll"
          @select="selectArticleMobile"
          @load-more="loadMore"
          mobile
        />
      </div>

      <!-- 文章阅读视图 -->
      <div v-else-if="mobileView === 'reader'" class="h-full bg-[var(--color-bg-elevated)]">
        <ArticleReader
          v-if="selectedArticle"
          :article="selectedArticle"
          :prev-article="prevArticle"
          :next-article="nextArticle"
          :font-size="fontSize"
          mobile
          @close="closeArticleMobile"
          @prev="selectArticle"
          @next="selectArticle"
          @toggle-font="toggleFontSize"
        />
      </div>
    </div>

    <!-- 字体大小选择弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showFontPanel" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showFontPanel = false">
          <div class="bg-[var(--color-bg-elevated)] rounded-2xl p-6 shadow-2xl mx-4" @click.stop>
            <h3 class="text-lg font-semibold text-[var(--color-text)] mb-4">字体大小</h3>
            <div class="flex space-x-3">
              <button
                v-for="size in fontSizes"
                :key="size.value"
                @click="setFontSize(size.value)"
                :class="fontSize === size.value ? 'btn-primary' : 'btn-secondary'"
                class="flex-1 px-6 py-3"
              >
                {{ size.label }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBloggerStore, useContentStore, type Blogger } from '../stores'
import { useResponsive } from '../composables/useResponsive'
import ArticleList from '../components/mobile/ArticleList.vue'
import ArticleReader from '../components/mobile/ArticleReader.vue'
import EmptyReader from '../components/mobile/EmptyReader.vue'

const bloggerStore = useBloggerStore()
const contentStore = useContentStore()
const { isMobile } = useResponsive()

// 移动端视图状态: 'bloggers' | 'articles' | 'reader'
const mobileView = ref<'bloggers' | 'articles' | 'reader'>('articles')

// 数据状态
const selectedBloggerId = ref<number | null>(null)
const selectedArticle = ref<any>(null)
const loadingMore = ref(false)
const crawlingAll = ref(false)
const crawlingSingle = ref<number | null>(null)
const offset = ref(0)
const limit = 30
const hasMore = ref(true)
const showUnreadOnly = ref(false)

// 字体设置
const fontSize = ref<'normal' | 'large' | 'small'>('normal')
const showFontPanel = ref(false)
type FontSize = 'normal' | 'large' | 'small'
const fontSizes: { value: FontSize; label: string }[] = [
  { value: 'small', label: '小' },
  { value: 'normal', label: '中' },
  { value: 'large', label: '大' }
]

// 计算属性
const filteredContents = computed(() => {
  let result = contentStore.contents

  if (selectedBloggerId.value) {
    result = result.filter(c => (c.bloggerId || c.blogger_id) === selectedBloggerId.value)
  }

  if (showUnreadOnly.value) {
    result = result.filter(c => !c.isNotified && !c.is_notified)
  }

  return result
})

const totalUnread = computed(() => {
  return bloggerStore.bloggers.reduce((sum, b) => sum + (getUnreadCount(b)), 0)
})

const currentIndex = computed(() => {
  if (!selectedArticle.value) return -1
  return filteredContents.value.findIndex(c => c.id === selectedArticle.value.id)
})

const prevArticle = computed(() => {
  const index = currentIndex.value
  if (index > 0) {
    return filteredContents.value[index - 1]
  }
  return null
})

const nextArticle = computed(() => {
  const index = currentIndex.value
  if (index >= 0 && index < filteredContents.value.length - 1) {
    return filteredContents.value[index + 1]
  }
  return null
})

// 获取未读数
function getUnreadCount(blogger: Blogger): number {
  return (blogger.unread_contents || blogger.unread_count || 0)
}

// 方法
const fetchContents = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    offset.value = 0
    hasMore.value = true
  }

  try {
    const params: any = { limit, offset: offset.value }
    if (selectedBloggerId.value) {
      params.blogger_id = selectedBloggerId.value
    }
    const result = await contentStore.fetchContents(params)
    if (result) {
      const data = result.data || result
      if (Array.isArray(data) && data.length < limit) {
        hasMore.value = false
      } else if (data.items && data.items.length < limit) {
        hasMore.value = false
      }
    }
  } finally {
    loadingMore.value = false
  }
}

const loadMore = () => {
  offset.value += limit
  fetchContents(true)
}

const refreshContents = async () => {
  await bloggerStore.fetchBloggers()
  await fetchContents()
}

const crawlAllBloggers = async () => {
  crawlingAll.value = true
  try {
    const result = await bloggerStore.crawlAll()
    if (result) {
      alert(`更新完成！共获取 ${result.totalNewContents} 条新内容`)
      await fetchContents()
      await bloggerStore.fetchBloggers()
    }
  } catch (error: any) {
    alert(error.message || '更新失败')
  } finally {
    crawlingAll.value = false
  }
}

const crawlSingleBlogger = async (bloggerId: number, event: Event) => {
  event.stopPropagation()
  crawlingSingle.value = bloggerId
  try {
    const result = await bloggerStore.crawlSingle(bloggerId)
    if (result) {
      alert(result.message)
      if (selectedBloggerId.value === bloggerId) {
        await fetchContents()
      }
      await bloggerStore.fetchBloggers()
    }
  } catch (error: any) {
    alert(error.message || '更新失败')
  } finally {
    crawlingSingle.value = null
  }
}

// 桌面端选择博主
const selectBlogger = async (id: number | null) => {
  selectedBloggerId.value = id
  selectedArticle.value = null
  await fetchContents()
}

// 移动端选择博主
const selectBloggerMobile = async (id: number | null) => {
  selectedBloggerId.value = id
  selectedArticle.value = null
  mobileView.value = 'articles'
  await fetchContents()
}

// 博主下拉框变化
const onBloggerChange = async () => {
  selectedArticle.value = null
  await fetchContents()
}

// 选择文章
const selectArticle = async (article: any) => {
  selectedArticle.value = article

  try {
    const result = await contentStore.fetchContentById(article.id)
    if (result && result.content && result.content.length > (article.content?.length || 0)) {
      article.content = result.content
      selectedArticle.value = { ...article }
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
  }

  if (!article.isNotified && !article.is_notified) {
    try {
      await contentStore.markAsRead(article.id)
      article.isNotified = true
      article.is_notified = 1

      const blogger = bloggerStore.bloggers.find(b => b.id === (article.bloggerId || article.blogger_id))
      if (blogger && getUnreadCount(blogger) > 0) {
        blogger.unread_count = (blogger.unread_count || 0) - 1
        blogger.unread_contents = (blogger.unread_contents || 0) - 1
      }
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
}

// 移动端选择文章
const selectArticleMobile = async (article: any) => {
  await selectArticle(article)
  mobileView.value = 'reader'
}

const closeArticle = () => {
  selectedArticle.value = null
}

const closeArticleMobile = () => {
  selectedArticle.value = null
  mobileView.value = 'articles'
}

const goBack = () => {
  if (mobileView.value === 'reader') {
    mobileView.value = 'articles'
    selectedArticle.value = null
  } else if (mobileView.value === 'articles') {
    mobileView.value = 'bloggers'
  }
}

const toggleUnreadFilter = () => {
  showUnreadOnly.value = !showUnreadOnly.value
}

const markAllAsRead = async () => {
  if (!confirm('确定要将所有文章标记为已读吗？')) return

  try {
    for (const content of filteredContents.value) {
      if (!content.isNotified && !content.is_notified) {
        await contentStore.markAsRead(content.id)
        content.isNotified = true
        content.is_notified = 1
      }
    }
    await bloggerStore.fetchBloggers()
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

const toggleFontSize = () => {
  showFontPanel.value = true
}

const setFontSize = (size: 'normal' | 'large' | 'small') => {
  fontSize.value = size
  showFontPanel.value = false
}

const getBloggerName = (id: number) => {
  const blogger = bloggerStore.bloggers.find(b => b.id === id)
  return blogger?.name || '未知博主'
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    github: '⚡',
    wechat: '💬',
    rss: '📡',
    zhihu: '❓'
  }
  return icons[type] || '📄'
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

// 键盘导航
const handleKeydown = (e: KeyboardEvent) => {
  if (!selectedArticle.value) return

  if (e.key === 'ArrowUp' && prevArticle.value) {
    e.preventDefault()
    selectArticle(prevArticle.value)
  } else if (e.key === 'ArrowDown' && nextArticle.value) {
    e.preventDefault()
    selectArticle(nextArticle.value)
  } else if (e.key === 'Escape') {
    closeArticle()
  }
}

onMounted(async () => {
  await bloggerStore.fetchBloggers()
  await fetchContents()
  if (contentStore.contents.length === 0 && bloggerStore.bloggers.length > 0) {
    await crawlAllBloggers()
  }
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.contents-page {
  height: calc(100vh - 64px);
}

@media (max-width: 768px) {
  .contents-page {
    height: calc(100vh - 120px);
  }
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}
</style>
