<template>
  <div class="p-8 max-w-7xl mx-auto">
    <!-- 页面标题 -->
    <div class="mb-8">
      <div class="flex items-center space-x-3 mb-2">
        <button
          @click="goBack"
          class="p-2 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors"
        >
          <svg class="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-[var(--color-text)]">📱 热门公众号</h1>
      </div>
      <p class="text-[var(--color-text-secondary)] ml-11">精选优质微信公众号，一键订阅获取最新内容</p>
    </div>

    <!-- 分类筛选 -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="cat in categories"
        :key="cat.value"
        :class="currentCategory === cat.value ? 'btn-primary' : 'btn-secondary'"
        @click="selectCategory(cat.value)"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="relative mb-8">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索公众号..."
        class="input w-full pl-11"
        @input="handleSearch"
      />
      <svg class="w-5 h-5 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent"></div>
      <p class="text-[var(--color-text-muted)] mt-4">加载中...</p>
    </div>

    <!-- 公众号列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="account in filteredAccounts"
        :key="account.name"
        class="card card-hover p-5 cursor-pointer group"
        @click="goToAddWechat(account)"
      >
        <!-- 头部 -->
        <div class="flex items-start space-x-3 mb-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {{ account.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-[var(--color-text)] truncate">{{ account.name }}</h3>
            <span class="badge-primary text-xs mt-1">{{ account.category }}</span>
          </div>
        </div>

        <!-- 描述 -->
        <p class="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">{{ account.description }}</p>

        <!-- 底部信息 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 text-xs text-[var(--color-text-muted)]">
            <span class="flex items-center">
              <svg class="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {{ account.followers }}
            </span>
            <span v-if="account.updateFrequency" class="flex items-center">
              <svg class="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ account.updateFrequency }}
            </span>
          </div>

          <!-- 按钮组 -->
          <div class="flex items-center space-x-2">
            <a
              :href="account.url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-secondary text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop
              title="在微信中查看"
            >
              <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              访问
            </a>
            <button
              class="btn-primary text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop="goToAddWechat(account)"
            >
              <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              订阅
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredAccounts.length === 0" class="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
      <div class="w-16 h-16 bg-[var(--color-bg-muted)] rounded-2xl flex items-center justify-center mb-4 text-3xl">
        📭
      </div>
      <p class="text-lg mb-4">没有找到匹配的公众号</p>
      <button @click="resetFilters" class="btn-primary">重置筛选</button>
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

const router = useRouter()

// 状态
const loading = ref(false)
const currentCategory = ref('all')
const searchQuery = ref('')
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

// 分类
const categories = ref([
  { value: 'all', label: '全部' },
  { value: 'tech', label: '科技' },
  { value: 'ai', label: 'AI' },
  { value: 'dev', label: '开发' },
  { value: 'business', label: '商业' },
  { value: 'news', label: '资讯' },
  { value: 'life', label: '生活' }
])

// 热门公众号数据
const wechatAccounts = ref([
  {
    name: '阮一峰的网络日志',
    description: '科技爱好者周刊，每周五发布，分享科技资讯和开源项目',
    category: '科技',
    followers: '100万+',
    updateFrequency: '周刊',
    url: 'https://mp.weixin.qq.com/s?__biz=MzI4NjAxNjY4Nw==',
    tags: ['科技', '开源', '前端']
  },
  {
    name: '机器之心',
    description: '专业的人工智能媒体和产业服务平台，关注 AI 前沿技术',
    category: 'AI',
    followers: '80万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==',
    tags: ['AI', '机器学习', '深度学习']
  },
  {
    name: 'InfoQ',
    description: '关注企业软件开发领域的变化与创新，为技术人提供深度内容',
    category: '开发',
    followers: '60万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MjM5MDE0Mjc4MA==',
    tags: ['架构', '后端', '技术']
  },
  {
    name: '前端大全',
    description: '分享前端开发技术、框架、工具和最佳实践',
    category: '开发',
    followers: '50万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==',
    tags: ['前端', 'JavaScript', 'Vue']
  },
  {
    name: '稀土掘金',
    description: '面向全球中文开发者的技术内容分享与交流平台',
    category: '开发',
    followers: '45万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MzUxMzcxMzE5Ng==',
    tags: ['开发者', '技术', '社区']
  },
  {
    name: '开源中国',
    description: '开源技术社区，分享开源项目、技术文章和行业动态',
    category: '开发',
    followers: '40万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MzA5NzMwMjY3NQ==',
    tags: ['开源', 'Linux', 'GitHub']
  },
  {
    name: '36氪',
    description: '关注互联网创业、科技和商业的深度媒体',
    category: '商业',
    followers: '200万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MzI2NDk5NzA0Mw==',
    tags: ['创业', '投资', '商业']
  },
  {
    name: '虎嗅网',
    description: '聚焦科技与创新的商业媒体，提供深度商业分析',
    category: '商业',
    followers: '150万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MzA5NDI1NjMzNw==',
    tags: ['商业', '科技', '创新']
  },
  {
    name: '晚点LatePost',
    description: '专注商业报道，提供深度商业故事和分析',
    category: '商业',
    followers: '80万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MzU3MzQ4NzE1OA==',
    tags: ['商业', '深度报道']
  },
  {
    name: '极客公园',
    description: '关注科技创新，报道前沿科技产品和公司',
    category: '科技',
    followers: '70万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MzA5OTY0MDgzNA==',
    tags: ['科技', '产品', '创新']
  },
  {
    name: '量子位',
    description: '专注于人工智能及前沿科技领域的产业服务平台',
    category: 'AI',
    followers: '65万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==',
    tags: ['AI', '量子计算', '前沿科技']
  },
  {
    name: '新智元',
    description: '人工智能领域领先的产业服务平台',
    category: 'AI',
    followers: '55万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==',
    tags: ['AI', '产业', '技术']
  },
  {
    name: 'CSDN',
    description: '专业开发者社区，分享技术文章和编程经验',
    category: '开发',
    followers: '100万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MjM5MjAwODM4MA==',
    tags: ['编程', '开发者', '技术']
  },
  {
    name: 'GitHubDaily',
    description: '分享 GitHub 优质开源项目和开发工具',
    category: '开发',
    followers: '35万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MzA5MzYyNzA0MQ==',
    tags: ['GitHub', '开源', '工具']
  },
  {
    name: 'TechWeb',
    description: '提供互联网科技新闻和深度报道',
    category: '资讯',
    followers: '30万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MjM5MzM1NzIyMA==',
    tags: ['科技新闻', '互联网']
  },
  {
    name: '果壳',
    description: '科技有意思，用有趣的方式传播科学知识',
    category: '科技',
    followers: '300万+',
    updateFrequency: '日更',
    url: 'https://mp.weixin.qq.com/s?__biz=MzA5OTQyMDgyOQ==',
    tags: ['科普', '科学', '有趣']
  }
])

// 计算属性 - 筛选后的公众号
const filteredAccounts = computed(() => {
  let result = wechatAccounts.value

  // 按分类筛选
  if (currentCategory.value !== 'all') {
    const categoryMap: Record<string, string[]> = {
      'tech': ['科技'],
      'ai': ['AI'],
      'dev': ['开发'],
      'business': ['商业'],
      'news': ['资讯'],
      'life': ['生活']
    }
    const targetCategories = categoryMap[currentCategory.value] || [currentCategory.value]
    result = result.filter(account => targetCategories.includes(account.category))
  }

  // 按搜索词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(account =>
      account.name.toLowerCase().includes(query) ||
      account.description.toLowerCase().includes(query) ||
      account.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return result
})

// 方法
const selectCategory = (value: string) => {
  currentCategory.value = value
}

const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

const resetFilters = () => {
  currentCategory.value = 'all'
  searchQuery.value = ''
}

const goBack = () => {
  router.push('/')
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

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
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
