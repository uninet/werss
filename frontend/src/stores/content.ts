import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { contentApi } from '@/api'

export interface Content {
  id: number
  bloggerId: number
  blogger_id?: number  // 兼容后端返回
  title: string
  content?: string
  url: string
  publishedAt?: string
  published_at: string  // 用于组件显示
  fetchedAt: string
  fetched_at?: string  // 兼容后端返回
  isNotified: boolean
  is_notified: number  // 用于组件显示
  blogger_name: string  // 用于组件显示
  blogger_type: string  // 用于组件显示
  blogger?: {
    id: number
    name: string
    type: string
    avatar?: string
  }
}

export interface ContentFilter {
  bloggerId?: number
  blogger_id?: number  // 兼容后端返回
  type?: string
  search?: string
  startDate?: string
  endDate?: string
}

export const useContentStore = defineStore('content', () => {
  // State
  const contents = ref<Content[]>([])
  const currentContent = ref<Content | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const unreadCount = ref(0)

  // Pagination
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })

  // Getters
  const contentsByBlogger = computed(() => {
    const grouped: Record<number, Content[]> = {}
    contents.value.forEach(content => {
      const id = content.bloggerId || content.blogger_id || 0
      if (!grouped[id]) grouped[id] = []
      grouped[id].push(content)
    })
    return grouped
  })

  const recentContents = computed(() =>
    contents.value.slice(0, 10)
  )

  // Actions
  async function fetchContents(params?: {
    bloggerId?: number
    blogger_id?: number
    page?: number
    pageSize?: number
    limit?: number  // 兼容旧API
    offset?: number  // 兼容旧API
    search?: string
  }) {
    isLoading.value = true
    error.value = null

    try {
      const response = await contentApi.getAll(params)
      if (response.data.success) {
        // 转换数据格式以匹配组件期望
        const data = response.data.data.items || response.data.data
        contents.value = data.map((item: any) => ({
          ...item,
          blogger_name: item.blogger?.name || item.blogger_name || '',
          blogger_type: item.blogger?.type || item.blogger_type || '',
          published_at: item.published_at || item.publishedAt || '',
          is_notified: item.is_notified || (item.isNotified ? 1 : 0)
        }))
        pagination.value.total = response.data.data.total || response.data.data.length
        return response.data
      } else {
        error.value = response.data.message || '获取内容失败'
        return null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '网络错误'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchContentById(id: number) {
    isLoading.value = true
    error.value = null

    try {
      const response = await contentApi.getById(id)
      if (response.data.success) {
        const data = response.data.data
        currentContent.value = {
          ...data,
          blogger_name: data.blogger?.name || data.blogger_name || '',
          blogger_type: data.blogger?.type || data.blogger_type || '',
          published_at: data.published_at || data.publishedAt || '',
          is_notified: data.is_notified || (data.isNotified ? 1 : 0)
        }
        return currentContent.value
      }
      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取内容失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function markAsRead(id: number) {
    try {
      const response = await contentApi.markRead(id)
      if (response.data.success) {
        const index = contents.value.findIndex(c => c.id === id)
        if (index !== -1) {
          contents.value[index].isNotified = true
          contents.value[index].is_notified = 1
        }
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || '标记已读失败'
      return false
    }
  }

  async function markAllAsRead(bloggerId?: number) {
    try {
      const response = await contentApi.markAllRead(bloggerId)
      if (response.data.success) {
        contents.value.forEach(content => {
          if (!bloggerId || content.bloggerId === bloggerId) {
            content.isNotified = true
            content.is_notified = 1
          }
        })
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || '标记全部已读失败'
      return false
    }
  }

  function clearError() {
    error.value = null
  }

  function setCurrentContent(content: Content | null) {
    currentContent.value = content
  }

  function resetPagination() {
    pagination.value.page = 1
    pagination.value.total = 0
  }

  return {
    contents,
    currentContent,
    isLoading,
    error,
    totalCount,
    unreadCount,
    pagination,
    contentsByBlogger,
    recentContents,
    fetchContents,
    fetchContentById,
    markAsRead,
    markAllAsRead,
    clearError,
    setCurrentContent,
    resetPagination
  }
})
