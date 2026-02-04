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
        <h1 class="text-2xl font-bold text-[var(--color-text)]">🐙 热门 GitHub 项目</h1>
      </div>
      <p class="text-[var(--color-text-secondary)] ml-11">发现优秀的开源项目，追踪技术趋势</p>
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
        placeholder="搜索项目..."
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

    <!-- 项目列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="project in filteredProjects"
        :key="project.name"
        class="card card-hover p-5 cursor-pointer group"
        @click="goToAddGithub(project)"
      >
        <!-- 头部 -->
        <div class="flex items-start space-x-3 mb-3">
          <div class="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
            <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-[var(--color-text)] truncate">{{ project.name }}</h3>
            <span class="badge-primary text-xs mt-1">{{ project.category }}</span>
          </div>
        </div>

        <!-- 描述 -->
        <p class="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-2">{{ project.description }}</p>

        <!-- 统计信息 -->
        <div class="flex items-center space-x-4 mb-3 text-xs text-[var(--color-text-muted)]">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            {{ project.stars }}
          </span>
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            {{ project.forks }}
          </span>
          <span v-if="project.language" class="flex items-center">
            <span class="w-2 h-2 rounded-full mr-1" :style="{ backgroundColor: project.languageColor }"></span>
            {{ project.language }}
          </span>
        </div>

        <!-- 底部 -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-[var(--color-text-muted)]">{{ project.owner }}</span>
          <div class="flex items-center space-x-2">
            <a
              :href="project.url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-secondary text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop
              title="在 GitHub 上查看"
            >
              <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              访问
            </a>
            <button
              class="btn-primary text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop="goToAddGithub(project)"
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
    <div v-if="!loading && filteredProjects.length === 0" class="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
      <div class="w-16 h-16 bg-[var(--color-bg-muted)] rounded-2xl flex items-center justify-center mb-4 text-3xl">
        📭
      </div>
      <p class="text-lg mb-4">没有找到匹配的项目</p>
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
  { value: 'frontend', label: '前端' },
  { value: 'backend', label: '后端' },
  { value: 'ai', label: 'AI/ML' },
  { value: 'tools', label: '工具' },
  { value: 'framework', label: '框架' },
  { value: 'mobile', label: '移动端' }
])

// 热门 GitHub 项目数据
const githubProjects = ref([
  {
    name: 'vuejs/core',
    description: '渐进式 JavaScript 框架，Vue.js 3 的核心代码',
    category: '前端',
    owner: 'Vue.js Team',
    stars: '47k+',
    forks: '8k+',
    language: 'TypeScript',
    languageColor: '#3178c6',
    url: 'https://github.com/vuejs/core',
    tags: ['vue', 'frontend', 'framework']
  },
  {
    name: 'facebook/react',
    description: '用于构建用户界面的 JavaScript 库，由 Facebook 维护',
    category: '前端',
    owner: 'Meta',
    stars: '230k+',
    forks: '48k+',
    language: 'JavaScript',
    languageColor: '#f1e05a',
    url: 'https://github.com/facebook/react',
    tags: ['react', 'frontend', 'ui']
  },
  {
    name: 'microsoft/TypeScript',
    description: 'TypeScript 是 JavaScript 的超集，添加了类型系统',
    category: '前端',
    owner: 'Microsoft',
    stars: '102k+',
    forks: '12k+',
    language: 'TypeScript',
    languageColor: '#3178c6',
    url: 'https://github.com/microsoft/TypeScript',
    tags: ['typescript', 'javascript', 'compiler']
  },
  {
    name: 'tailwindlabs/tailwindcss',
    description: '实用优先的 CSS 框架，快速构建现代网站',
    category: '前端',
    owner: 'Tailwind Labs',
    stars: '82k+',
    forks: '4k+',
    language: 'CSS',
    languageColor: '#563d7c',
    url: 'https://github.com/tailwindlabs/tailwindcss',
    tags: ['css', 'frontend', 'design']
  },
  {
    name: 'nodejs/node',
    description: 'Node.js JavaScript 运行时，基于 Chrome V8 引擎',
    category: '后端',
    owner: 'OpenJS Foundation',
    stars: '108k+',
    forks: '29k+',
    language: 'JavaScript',
    languageColor: '#f1e05a',
    url: 'https://github.com/nodejs/node',
    tags: ['nodejs', 'backend', 'runtime']
  },
  {
    name: 'nestjs/nest',
    description: '渐进式 Node.js 框架，用于构建高效、可扩展的服务器端应用',
    category: '后端',
    owner: 'NestJS',
    stars: '66k+',
    forks: '7k+',
    language: 'TypeScript',
    languageColor: '#3178c6',
    url: 'https://github.com/nestjs/nest',
    tags: ['nodejs', 'backend', 'framework']
  },
  {
    name: 'golang/go',
    description: 'Go 语言开源项目，简单、高效、并发的编程语言',
    category: '后端',
    owner: 'Google',
    stars: '123k+',
    forks: '16k+',
    language: 'Go',
    languageColor: '#00ADD8',
    url: 'https://github.com/golang/go',
    tags: ['go', 'backend', 'language']
  },
  {
    name: 'rust-lang/rust',
    description: 'Rust 语言， empowering everyone to build reliable and efficient software',
    category: '后端',
    owner: 'Rust Team',
    stars: '95k+',
    forks: '12k+',
    language: 'Rust',
    languageColor: '#dea584',
    url: 'https://github.com/rust-lang/rust',
    tags: ['rust', 'language', 'systems']
  },
  {
    name: 'openai/openai-cookbook',
    description: 'OpenAI API 使用示例和指南，包含 GPT-4 最佳实践',
    category: 'AI/ML',
    owner: 'OpenAI',
    stars: '60k+',
    forks: '9k+',
    language: 'Python',
    languageColor: '#3572A5',
    url: 'https://github.com/openai/openai-cookbook',
    tags: ['ai', 'openai', 'gpt']
  },
  {
    name: 'microsoft/DeepSpeed',
    description: '深度学习优化库，让训练大型模型更快、更高效',
    category: 'AI/ML',
    owner: 'Microsoft',
    stars: '35k+',
    forks: '4k+',
    language: 'Python',
    languageColor: '#3572A5',
    url: 'https://github.com/microsoft/DeepSpeed',
    tags: ['ai', 'deep-learning', 'optimization']
  },
  {
    name: 'huggingface/transformers',
    description: '最先进的自然语言处理库，支持 BERT、GPT 等模型',
    category: 'AI/ML',
    owner: 'Hugging Face',
    stars: '130k+',
    forks: '26k+',
    language: 'Python',
    languageColor: '#3572A5',
    url: 'https://github.com/huggingface/transformers',
    tags: ['nlp', 'ai', 'ml']
  },
  {
    name: 'vercel/next.js',
    description: 'React 框架，用于生产环境的 React 应用开发',
    category: '框架',
    owner: 'Vercel',
    stars: '123k+',
    forks: '26k+',
    language: 'TypeScript',
    languageColor: '#3178c6',
    url: 'https://github.com/vercel/next.js',
    tags: ['react', 'framework', 'fullstack']
  },
  {
    name: 'vitejs/vite',
    description: '下一代前端工具链，极速的开发服务器和构建工具',
    category: '工具',
    owner: 'Evan You',
    stars: '68k+',
    forks: '6k+',
    language: 'TypeScript',
    languageColor: '#3178c6',
    url: 'https://github.com/vitejs/vite',
    tags: ['build-tool', 'frontend', 'dev-server']
  },
  {
    name: 'facebook/react-native',
    description: '使用 React 构建原生应用的框架',
    category: '移动端',
    owner: 'Meta',
    stars: '118k+',
    forks: '24k+',
    language: 'JavaScript',
    languageColor: '#f1e05a',
    url: 'https://github.com/facebook/react-native',
    tags: ['mobile', 'react', 'ios', 'android']
  },
  {
    name: 'flutter/flutter',
    description: 'Google 的 UI 工具包，用于构建跨平台应用',
    category: '移动端',
    owner: 'Google',
    stars: '162k+',
    forks: '27k+',
    language: 'Dart',
    languageColor: '#00B4AB',
    url: 'https://github.com/flutter/flutter',
    tags: ['mobile', 'dart', 'cross-platform']
  },
  {
    name: 'rustdesk/rustdesk',
    description: '开源远程桌面软件，TeamViewer 的替代品',
    category: '工具',
    owner: 'RustDesk',
    stars: '72k+',
    forks: '8k+',
    language: 'Rust',
    languageColor: '#dea584',
    url: 'https://github.com/rustdesk/rustdesk',
    tags: ['remote-desktop', 'tool', 'rust']
  }
])

// 计算属性 - 筛选后的项目
const filteredProjects = computed(() => {
  let result = githubProjects.value

  // 按分类筛选
  if (currentCategory.value !== 'all') {
    const categoryMap: Record<string, string[]> = {
      'frontend': ['前端'],
      'backend': ['后端'],
      'ai': ['AI/ML'],
      'tools': ['工具'],
      'framework': ['框架'],
      'mobile': ['移动端']
    }
    const targetCategories = categoryMap[currentCategory.value] || [currentCategory.value]
    result = result.filter(project => targetCategories.includes(project.category))
  }

  // 按搜索词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(project =>
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.tags.some(tag => tag.toLowerCase().includes(query))
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

// 跳转到添加 GitHub 页面
const goToAddGithub = (project: any) => {
  router.push({
    path: '/bloggers',
    query: {
      action: 'add',
      type: 'github',
      name: project.name,
      url: project.url
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
