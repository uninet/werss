<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">👥 博主管理</h1>
        <p class="text-gray-500 mt-1">管理您关注的 AI 博主</p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="cleanupInactive"
          :disabled="cleaningInactive"
          class="btn-danger flex items-center space-x-2"
          title="一键清除所有非活跃博主"
        >
          <svg
            :class="{ 'animate-spin': cleaningInactive }"
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          <span>{{ cleaningInactive ? '清理中...' : '一键清除无活跃' }}</span>
        </button>
        <button
          @click="checkActiveStatus"
          :disabled="checkingActive"
          class="btn-secondary flex items-center space-x-2"
          title="检测所有博主的活跃状态"
        >
          <svg
            :class="{ 'animate-spin': checkingActive }"
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>{{ checkingActive ? '检测中...' : '更新活跃状态' }}</span>
        </button>
        <button @click="showAddModal = true" class="btn-primary flex items-center space-x-2">
          <span>➕</span>
          <span>添加博主</span>
        </button>
      </div>
    </div>

    <!-- 博主列表 -->
    <div class="card">
      <div v-if="bloggerStore.isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-500 mt-4">加载中...</p>
      </div>

      <div v-else-if="bloggerStore.bloggers.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">还没有添加博主</h3>
        <p class="text-gray-500 mb-4">添加您关注的 AI 博主，开始监测更新</p>
        <button @click="showAddModal = true" class="btn-primary">添加第一个博主</button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">博主</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">内容数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">未读</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后检查</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="blogger in bloggerStore.bloggers" :key="blogger.id" 
                :class="[
                  'hover:bg-gray-50',
                  !(blogger.is_active || blogger.is_active === 1) || blogger.fetch_status === 'failed' ? 'bg-gray-50/50' : ''
                ]">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-lg">{{ 
                      blogger.type === 'github' ? '👨‍💻' : 
                      blogger.type === 'wechat' ? '📱' : 
                      blogger.type === 'rss' ? '📡' : 
                      '📚' 
                    }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ blogger.name }}</div>
                    <div class="text-sm text-gray-500 truncate max-w-xs">{{ blogger.url }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  blogger.type === 'github' ? 'bg-gray-100 text-gray-800' :
                  blogger.type === 'wechat' ? 'bg-green-100 text-green-800' :
                  blogger.type === 'rss' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                ]">
                  {{ blogger.type === 'github' ? 'GitHub' : blogger.type === 'wechat' ? '微信公众号' : blogger.type === 'rss' ? 'RSS' : '知乎' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <span :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    (blogger.is_active || blogger.is_active === 1) && blogger.fetch_status !== 'failed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ (blogger.is_active || blogger.is_active === 1) && blogger.fetch_status !== 'failed' ? '活跃' : '非活跃' }}
                  </span>
                  <!-- 抓取状态标记 -->
                  <span v-if="blogger.fetch_status === 'failed'" 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 cursor-help"
                        :title="blogger.fetch_error || '获取失败'">
                    <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    失败{{ (blogger.fetch_fail_count || 0) > 1 ? `(${blogger.fetch_fail_count})` : '' }}
                  </span>
                  <span v-else-if="blogger.fetch_status === 'success'" 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                        title="获取成功">
                    <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    正常
                  </span>
                  <span v-else 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600"
                        title="待检查">
                    <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    待检查
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ blogger.total_contents || blogger.contentCount || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="(blogger.unread_contents || blogger.unread_count || 0) > 0" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {{ blogger.unread_contents || blogger.unread_count || 0 }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ blogger.last_checked_at || blogger.lastCheckedAt ? formatDate(blogger.last_checked_at || blogger.lastCheckedAt!) : '从未' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="editBlogger(blogger)" class="text-primary-600 hover:text-primary-900 mr-3">编辑</button>
                <button @click="deleteBlogger(blogger.id)" class="text-red-600 hover:text-red-900">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="bloggerStore.error" class="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
      <div class="font-medium">错误</div>
      <div>{{ bloggerStore.error }}</div>
    </div>

    <!-- 添加/编辑模态框 -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">
            {{ showEditModal ? '✏️ 编辑博主' : '➕ 添加博主' }}
          </h3>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="label">博主名称 *</label>
              <input v-model="form.name" type="text" class="input" placeholder="例如：阮一峰" required />
            </div>

            <div>
              <label class="label">类型 *</label>
              <select v-model="form.type" class="input" required>
                <option value="">请选择</option>
                <option value="github">GitHub</option>
                <option value="wechat">微信公众号</option>
                <option value="rss">RSS 订阅</option>
                <option value="zhihu">知乎</option>
              </select>
            </div>

            <div>
              <label class="label">URL/ID *</label>
              <input v-model="form.url" type="text" class="input"
                :placeholder="form.type === 'github' ? 'https://github.com/username' :
                             form.type === 'wechat' ? '公众号ID 或 文章链接' :
                             form.type === 'rss' ? 'https://example.com/feed.xml' :
                             '知乎用户ID'"
                required />
              <p class="text-xs text-gray-500 mt-1">
                {{ form.type === 'github' ? 'GitHub 用户主页链接' :
                   form.type === 'wechat' ? '支持多种格式：公众号ID、文章链接、__biz参数' :
                   form.type === 'rss' ? 'RSS Feed URL' :
                   '知乎用户 ID（如：excited-vczh）' }}
              </p>
              <!-- RSS 市场入口 -->
              <div v-if="form.type === 'rss'" class="mt-2">
                <router-link to="/rss-market" class="inline-flex items-center text-sm text-primary-600 hover:text-primary-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                    <path d="M4 11a9 9 0 0 1 9 9"/>
                    <path d="M4 4a16 16 0 0 1 16 16"/>
                    <circle cx="5" cy="19" r="1"/>
                  </svg>
                  去 RSS 市场发现更多优质订阅源 →
                </router-link>
              </div>
              <!-- 微信公众号帮助 -->
              <div v-if="form.type === 'wechat'" class="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p class="text-xs text-blue-800 font-medium mb-2">💡 如何获取公众号信息：</p>
                <ul class="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li><strong>方式1：</strong>直接输入公众号名称（如："阮一峰的网络日志"）</li>
                  <li><strong>方式2：</strong>复制任意一篇文章链接粘贴到这里</li>
                  <li><strong>方式3：</strong>从公众号主页复制链接中的 __biz 参数</li>
                </ul>
                <div class="mt-3 flex items-center justify-between">
                  <p class="text-xs text-blue-600 italic">系统会自动尝试多种方式抓取内容</p>
                  <router-link to="/wechat-help" target="_blank" class="text-xs text-blue-700 hover:text-blue-900 underline">
                    查看详细指南 →
                  </router-link>
                </div>
              </div>
            </div>

            <div>
              <label class="label">描述</label>
              <textarea v-model="form.description" class="input" rows="2" placeholder="博主简介（可选）"></textarea>
            </div>

            <div v-if="showEditModal">
              <label class="label">状态</label>
              <select v-model="form.is_active" class="input">
                <option :value="1">活跃</option>
                <option :value="0">暂停</option>
              </select>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" @click="closeModal" class="btn-secondary">取消</button>
              <button type="submit" :disabled="submitting" class="btn-primary">
                {{ submitting ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBloggerStore, type Blogger } from '../stores'
import dayjs from 'dayjs'

const route = useRoute()
const bloggerStore = useBloggerStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const checkingActive = ref(false)
const cleaningInactive = ref(false)

const form = ref({
  id: null as number | null,
  name: '',
  type: '' as 'github' | 'wechat' | 'rss' | 'zhihu' | '',
  url: '',
  description: '',
  is_active: 1
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (showEditModal.value && form.value.id) {
      await bloggerStore.updateBlogger(form.value.id, form.value)
    } else {
      await bloggerStore.addBlogger(form.value)
    }
    closeModal()
  } catch (error: any) {
    // 错误已在 store 中处理
  } finally {
    submitting.value = false
  }
}

const editBlogger = (blogger: Blogger) => {
  form.value = { 
    id: blogger.id,
    name: blogger.name,
    type: blogger.type,
    url: blogger.url,
    description: blogger.description || '',
    is_active: blogger.is_active || (blogger.isActive ? 1 : 0)
  }
  showEditModal.value = true
}

const deleteBlogger = async (id: number) => {
  if (!confirm('确定要删除这个博主吗？相关的所有内容也会被删除。')) return
  await bloggerStore.removeBlogger(id)
}

// 检测博主活跃状态
const checkActiveStatus = async () => {
  if (!confirm('确定要检测所有博主的活跃状态吗？这可能需要一些时间。')) return
  
  checkingActive.value = true
  try {
    const result = await bloggerStore.checkActiveStatus()
    if (result) {
      alert(`检测完成！${result.active} 个活跃，${result.inactive} 个非活跃`)
    }
  } catch (error: any) {
    alert(error.message || '检测失败')
  } finally {
    checkingActive.value = false
  }
}

// 一键清除非活跃博主
const cleanupInactive = async () => {
  const inactiveCount = bloggerStore.inactiveBloggers.length
  
  if (inactiveCount === 0) {
    alert('当前没有非活跃博主需要清理')
    return
  }
  
  if (!confirm(`确定要清理 ${inactiveCount} 个非活跃博主吗？此操作不可恢复！`)) return
  
  cleaningInactive.value = true
  try {
    const result = await bloggerStore.cleanupInactive()
    if (result) {
      const deletedNames = result.deletedBloggers.map((b: Blogger) => b.name).join('、')
      alert(`清理完成！共删除 ${result.deletedCount} 个非活跃博主：\n${deletedNames}`)
    }
  } catch (error: any) {
    alert(error.message || '清理失败')
  } finally {
    cleaningInactive.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  form.value = {
    id: null,
    name: '',
    type: '',
    url: '',
    description: '',
    is_active: 1
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('MM-DD HH:mm')
}

onMounted(() => {
  bloggerStore.fetchBloggers()
  handleQueryParams()
})

// 处理从 RSS 市场传递过来的参数
const handleQueryParams = () => {
  const { action, type, name, url } = route.query
  if (action === 'add') {
    if (type === 'wechat') {
      form.value.type = 'wechat'
    } else if (type === 'github') {
      form.value.type = 'github'
    } else if (type === 'zhihu') {
      form.value.type = 'zhihu'
    } else if (type === 'rss') {
      form.value.type = 'rss'
    }
    if (name) form.value.name = name as string
    if (url) form.value.url = url as string
    showAddModal.value = true
  }
}
</script>
