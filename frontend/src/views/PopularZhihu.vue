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
        <h1 class="text-2xl font-bold text-[var(--color-text)]">📚 热门知乎博主</h1>
      </div>
      <p class="text-[var(--color-text-secondary)] ml-11">发现优质内容创作者，获取深度知识见解</p>
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
        placeholder="搜索博主..."
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

    <!-- 博主列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="blogger in filteredBloggers"
        :key="blogger.name"
        class="card card-hover p-5 cursor-pointer group"
        @click="goToAddZhihu(blogger)"
      >
        <!-- 头部 -->
        <div class="flex items-start space-x-3 mb-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {{ blogger.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-[var(--color-text)] truncate">{{ blogger.name }}</h3>
            <span class="badge-primary text-xs mt-1">{{ blogger.category }}</span>
          </div>
        </div>

        <!-- 简介 -->
        <p class="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">{{ blogger.bio }}</p>

        <!-- 统计信息 -->
        <div class="flex items-center space-x-4 mb-3 text-xs text-[var(--color-text-muted)]">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ blogger.followers }}
          </span>
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            {{ blogger.answers }} 回答
          </span>
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            {{ blogger.agrees }}
          </span>
        </div>

        <!-- 底部 -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-[var(--color-text-muted)] line-clamp-1 flex-1 mr-2">{{ blogger.slogan }}</span>
          <div class="flex items-center space-x-2 flex-shrink-0">
            <a
              :href="blogger.url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-secondary text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop
              title="在知乎上查看"
            >
              <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              访问
            </a>
            <button
              class="btn-primary text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop="goToAddZhihu(blogger)"
            >
              <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              追踪
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredBloggers.length === 0" class="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
      <div class="w-16 h-16 bg-[var(--color-bg-muted)] rounded-2xl flex items-center justify-center mb-4 text-3xl">
        📭
      </div>
      <p class="text-lg mb-4">没有找到匹配的博主</p>
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
  { value: 'finance', label: '财经' },
  { value: 'life', label: '生活' },
  { value: 'education', label: '教育' },
  { value: 'career', label: '职场' }
])

// 热门知乎博主数据
const zhihuBloggers = ref([
  {
    name: '半佛仙人',
    bio: '一个温柔又暴躁的公众号：半佛仙人。',
    category: '财经',
    followers: '300万+',
    answers: '1,200+',
    agrees: '500万+',
    slogan: '用经济学的角度解构世界',
    url: 'https://www.zhihu.com/people/banfoyou',
    tags: ['财经', '商业', '互联网']
  },
  {
    name: '张佳玮',
    bio: '写字的，篮球评论员，出版过几本书。',
    category: '生活',
    followers: '280万+',
    answers: '8,000+',
    agrees: '800万+',
    slogan: '用文字记录生活的美好',
    url: 'https://www.zhihu.com/people/zhang-jia-wei',
    tags: ['文学', '篮球', '生活']
  },
  {
    name: '李永乐老师',
    bio: '高中数学、物理老师，科普视频创作者。',
    category: '教育',
    followers: '450万+',
    answers: '500+',
    agrees: '600万+',
    slogan: '用简单的方式讲复杂的知识',
    url: 'https://www.zhihu.com/people/li-yong-le-31',
    tags: ['教育', '科普', '数学']
  },
  {
    name: '轮子哥',
    bio: '微软工程师，编程技术分享者。',
    category: '科技',
    followers: '150万+',
    answers: '15,000+',
    agrees: '400万+',
    slogan: '代码改变世界的微软工程师',
    url: 'https://www.zhihu.com/people/vczh',
    tags: ['编程', '技术', '微软']
  },
  {
    name: '曾博',
    bio: '前阿里巴巴工程师，现创业者。',
    category: '职场',
    followers: '120万+',
    answers: '3,000+',
    agrees: '300万+',
    slogan: '分享职场经验与人生感悟',
    url: 'https://www.zhihu.com/people/zengbo',
    tags: ['职场', '互联网', '创业']
  },
  {
    name: '马前卒',
    bio: '媒体人，《睡前消息》主持人。',
    category: '财经',
    followers: '200万+',
    answers: '2,500+',
    agrees: '450万+',
    slogan: '睡前消息，了解今日世界',
    url: 'https://www.zhihu.com/people/ma-qian-zu',
    tags: ['新闻', '财经', '时政']
  },
  {
    name: '温义飞',
    bio: '经济学博士，财经评论员。',
    category: '财经',
    followers: '180万+',
    answers: '1,800+',
    agrees: '350万+',
    slogan: '用经济学思维理解世界',
    url: 'https://www.zhihu.com/people/wen-yi-fei',
    tags: ['经济', '金融', '投资']
  },
  {
    name: '采铜',
    bio: '心理学博士，学习科学专家。',
    category: '教育',
    followers: '160万+',
    answers: '2,200+',
    agrees: '380万+',
    slogan: '深度学习的探索者',
    url: 'https://www.zhihu.com/people/cai-tong',
    tags: ['心理学', '学习', '认知']
  },
  {
    name: '老石',
    bio: '芯片工程师，FPGA技术专家。',
    category: '科技',
    followers: '90万+',
    answers: '1,500+',
    agrees: '200万+',
    slogan: '芯片行业的深度观察者',
    url: 'https://www.zhihu.com/people/lao-shi',
    tags: ['芯片', '硬件', 'FPGA']
  },
  {
    name: '梁边妖',
    bio: '互联网产品经理，生活方式博主。',
    category: '生活',
    followers: '220万+',
    answers: '3,500+',
    agrees: '500万+',
    slogan: '分享有趣的生活方式',
    url: 'https://www.zhihu.com/people/liang-bian-yao',
    tags: ['生活', '产品', '互联网']
  },
  {
    name: '罗翔',
    bio: '中国政法大学刑事司法学院教授。',
    category: '教育',
    followers: '600万+',
    answers: '800+',
    agrees: '1,000万+',
    slogan: '刑法知识的普及者',
    url: 'https://www.zhihu.com/people/luo-xiang',
    tags: ['法律', '刑法', '教育']
  },
  {
    name: 'warfalcon',
    bio: '时间管理专家，效率工具研究者。',
    category: '职场',
    followers: '140万+',
    answers: '4,000+',
    agrees: '320万+',
    slogan: '让每个人都能高效工作',
    url: 'https://www.zhihu.com/people/warfalcon',
    tags: ['效率', '时间管理', '工具']
  }
])

// 计算属性 - 筛选后的博主
const filteredBloggers = computed(() => {
  let result = zhihuBloggers.value

  // 按分类筛选
  if (currentCategory.value !== 'all') {
    const categoryMap: Record<string, string[]> = {
      'tech': ['科技'],
      'finance': ['财经'],
      'life': ['生活'],
      'education': ['教育'],
      'career': ['职场']
    }
    const targetCategories = categoryMap[currentCategory.value] || [currentCategory.value]
    result = result.filter(blogger => targetCategories.includes(blogger.category))
  }

  // 按搜索词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(blogger =>
      blogger.name.toLowerCase().includes(query) ||
      blogger.bio.toLowerCase().includes(query) ||
      blogger.tags.some(tag => tag.toLowerCase().includes(query))
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

// 跳转到添加知乎页面
const goToAddZhihu = (blogger: any) => {
  router.push({
    path: '/bloggers',
    query: {
      action: 'add',
      type: 'zhihu',
      name: blogger.name,
      url: blogger.url
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
