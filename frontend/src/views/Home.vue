<template>
  <div class="p-8 space-y-8">
    <!-- 欢迎横幅 -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-accent)] text-white">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-[var(--color-accent)]/20 rounded-full blur-3xl"></div>
      
      <div class="relative px-8 py-10">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 class="text-3xl font-bold mb-3">欢迎回来 👋</h1>
            <p class="text-white/80 text-base max-w-lg">RSS Flow 帮助你聚合和管理所有感兴趣的 RSS 源，让阅读回归纯粹。</p>
          </div>
          <div class="flex items-center space-x-4">
            <span class="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
              <span class="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              系统运行正常
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card card-hover p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[var(--color-text-muted)] font-medium">订阅博主</p>
            <p class="text-3xl font-bold text-[var(--color-text)] mt-2">{{ stats.bloggers?.total || 0 }}</p>
          </div>
          <div class="w-14 h-14 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center">
            <svg class="w-7 h-7 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="badge-primary">{{ stats.bloggers?.active_count || 0 }} 活跃</span>
        </div>
      </div>

      <div class="card card-hover p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[var(--color-text-muted)] font-medium">总文章数</p>
            <p class="text-3xl font-bold text-[var(--color-text)] mt-2">{{ stats.contents?.total || 0 }}</p>
          </div>
          <div class="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center">
            <svg class="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="badge-accent">+{{ stats.contents?.today_count || 0 }} 今日</span>
        </div>
      </div>

      <div class="card card-hover p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[var(--color-text-muted)] font-medium">未读文章</p>
            <p class="text-3xl font-bold text-[var(--color-text)] mt-2">{{ stats.contents?.unread_count || 0 }}</p>
          </div>
          <div class="w-14 h-14 bg-[var(--color-accent)]/10 rounded-2xl flex items-center justify-center">
            <svg class="w-7 h-7 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/contents" class="text-sm text-[var(--color-accent)] hover:underline font-medium">
            去阅读 →
          </router-link>
        </div>
      </div>

      <div class="card card-hover p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[var(--color-text-muted)] font-medium">邮件推送</p>
            <p class="text-3xl font-bold text-[var(--color-text)] mt-2">{{ stats.emails?.total_sent || 0 }}</p>
          </div>
          <div class="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center">
            <svg class="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="badge-primary">{{ stats.emails?.success_count || 0 }} 成功</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 最近更新 -->
      <div class="lg:col-span-2 card">
        <div class="card-header">
          <div>
            <h2 class="text-lg font-semibold text-[var(--color-text)]">最近更新</h2>
            <p class="text-sm text-[var(--color-text-muted)] mt-1">来自你关注的博主</p>
          </div>
          <router-link to="/contents" class="btn-secondary text-sm">
            查看全部
          </router-link>
        </div>
        <div class="card-body p-0">
          <div v-if="recentContents.length === 0" class="p-8 text-center">
            <div class="w-16 h-16 bg-[var(--color-bg-muted)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p class="text-[var(--color-text-muted)]">暂无内容</p>
            <router-link to="/bloggers" class="btn-primary mt-4 inline-flex">
              添加博主
            </router-link>
          </div>
          <div v-else class="divide-y divide-[var(--color-border-light)]">
            <div
              v-for="content in recentContents.slice(0, 5)"
              :key="content.id"
              class="p-5 hover:bg-[var(--color-bg-muted)]/50 transition-colors group"
            >
              <div class="flex items-start space-x-4">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {{ content.blogger_name?.charAt(0) || '?' }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-[var(--color-text)] mb-1 line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">
                    <router-link :to="`/article/${content.id}`">
                      {{ content.title }}
                    </router-link>
                  </h3>
                  <div class="flex items-center space-x-3 text-sm text-[var(--color-text-muted)]">
                    <span>{{ content.blogger_name }}</span>
                    <span class="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
                    <span>{{ formatDate(content.published_at) }}</span>
                  </div>
                </div>
                <span
                  v-if="!content.is_notified"
                  class="w-2 h-2 rounded-full bg-[var(--color-accent)] flex-shrink-0 mt-2"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 博主列表 -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="text-lg font-semibold text-[var(--color-text)]">我的订阅</h2>
            <p class="text-sm text-[var(--color-text-muted)] mt-1">{{ bloggers.length }} 位博主</p>
          </div>
        </div>
        <div class="card-body p-0">
          <div v-if="bloggers.length === 0" class="p-6 text-center">
            <p class="text-[var(--color-text-muted)] text-sm">还没有添加博主</p>
          </div>
          <div v-else class="divide-y divide-[var(--color-border-light)]">
            <div
              v-for="blogger in bloggers.slice(0, 6)"
              :key="blogger.id"
              class="p-4 flex items-center space-x-3 hover:bg-[var(--color-bg-muted)]/50 transition-colors"
            >
              <div class="w-10 h-10 rounded-xl bg-[var(--color-bg-muted)] flex items-center justify-center text-lg">
                {{ getTypeIcon(blogger.type) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-[var(--color-text)] truncate">{{ blogger.name }}</p>
                <p class="text-xs text-[var(--color-text-muted)]">{{ getTypeLabel(blogger.type) }}</p>
              </div>
              <span
                v-if="blogger.is_active"
                class="w-2 h-2 rounded-full bg-green-500"
              ></span>
            </div>
          </div>
          <div v-if="bloggers.length > 6" class="p-4 text-center border-t border-[var(--color-border-light)]">
            <router-link to="/bloggers" class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors">
              查看全部 {{ bloggers.length }} 位博主
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { statsApi, contentApi, bloggerApi } from '../api'
import dayjs from 'dayjs'

const stats = ref<any>({})
const recentContents = ref<any[]>([])
const bloggers = ref<any[]>([])

const fetchStats = async () => {
  try {
    const res: any = await statsApi.getStats()
    if (res.success) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

const fetchRecentContents = async () => {
  try {
    const res: any = await contentApi.getAll({ pageSize: 5 })
    if (res.success) {
      recentContents.value = res.data
    }
  } catch (error) {
    console.error('获取最近内容失败:', error)
  }
}

const fetchBloggers = async () => {
  try {
    const res: any = await bloggerApi.getAll()
    if (res.success) {
      bloggers.value = res.data
    }
  } catch (error) {
    console.error('获取博主列表失败:', error)
  }
}

// sendEmail function removed as it's no longer used

const formatDate = (date: string) => {
  if (!date) return ''
  const d = dayjs(date)
  const now = dayjs()
  if (d.isSame(now, 'day')) {
    return d.format('HH:mm')
  }
  if (d.isSame(now.subtract(1, 'day'), 'day')) {
    return '昨天'
  }
  return d.format('MM-DD')
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

onMounted(() => {
  fetchStats()
  fetchRecentContents()
  fetchBloggers()
})
</script>
