import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'

interface User {
  id: number
  username: string
  email?: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userInitials = computed(() => {
    if (!user.value?.username) return '?'
    return user.value.username.slice(0, 2).toUpperCase()
  })
  const username = computed(() => user.value?.username || '访客')

  // Actions
  async function login(username: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login({ username, password })

      if (response.token) {
        token.value = response.token
        user.value = response.user
        localStorage.setItem('token', response.token)
        return true
      } else {
        error.value = response.message || '登录失败'
        return false
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '网络错误，请稍后重试'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserInfo() {
    if (!token.value) return

    try {
      const response = await authApi.getCurrentUser()
      if (response.user) {
        user.value = response.user
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  }

  async function checkAuth() {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
      await fetchUserInfo()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  function clearError() {
    error.value = null
  }

  // Initialize
  if (token.value) {
    fetchUserInfo()
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    userInitials,
    username,
    login,
    logout,
    fetchUserInfo,
    checkAuth,
    clearError
  }
})
