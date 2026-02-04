import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证 token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; success?: boolean }>) => {
    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }

    return Promise.reject(error)
  }
)

// 博主相关接口
export const bloggerApi = {
  getAll: () => api.get('/bloggers'),
  getById: (id: number) => api.get(`/bloggers/${id}`),
  create: (data: any) => api.post('/bloggers', data),
  update: (id: number, data: any) => api.put(`/bloggers/${id}`, data),
  delete: (id: number) => api.delete(`/bloggers/${id}`),
  toggleActive: (id: number) => api.patch(`/bloggers/${id}/toggle-active`),
  crawl: (id: number) => api.post(`/bloggers/${id}/crawl`),
  crawlAll: () => api.post('/bloggers/crawl-all'),
  checkActive: () => api.post('/bloggers/check-active'),
  cleanupInactive: () => api.post('/bloggers/cleanup-inactive')
}

// 内容相关接口
export const contentApi = {
  getAll: (params?: { bloggerId?: number; blogger_id?: number; page?: number; pageSize?: number; limit?: number; offset?: number; search?: string }) =>
    api.get('/contents', { params }),
  getById: (id: number) => api.get(`/contents/${id}`),
  getByBloggerId: (bloggerId: number) => api.get(`/contents/blogger/${bloggerId}`),
  getStats: () => api.get('/contents/stats'),
  markAsRead: (id: number) => api.post(`/contents/${id}/mark-read`),
  markRead: (id: number) => api.post(`/contents/${id}/mark-read`), // 别名
  markAllRead: (bloggerId?: number) => api.post('/contents/mark-all-read', { bloggerId }),
  markReadBatch: (ids: number[]) => api.post('/contents/mark-read-batch', { ids }),
  delete: (id: number) => api.delete(`/contents/${id}`)
}

// 调度器相关接口
export const schedulerApi = {
  getStatus: () => api.get('/scheduler/status'),
  crawl: () => api.post('/scheduler/crawl'),
  sendEmail: () => api.post('/scheduler/send-email'),
  testEmail: () => api.post('/scheduler/test-email')
}

// 配置相关接口
export const configApi = {
  get: () => api.get('/config'),
  save: (data: any) => api.post('/config', data)
}

// 统计相关接口
export const statsApi = {
  getStats: () => api.get('/stats'),
  getDailySummary: (date?: string) => api.get('/stats/daily-summary', { params: { date } })
}

// RSS 市场相关接口
export const rssMarketApi = {
  getAll: (params?: { category?: string; search?: string; featured?: boolean }) =>
    api.get('/rss-market', { params }),
  getFeatured: () => api.get('/rss-market/featured'),
  getById: (id: number) => api.get(`/rss-market/${id}`),
  search: (query: string) => api.get('/rss-market/search', { params: { q: query } }),
  subscribe: (id: number) => api.post(`/rss-market/${id}/subscribe`),
  subscribeBatch: (ids: number[]) => api.post('/rss-market/subscribe-batch', { ids }),
  getSubscriptionStatus: (id: number) => api.get(`/rss-market/${id}/subscription-status`)
}

// 认证相关接口
export const authApi = {
  register: (data: { username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  getUserInfo: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data)
}

export default api
