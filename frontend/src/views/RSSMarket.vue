<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <!-- 页面头部 -->
    <div class="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-accent)] text-white">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-[var(--color-accent)]/20 rounded-full blur-3xl"></div>

      <div class="relative max-w-7xl mx-auto px-8 py-12">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2">RSS 订阅源市场</h1>
            <p class="text-white/80">发现和订阅优质的 RSS 源，一站式获取您感兴趣的内容</p>
          </div>
          <button @click="goBack" class="btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            返回博主列表
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="max-w-7xl mx-auto px-8 -mt-6 relative z-10">
      <div class="card p-4 flex flex-wrap items-center gap-4">
        <div class="relative flex-1 min-w-[280px]">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="11" cy="11" r="8" stroke-width="2"/>
            <path d="m21 21-4.3-4.3" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索 RSS 源..."
            @input="handleSearch"
            class="input pl-12"
          />
        </div>

        <div class="flex gap-2 flex-wrap">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="selectCategory(cat.value)"
            :class="currentCategory === cat.value ? 'btn-primary' : 'btn-secondary'"
            class="text-sm"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 精选推荐 -->
    <div v-if="currentCategory === 'all' && !searchQuery && featuredFeeds.length > 0" class="max-w-7xl mx-auto px-8 mt-8">
      <h2 class="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center">
        <span class="mr-2">⭐</span>
        精选推荐
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="feed in featuredFeeds"
          :key="feed.id"
          class="card card-hover p-6"
        >
          <div class="flex items-start justify-between mb-4">
            <span class="text-4xl">{{ feed.icon }}</span>
            <span v-if="isSubscribed(feed.id)" class="badge-primary text-xs">已订阅</span>
          </div>
          <h3 class="font-bold text-[var(--color-text)] mb-2">{{ feed.name }}</h3>
          <p class="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">{{ feed.description }}</p>
          <div class="flex items-center justify-between">
            <span class="text-xs text-[var(--color-text-muted)]">{{ feed.subscriber_count }} 人订阅</span>
            <button
              :class="isSubscribed(feed.id) ? 'btn-secondary' : 'btn-primary'"
              :disabled="isSubscribed(feed.id) || subscribingId === feed.id"
              class="text-sm"
              @click="subscribe(feed)"
            >
              <span v-if="subscribingId === feed.id" class="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
              {{ isSubscribed(feed.id) ? '已订阅' : '订阅' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 全部 RSS 源 -->
    <div class="max-w-7xl mx-auto px-8 py-8">
      <h2 class="text-xl font-bold text-[var(--color-text)] mb-4">
        {{ currentCategory === 'all' ? '全部 RSS 源' : categoryLabel }}
        <span class="text-sm font-normal text-[var(--color-text-muted)] ml-2">({{ filteredFeeds.length }})</span>
      </h2>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
        <div class="animate-spin w-10 h-10 border-2 border-[var(--color-primary)] border-t-transparent rounded-full mb-4"></div>
        <p>加载 RSS 源...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredFeeds.length === 0" class="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
        <div class="w-16 h-16 bg-[var(--color-bg-muted)] rounded-2xl flex items-center justify-center mb-4 text-3xl">
          📭
        </div>
        <p class="text-lg mb-4">没有找到匹配的 RSS 源</p>
        <button @click="resetFilters" class="btn-primary">重置筛选</button>
      </div>

      <!-- RSS 源列表 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="feed in filteredFeeds"
          :key="feed.id"
          :class="isSubscribed(feed.id) ? 'border-green-500/30 bg-green-50/50' : ''"
          class="card card-hover p-5"
        >
          <div class="flex items-start space-x-4 mb-3">
            <span class="text-3xl">{{ feed.icon }}</span>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-[var(--color-text)] truncate">{{ feed.name }}</h3>
              <span class="badge-primary text-xs mt-1">{{ getCategoryLabel(feed.category) }}</span>
            </div>
          </div>
          <p class="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">{{ feed.description }}</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4 text-xs text-[var(--color-text-muted)]">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {{ feed.subscriber_count }}
              </span>
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke-width="2"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0110 10 15.3 15.3 0 01-10 10 15.3 15.3 0 01-10-10 15.3 15.3 0 0110-10z" stroke-width="2"/>
                </svg>
                {{ feed.language === 'zh' ? '中文' : '英文' }}
              </span>
            </div>
            <button
              :class="isSubscribed(feed.id) ? 'btn-secondary' : 'btn-primary'"
              :disabled="isSubscribed(feed.id) || subscribingId === feed.id"
              class="text-sm"
              @click="subscribe(feed)"
            >
              <span v-if="subscribingId === feed.id" class="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
              <svg v-else-if="!isSubscribed(feed.id)" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <svg v-else class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              {{ isSubscribed(feed.id) ? '已订阅' : '订阅' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门公众号推荐 -->
    <div class="max-w-7xl mx-auto px-8 pb-12">
      <div class="border-t border-[var(--color-border)] pt-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-[var(--color-text)] flex items-center">
            <span class="mr-2">📱</span>
            热门公众号推荐
          </h2>
          <router-link to="/bloggers" class="text-sm text-[var(--color-primary)] hover:underline">
            去添加公众号 →
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="account in popularWechatAccounts"
            :key="account.name"
            class="card card-hover p-5 cursor-pointer group"
            @click="goToAddWechat(account)"
          >
            <div class="flex items-start space-x-3 mb-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {{ account.name.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-[var(--color-text)] truncate">{{ account.name }}</h3>
                <span class="badge-primary text-xs mt-1">{{ account.category }}</span>
              </div>
            </div>
            <p class="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">{{ account.description }}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-[var(--color-text-muted)]">{{ account.followers }} 关注</span>
              <button class="btn-primary text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                订阅
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示消息 -->
    <transition name="slide-in">
      <div v-if="message" :class="[
        'fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 font-medium',
        message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      ]">
        {{ message.text }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { rssMarketApi, bloggerApi } from '../api'

const router = useRouter()

// 状态
const feeds = ref<any[]>([])
const categories = ref<{ value: string; label: string }[]>([
  { value: 'all', label: '全部' },
  { value: 'trending', label: '热榜' },
  { value: 'blog', label: '博客' },
  { value: 'news', label: '新闻' },
  { value: 'tech', label: '科技' },
  { value: 'dev', label: '开发' },
  { value: 'media', label: '影音' },
  { value: 'software', label: '软件' },
  { value: 'general', label: '综合' }
])
const currentCategory = ref('all')
const searchQuery = ref('')
const loading = ref(false)
const subscribingId = ref<number | null>(null)
const subscribedIds = ref<number[]>([])
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

// 热门公众号数据
const popularWechatAccounts = ref([
  {
    name: '阮一峰的网络日志',
    description: '科技爱好者周刊，每周五发布，分享科技资讯和开源项目',
    category: '科技',
    followers: '100万+',
    url: 'https://mp.weixin.qq.com/s?__biz=MzI4NjAxNjY4Nw=='
  },
  {
    name: '机器之心',
    description: '专业的人工智能媒体和产业服务平台，关注 AI 前沿技术',
    category: 'AI',
    followers: '80万+',
    url: 'https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw=='
  },
  {
    name: 'InfoQ',
    description: '关注企业软件开发领域的变化与创新，为技术人提供深度内容',
    category: '技术',
    followers: '60万+',
    url: 'https://mp.weixin.qq.com/s?__biz=MjM5MDE0Mjc4MA=='
  },
  {
    name: '前端大全',
    description: '分享前端开发技术、框架、工具和最佳实践',
    category: '前端',
    followers: '50万+',
    url: 'https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA=='
  },
  {
    name: '稀土掘金',
    description: '面向全球中文开发者的技术内容分享与交流平台',
    category: '开发者',
    followers: '45万+',
    url: 'https://mp.weixin.qq.com/s?__biz=MzUxMzcxMzE5Ng=='
  },
  {
    name: '开源中国',
    description: '开源技术社区，分享开源项目、技术文章和行业动态',
    category: '开源',
    followers: '40万+',
    url: 'https://mp.weixin.qq.com/s?__biz=MzA5NzMwMjY3NQ=='
  },
  {
    name: '36氪',
    description: '关注互联网创业、科技和商业的深度媒体',
    category: '商业',
    followers: '200万+',
    url: 'https://mp.weixin.qq.com/s?__biz=MzI2NDk5NzA0Mw=='
  },
  {
    name: '虎嗅网',
    description: '聚焦科技与创新的商业媒体，提供深度商业分析',
    category: '商业',
    followers: '150万+',
    url: 'https://mp.weixin.qq.com/s?__biz=MzA5NDI1NjMzNw=='
  }
])

// 分类标签映射
const categoryLabels: Record<string, string> = {
  tech: '科技资讯',
  dev: '编程开发',
  ai: '人工智能',
  design: '设计创意',
  product: '产品运营',
  news: '新闻资讯',
  blog: '博客精选',
  general: '综合推荐',
  trending: '热门榜单',
  media: '影音娱乐',
  software: '软件应用',
  game: '游戏',
  video: '视频',
  podcast: '播客',
  social: '社交媒体',
  community: '技术社区',
  resource: '资源分享',
  magazine: '杂志期刊'
}

// 计算属性
const featuredFeeds = computed(() => {
  return feeds.value.filter(f => f.is_featured).slice(0, 4)
})

const filteredFeeds = computed(() => {
  let result = feeds.value

  if (currentCategory.value !== 'all') {
    result = result.filter(f => f.category === currentCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.description.toLowerCase().includes(query)
    )
  }

  return result
})

const categoryLabel = computed(() => {
  return categoryLabels[currentCategory.value] || 'RSS 源'
})

// 方法
const fetchFeeds = async () => {
  loading.value = true
  try {
    const res: any = await rssMarketApi.getAll({
      category: currentCategory.value === 'all' ? undefined : currentCategory.value,
      search: searchQuery.value || undefined
    })
    if (res.success) {
      feeds.value = res.data
    }
  } catch (error) {
    console.error('获取 RSS 市场失败:', error)
    showMessage('error', '获取 RSS 源列表失败')
  } finally {
    loading.value = false
  }
}

const fetchSubscribedIds = async () => {
  try {
    const res: any = await bloggerApi.getAll()
    if (res.success) {
      const rssUrls = res.data
        .filter((b: any) => b.type === 'rss')
        .map((b: any) => b.url)

      subscribedIds.value = feeds.value
        .filter(f => rssUrls.includes(f.url))
        .map(f => f.id)
    }
  } catch (error) {
    console.error('获取已订阅列表失败:', error)
  }
}

const isSubscribed = (id: number) => {
  return subscribedIds.value.includes(id)
}

const subscribe = async (feed: any) => {
  if (isSubscribed(feed.id)) return

  subscribingId.value = feed.id
  try {
    const res: any = await rssMarketApi.subscribe(feed.id)
    if (res.success) {
      subscribedIds.value.push(feed.id)
      feed.subscriber_count++
      showMessage('success', `已订阅「${feed.name}」`)
    }
  } catch (error: any) {
    showMessage('error', error.message || '订阅失败')
  } finally {
    subscribingId.value = null
  }
}

const selectCategory = (value: string) => {
  currentCategory.value = value
  fetchFeeds()
}

const handleSearch = () => {
  fetchFeeds()
}

const resetFilters = () => {
  currentCategory.value = 'all'
  searchQuery.value = ''
  fetchFeeds()
}

const getCategoryLabel = (category: string) => {
  return categoryLabels[category] || category
}

const goBack = () => {
  router.push('/bloggers')
}

// 跳转到添加公众号页面
const goToAddWechat = (account: any) => {
  router.push({
    path: '/bloggers',
    query: {
      action: 'add',
      type: 'wechat',
      name: account.name,
      url: account.url
    }
  })
}

const showMessage = (type: 'success' | 'error', text: string) => {
  message.value = { type, text }
  setTimeout(() => {
    message.value = null
  }, 3000)
}

onMounted(async () => {
  await fetchFeeds()
  await fetchSubscribedIds()
})
</script>

<style scoped>
/* 滑入动画 */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.3s ease;
}

.slide-in-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-in-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
