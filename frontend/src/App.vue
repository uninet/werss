<template>
  <div class="min-h-screen bg-[var(--color-bg)] flex flex-col md:flex-row">
    <!-- 桌面端：侧边导航栏 -->
    <aside
      v-if="!isLoginPage"
      class="hidden md:flex w-64 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)] flex-col fixed h-full z-50"
    >
      <!-- Logo -->
      <div class="p-6 border-b border-[var(--color-border-light)]">
        <router-link to="/" class="flex items-center space-x-3 group">
          <div class="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20 group-hover:shadow-xl group-hover:shadow-[var(--color-accent)]/30 transition-all duration-300">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span class="text-lg font-bold text-[var(--color-text)] tracking-tight">RSS Flow</span>
            <p class="text-xs text-[var(--color-text-muted)]">优雅阅读，从这里开始</p>
          </div>
        </router-link>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="$route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/') ? 'nav-link-active' : 'nav-link-inactive'"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
          <span v-if="item.badge" class="ml-auto badge-accent text-xs px-2 py-0.5">{{ item.badge }}</span>
        </router-link>

        <!-- 分隔线 -->
        <div class="my-4 border-t border-[var(--color-border-light)]"></div>

        <!-- RSS 市场入口 -->
        <router-link
          to="/rss-market"
          :class="$route.path === '/rss-market' ? 'nav-link-active' : 'nav-link-inactive'"
        >
          <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 11a9 9 0 0 1 9 9" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4a16 16 0 0 1 16 16" />
            <circle cx="5" cy="19" r="1" fill="currentColor" />
          </svg>
          RSS 市场
          <span class="ml-auto badge-primary text-xs px-2 py-0.5">360+</span>
        </router-link>

        <!-- 热门公众号入口 -->
        <router-link
          to="/popular-wechat"
          :class="$route.path === '/popular-wechat' ? 'nav-link-active' : 'nav-link-inactive'"
        >
          <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          热门公众号
          <span class="ml-auto badge-accent text-xs px-2 py-0.5">Hot</span>
        </router-link>

        <!-- 热门 GitHub 项目入口 -->
        <router-link
          to="/popular-github"
          :class="$route.path === '/popular-github' ? 'nav-link-active' : 'nav-link-inactive'"
        >
          <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          热门 GitHub
          <span class="ml-auto badge-primary text-xs px-2 py-0.5">Dev</span>
        </router-link>

        <!-- 热门知乎博主入口 -->
        <router-link
          to="/popular-zhihu"
          :class="$route.path === '/popular-zhihu' ? 'nav-link-active' : 'nav-link-inactive'"
        >
          <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.721 0C2.251 0 0 2.25 0 5.719V18.28C0 21.751 2.252 24 5.721 24h12.56C21.751 24 24 21.75 24 18.281V5.72C24 2.249 21.75 0 18.281 0zm1.964 4.078c-.271.73-.5 1.434-.68 2.11h4.587c.545-.006.445 1.168.445 1.171H9.384a58.104 58.104 0 01-.112 3.797h2.726c.388.023.393 1.251.393 1.251H9.183c.062 1.191.328 2.559.837 4.097.533 1.613 1.364 3.251 2.644 4.837 1.18 1.465 2.713 2.759 4.777 3.688.378.178.653.32.84.452-.403.28-1.689.996-2.968 1.377-.8.24-1.658.297-2.53.297-.873 0-1.73-.057-2.53-.297-1.279-.381-2.565-1.097-2.968-1.377.187-.132.462-.274.84-.452 2.064-.929 3.597-2.223 4.777-3.688 1.28-1.586 2.111-3.224 2.644-4.837.509-1.538.775-2.906.837-4.097H7.085c0-.001.005-1.228.393-1.251h2.726a58.104 58.104 0 01-.112-3.797h2.253c0-.003-.1-1.177.445-1.171h4.587c-.18-.676-.409-1.38-.68-2.11H6.685z"/>
          </svg>
          热门知乎
          <span class="ml-auto badge-primary text-xs px-2 py-0.5">Q&A</span>
        </router-link>
      </nav>

      <!-- 底部用户信息 -->
      <div class="p-4 border-t border-[var(--color-border-light)]">
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-medium text-sm">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-[var(--color-text)] truncate">{{ username }}</p>
            <p class="text-xs text-[var(--color-text-muted)]">已登录</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <router-link to="/settings" class="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>设置</span>
          </router-link>
          <button @click="handleLogout" class="flex items-center justify-center px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- 移动端：底部导航 -->
    <MobileNav v-if="!isLoginPage" />

    <!-- 主内容区 -->
    <main
      :class="[
        'flex-1 transition-all duration-300',
        isLoginPage ? '' : 'md:ml-64 pb-16 md:pb-0'
      ]"
    >
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores'
import MobileNav from './components/mobile/MobileNav.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 判断是否登录页面
const isLoginPage = computed(() => route.path === '/login')

// 获取用户信息
const username = computed(() => {
  return authStore.user?.username || '用户'
})

// 用户首字母
const userInitials = computed(() => {
  return username.value.charAt(0).toUpperCase()
})

// 退出登录
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// 初始化时检查登录状态
onMounted(() => {
  authStore.checkAuth()
})

// 图标组件
const HomeIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
])

const DocumentTextIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
])

const UsersIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
])

// 导航项
const navItems = ref([
  { path: '/', name: '首页', icon: HomeIcon },
  { path: '/contents', name: '内容列表', icon: DocumentTextIcon, badge: 'New' },
  { path: '/bloggers', name: '频道管理', icon: UsersIcon },
])
</script>

<style scoped>
/* 侧边栏滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}
</style>
