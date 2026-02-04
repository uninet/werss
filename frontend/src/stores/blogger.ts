import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { bloggerApi } from '@/api'

export type BloggerType = 'wechat' | 'github' | 'rss' | 'zhihu'

export interface Blogger {
  id: number
  name: string
  type: BloggerType
  url: string
  avatar?: string
  description?: string
  isActive: boolean
  is_active?: number  // 兼容后端返回
  lastCheckedAt?: string
  last_checked_at?: string  // 兼容后端返回
  fetchStatus?: string
  fetch_status?: string  // 兼容后端返回
  fetchError?: string
  fetch_error?: string  // 兼容后端返回
  fetchFailCount: number
  fetch_fail_count?: number  // 兼容后端返回
  lastFetchSuccessAt?: string
  last_fetch_success_at?: string  // 兼容后端返回
  createdAt: string
  updatedAt: string
  contentCount?: number
  total_contents?: number  // 兼容后端返回
  unread_contents?: number  // 兼容后端返回
  unread_count?: number  // 兼容后端返回
}

export interface CreateBloggerInput {
  name: string
  type: BloggerType | string
  url: string
  avatar?: string
  description?: string
  is_active?: number
}

export interface CrawlResult {
  message: string
  totalNewContents: number
}

export interface CheckActiveResult {
  active: number
  inactive: number
}

export interface CleanupResult {
  deletedCount: number
  deletedBloggers: Blogger[]
}

export const useBloggerStore = defineStore('blogger', () => {
  // State
  const bloggers = ref<Blogger[]>([])
  const currentBlogger = ref<Blogger | null>(null)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const bloggersByType = computed(() => {
    const grouped: Record<BloggerType, Blogger[]> = {
      wechat: [],
      github: [],
      rss: [],
      zhihu: []
    }
    bloggers.value.forEach(blogger => {
      grouped[blogger.type].push(blogger)
    })
    return grouped
  })

  const activeBloggers = computed(() =>
    bloggers.value.filter(b => b.isActive || b.is_active === 1)
  )

  const inactiveBloggers = computed(() =>
    bloggers.value.filter(b => !b.isActive && b.is_active !== 1)
  )

  const bloggerStats = computed(() => ({
    total: bloggers.value.length,
    active: bloggers.value.filter(b => b.isActive || b.is_active === 1).length,
    byType: {
      wechat: bloggers.value.filter(b => b.type === 'wechat').length,
      github: bloggers.value.filter(b => b.type === 'github').length,
      rss: bloggers.value.filter(b => b.type === 'rss').length,
      zhihu: bloggers.value.filter(b => b.type === 'zhihu').length
    }
  }))

  // Actions
  async function fetchBloggers() {
    isLoading.value = true
    error.value = null

    try {
      const response = await bloggerApi.getAll()
      if (response.data.success) {
        bloggers.value = response.data.data
      } else {
        error.value = response.data.message || '获取博主列表失败'
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '网络错误'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBloggerById(id: number) {
    isLoading.value = true
    error.value = null

    try {
      const response = await bloggerApi.getById(id)
      if (response.data.success) {
        currentBlogger.value = response.data.data
        return response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取博主信息失败'
    } finally {
      isLoading.value = false
    }
  }

  async function addBlogger(data: CreateBloggerInput) {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await bloggerApi.create(data)
      if (response.data.success) {
        bloggers.value.unshift(response.data.data)
        return true
      } else {
        error.value = response.data.message || '创建失败'
        return false
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '网络错误'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  async function createBlogger(data: CreateBloggerInput) {
    return addBlogger(data)
  }

  async function updateBlogger(id: number, data: Partial<CreateBloggerInput>) {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await bloggerApi.update(id, data)
      if (response.data.success) {
        const index = bloggers.value.findIndex(b => b.id === id)
        if (index !== -1) {
          bloggers.value[index] = { ...bloggers.value[index], ...response.data.data }
        }
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新失败'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  async function removeBlogger(id: number) {
    return deleteBlogger(id)
  }

  async function deleteBlogger(id: number) {
    try {
      const response = await bloggerApi.delete(id)
      if (response.data.success) {
        bloggers.value = bloggers.value.filter(b => b.id !== id)
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || '删除失败'
      return false
    }
  }

  async function toggleActive(id: number) {
    try {
      const response = await bloggerApi.toggleActive(id)
      if (response.data.success) {
        const index = bloggers.value.findIndex(b => b.id === id)
        if (index !== -1) {
          bloggers.value[index].isActive = response.data.data.isActive
        }
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || '操作失败'
      return false
    }
  }

  async function crawlAll(): Promise<CrawlResult | null> {
    isLoading.value = true
    error.value = null

    try {
      const response = await bloggerApi.crawlAll()
      if (response.data.success) {
        return {
          message: response.data.message,
          totalNewContents: response.data.data?.totalNewContents || 0
        }
      }
      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function crawlSingle(id: number): Promise<{ message: string } | null> {
    try {
      const response = await bloggerApi.crawl(id)
      if (response.data.success) {
        return { message: response.data.message }
      }
      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新失败'
      return null
    }
  }

  async function checkActiveStatus(): Promise<CheckActiveResult | null> {
    isLoading.value = true
    error.value = null

    try {
      const response = await bloggerApi.checkActive()
      if (response.data.success) {
        return {
          active: response.data.data?.active || 0,
          inactive: response.data.data?.inactive || 0
        }
      }
      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || '检测失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function cleanupInactive(): Promise<CleanupResult | null> {
    isLoading.value = true
    error.value = null

    try {
      const response = await bloggerApi.cleanupInactive()
      if (response.data.success) {
        return {
          deletedCount: response.data.data?.deletedCount || 0,
          deletedBloggers: response.data.data?.deletedBloggers || []
        }
      }
      return null
    } catch (err: any) {
      error.value = err.response?.data?.message || '清理失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setCurrentBlogger(blogger: Blogger | null) {
    currentBlogger.value = blogger
  }

  return {
    bloggers,
    currentBlogger,
    isLoading,
    isSubmitting,
    error,
    bloggersByType,
    activeBloggers,
    inactiveBloggers,
    bloggerStats,
    fetchBloggers,
    fetchBloggerById,
    addBlogger,
    createBlogger,
    updateBlogger,
    removeBlogger,
    deleteBlogger,
    toggleActive,
    crawlAll,
    crawlSingle,
    checkActiveStatus,
    cleanupInactive,
    clearError,
    setCurrentBlogger
  }
})
