import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { rssMarketApi } from '@/api'

export interface RssMarketItem {
  id: number
  name: string
  url: string
  description?: string
  category: string
  icon?: string
  language: string
  isFeatured: boolean
  subscriberCount: number
  createdAt: string
}

export const useRssMarketStore = defineStore('rssMarket', () => {
  // State
  const items = ref<RssMarketItem[]>([])
  const featuredItems = ref<RssMarketItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const categories = computed(() => {
    const cats = new Set(items.value.map(item => item.category))
    return Array.from(cats)
  })

  const itemsByCategory = computed(() => {
    const grouped: Record<string, RssMarketItem[]> = {}
    items.value.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(item)
    })
    return grouped
  })

  const totalCount = computed(() => items.value.length)

  // Actions
  async function fetchItems() {
    isLoading.value = true
    error.value = null

    try {
      const response = await rssMarketApi.getAll()
      if (response.data.success) {
        items.value = response.data.data
      } else {
        error.value = response.data.message || '获取RSS市场数据失败'
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '网络错误'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchFeatured() {
    try {
      const response = await rssMarketApi.getFeatured()
      if (response.data.success) {
        featuredItems.value = response.data.data
      }
    } catch (err) {
      console.error('获取精选RSS失败:', err)
    }
  }

  async function searchItems(query: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await rssMarketApi.search(query)
      if (response.data.success) {
        items.value = response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '搜索失败'
    } finally {
      isLoading.value = false
    }
  }

  async function subscribe(id: number) {
    try {
      const response = await rssMarketApi.subscribe(id)
      if (response.data.success) {
        const index = items.value.findIndex(item => item.id === id)
        if (index !== -1) {
          items.value[index].subscriberCount++
        }
        return true
      }
      return false
    } catch (err) {
      return false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    items,
    featuredItems,
    isLoading,
    error,
    categories,
    itemsByCategory,
    totalCount,
    fetchItems,
    fetchFeatured,
    searchItems,
    subscribe,
    clearError
  }
})
