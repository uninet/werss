<template>
  <nav class="mobile-nav fixed bottom-0 left-0 right-0 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border)] z-50 safe-bottom md:hidden">
    <div class="flex items-center justify-around py-1 px-2">
      <!-- 主导航项 -->
      <router-link
        v-for="item in mainNavItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center py-2 px-3 min-w-[64px] touch-target rounded-lg transition-colors duration-200"
        :class="isActive(item.path) ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'text-[var(--color-text-muted)]'"
      >
        <component :is="item.icon" class="w-6 h-6" />
        <span class="text-[10px] mt-0.5 font-medium">{{ item.shortName }}</span>
      </router-link>

      <!-- 更多菜单按钮 -->
      <button
        @click="showMoreMenu = true"
        class="flex flex-col items-center py-2 px-3 min-w-[64px] touch-target rounded-lg transition-colors duration-200 text-[var(--color-text-muted)]"
        :class="{ 'text-[var(--color-primary)] bg-[var(--color-primary)]/5': isMoreMenuActive }"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <span class="text-[10px] mt-0.5 font-medium">更多</span>
      </button>
    </div>

    <!-- 更多菜单弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showMoreMenu"
          class="fixed inset-0 bg-black/50 z-50 md:hidden"
          @click="showMoreMenu = false"
        >
          <div
            class="absolute bottom-20 left-4 right-4 bg-[var(--color-bg-elevated)] rounded-2xl shadow-2xl p-4 max-h-[70vh] overflow-y-auto"
            @click.stop
          >
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border-light)]">
              <h3 class="text-sm font-semibold text-[var(--color-text)]">更多功能</h3>
              <button
                @click="showMoreMenu = false"
                class="p-1.5 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
              >
                <svg class="w-5 h-5 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-4 gap-3">
              <router-link
                v-for="item in moreNavItems"
                :key="item.path"
                :to="item.path"
                class="flex flex-col items-center p-3 rounded-xl hover:bg-[var(--color-bg-muted)] transition-colors"
                :class="isActive(item.path) ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'text-[var(--color-text-secondary)]'"
                @click="showMoreMenu = false"
              >
                <component :is="item.icon" class="w-6 h-6 mb-1.5" />
                <span class="text-xs text-center">{{ item.shortName }}</span>
              </router-link>
            </div>

            <!-- 用户信息 -->
            <div class="mt-4 pt-4 border-t border-[var(--color-border-light)]">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-medium text-sm">
                  {{ userInitials }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-[var(--color-text)] truncate">{{ username }}</p>
                  <p class="text-xs text-[var(--color-text-muted)]">已登录</p>
                </div>
                <router-link
                  to="/settings"
                  class="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
                  @click="showMoreMenu = false"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showMoreMenu = ref(false)

// 获取用户信息
const username = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.username || '用户'
    } catch {
      return '用户'
    }
  }
  return '用户'
})

const userInitials = computed(() => username.value.charAt(0).toUpperCase())

// 图标组件
const HomeIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
])

const DocumentTextIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
])

const UsersIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
])

const RssIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 11a9 9 0 0 1 9 9' }),
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 4a16 16 0 0 1 16 16' }),
  h('circle', { cx: '5', cy: '19', r: '1', fill: 'currentColor' })
])

const ChatIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' })
])

const GithubIcon = () => h('svg', { class: 'w-6 h-6', fill: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'fill-rule': 'evenodd', 'clip-rule': 'evenodd', d: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' })
])

const ZhihuIcon = () => h('svg', { class: 'w-6 h-6', fill: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { d: 'M5.721 0C2.251 0 0 2.25 0 5.719V18.28C0 21.751 2.252 24 5.721 24h12.56C21.751 24 24 21.75 24 18.281V5.72C24 2.249 21.75 0 18.281 0zm1.964 4.078c-.271.73-.5 1.434-.68 2.11h4.587c.545-.006.445 1.168.445 1.171H9.384a58.104 58.104 0 01-.112 3.797h2.726c.388.023.393 1.251.393 1.251H9.183c.062 1.191.328 2.559.837 4.097.533 1.613 1.364 3.251 2.644 4.837 1.18 1.465 2.713 2.759 4.777 3.688.378.178.653.32.84.452-.403.28-1.689.996-2.968 1.377-.8.24-1.658.297-2.53.297-.873 0-1.73-.057-2.53-.297-1.279-.381-2.565-1.097-2.968-1.377.187-.132.462-.274.84-.452 2.064-.929 3.597-2.223 4.777-3.688 1.28-1.586 2.111-3.224 2.644-4.837.509-1.538.775-2.906.837-4.097H7.085c0-.001.005-1.228.393-1.251h2.726a58.104 58.104 0 01-.112-3.797h2.253c0-.003-.1-1.177.445-1.171h4.587c-.18-.676-.409-1.38-.68-2.11H6.685z' })
])

// 主导航项（底部显示）
const mainNavItems = [
  { path: '/', name: '首页', shortName: '首页', icon: HomeIcon },
  { path: '/contents', name: '内容', shortName: '内容', icon: DocumentTextIcon },
  { path: '/bloggers', name: '博主', shortName: '博主', icon: UsersIcon },
]

// 更多菜单项
const moreNavItems = [
  { path: '/rss-market', name: 'RSS市场', shortName: 'RSS市场', icon: RssIcon },
  { path: '/popular-wechat', name: '公众号', shortName: '公众号', icon: ChatIcon },
  { path: '/popular-github', name: 'GitHub', shortName: 'GitHub', icon: GithubIcon },
  { path: '/popular-zhihu', name: '知乎', shortName: '知乎', icon: ZhihuIcon },
]

// 判断是否当前路由
const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path === path || route.path.startsWith(path + '/')
}

// 更多菜单是否激活
const isMoreMenuActive = computed(() => {
  return moreNavItems.some(item => isActive(item.path))
})
</script>

<style scoped>
.mobile-nav {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.touch-target {
  min-width: 44px;
  min-height: 44px;
}

.safe-bottom {
  padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px);
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
</style>
