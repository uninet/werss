<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <!-- 页面头部 -->
    <header class="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] sticky top-0 z-40">
      <div class="max-w-5xl mx-auto px-6 py-5">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-[var(--color-text)]">设置</h1>
            <p class="text-sm text-[var(--color-text-muted)] mt-1">管理您的账户和系统配置</p>
          </div>
          <div class="flex items-center space-x-3">
            <span class="badge-primary">v2.0.0</span>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧：账户设置 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 账户安全 -->
          <section class="card">
            <div class="card-header">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg font-semibold text-[var(--color-text)]">账户安全</h2>
                  <p class="text-sm text-[var(--color-text-muted)]">修改密码以保护账户安全</p>
                </div>
              </div>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleChangePassword" class="space-y-5">
                <div>
                  <label class="label">当前密码</label>
                  <input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    class="input"
                    required
                  />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="label">新密码</label>
                    <input
                      v-model="passwordForm.newPassword"
                      type="password"
                      placeholder="至少 6 个字符"
                      class="input"
                      required
                      minlength="6"
                    />
                  </div>
                  <div>
                    <label class="label">确认新密码</label>
                    <input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      placeholder="再次输入新密码"
                      class="input"
                      required
                    />
                  </div>
                </div>
                <div class="flex items-center justify-between pt-2">
                  <p class="text-xs text-[var(--color-text-muted)]">
                    建议使用包含字母、数字和符号的强密码
                  </p>
                  <button
                    type="submit"
                    :disabled="changingPassword"
                    class="btn-primary"
                  >
                    <svg v-if="changingPassword" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ changingPassword ? '修改中...' : '修改密码' }}
                  </button>
                </div>
              </form>

              <!-- 密码修改结果提示 -->
              <div v-if="passwordMessage" :class="[
                'mt-4 p-4 rounded-xl text-sm',
                passwordSuccess ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
              ]">
                {{ passwordMessage }}
              </div>
            </div>
          </section>

          <!-- 邮件配置 -->
          <section class="card">
            <div class="card-header">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg font-semibold text-[var(--color-text)]">邮件推送</h2>
                  <p class="text-sm text-[var(--color-text-muted)]">配置每日文章推送邮箱</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="badge-primary">已启用</span>
              </div>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveEmailConfig" class="space-y-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="label">SMTP 服务器</label>
                    <input v-model="emailConfig.smtp_host" type="text" class="input" placeholder="smtp.126.com" />
                  </div>
                  <div>
                    <label class="label">SMTP 端口</label>
                    <input v-model="emailConfig.smtp_port" type="text" class="input" placeholder="465" />
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="label">发件邮箱</label>
                    <input v-model="emailConfig.smtp_user" type="email" class="input" placeholder="your_email@126.com" />
                  </div>
                  <div>
                    <label class="label">授权码/密码</label>
                    <input v-model="emailConfig.smtp_pass" type="password" class="input" placeholder="邮箱授权码" />
                  </div>
                </div>

                <div>
                  <label class="label">接收邮箱</label>
                  <input v-model="emailConfig.email_to" type="email" class="input" placeholder="recipient@example.com" />
                  <p class="text-xs text-[var(--color-text-muted)] mt-2">每日更新将发送到此邮箱</p>
                </div>

                <div class="flex items-center justify-end space-x-3 pt-2">
                  <button @click.prevent="testEmail" :disabled="testing" class="btn-secondary">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ testing ? '发送中...' : '发送测试邮件' }}
                  </button>
                  <button type="submit" :disabled="saving" class="btn-primary">
                    <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ saving ? '保存中...' : '保存配置' }}
                  </button>
                </div>
              </form>

              <!-- 邮件配置结果提示 -->
              <div v-if="emailMessage" :class="[
                'mt-4 p-4 rounded-xl text-sm',
                emailSuccess ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
              ]">
                {{ emailMessage }}
              </div>
            </div>
          </section>

          <!-- 调度器设置 -->
          <section class="card">
            <div class="card-header">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg font-semibold text-[var(--color-text)]">定时任务</h2>
                  <p class="text-sm text-[var(--color-text-muted)]">自动抓取和推送设置</p>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="p-4 bg-[var(--color-bg-muted)] rounded-xl">
                  <p class="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">运行状态</p>
                  <div class="flex items-center space-x-2">
                    <span :class="[
                      'w-2.5 h-2.5 rounded-full',
                      schedulerStatus.running ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    ]"></span>
                    <span class="font-medium text-[var(--color-text)]">{{ schedulerStatus.running ? '运行中' : '已停止' }}</span>
                  </div>
                </div>
                <div class="p-4 bg-[var(--color-bg-muted)] rounded-xl">
                  <p class="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">定时规则</p>
                  <p class="font-mono text-sm text-[var(--color-text)]">{{ schedulerStatus.schedule || '0 9 * * *' }}</p>
                  <p class="text-xs text-[var(--color-text-muted)] mt-1">每天上午 9:00</p>
                </div>
                <div class="p-4 bg-[var(--color-bg-muted)] rounded-xl">
                  <p class="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">下次运行</p>
                  <p class="text-sm text-[var(--color-text)]">{{ schedulerStatus.nextRun ? formatDate(schedulerStatus.nextRun) : '未知' }}</p>
                </div>
              </div>

              <div class="flex items-center justify-end space-x-3">
                <button @click="fetchStatus" class="btn-ghost text-sm">
                  <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  刷新状态
                </button>
                <button @click="triggerCrawl" :disabled="crawling" class="btn-secondary text-sm">
                  <svg v-if="crawling" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ crawling ? '抓取中...' : '立即抓取' }}
                </button>
              </div>
            </div>
          </section>
        </div>

        <!-- 右侧：系统信息 -->
        <div class="space-y-6">
          <!-- 用户信息卡片 -->
          <section class="card">
            <div class="card-body text-center">
              <div class="w-20 h-20 mx-auto bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                {{ userInitials }}
              </div>
              <h3 class="text-lg font-semibold text-[var(--color-text)]">{{ username }}</h3>
              <p class="text-sm text-[var(--color-text-muted)]">普通用户</p>
              <div class="mt-4 pt-4 border-t border-[var(--color-border-light)]">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-[var(--color-text-muted)]">注册时间</span>
                  <span class="text-[var(--color-text)]">{{ registerDate }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 系统信息 -->
          <section class="card">
            <div class="card-header">
              <h3 class="font-semibold text-[var(--color-text)]">系统信息</h3>
            </div>
            <div class="card-body space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-[var(--color-text-muted)]">版本</span>
                <span class="font-medium text-[var(--color-text)]">v2.0.0</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-[var(--color-text-muted)]">数据库</span>
                <span class="font-medium text-[var(--color-text)]">SQLite</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-[var(--color-text-muted)]">后端</span>
                <span class="font-medium text-[var(--color-text)]">Node.js + Express</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-[var(--color-text-muted)]">前端</span>
                <span class="font-medium text-[var(--color-text)]">Vue 3 + Tailwind</span>
              </div>
            </div>
          </section>

          <!-- 快速链接 -->
          <section class="card">
            <div class="card-header">
              <h3 class="font-semibold text-[var(--color-text)]">快速链接</h3>
            </div>
            <div class="card-body space-y-2">
              <router-link to="/contents" class="flex items-center space-x-3 p-3 rounded-xl hover:bg-[var(--color-bg-muted)] transition-colors">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-[var(--color-text)]">内容列表</span>
              </router-link>
              <router-link to="/bloggers" class="flex items-center space-x-3 p-3 rounded-xl hover:bg-[var(--color-bg-muted)] transition-colors">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-[var(--color-text)]">博主管理</span>
              </router-link>
              <router-link to="/rss-market" class="flex items-center space-x-3 p-3 rounded-xl hover:bg-[var(--color-bg-muted)] transition-colors">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 11a9 9 0 0 1 9 9" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4a16 16 0 0 1 16 16" />
                    <circle cx="5" cy="19" r="1" fill="currentColor" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-[var(--color-text)]">RSS 市场</span>
              </router-link>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { schedulerApi, configApi } from '../api'
import { changePassword } from '../api/auth'
import dayjs from 'dayjs'

// 用户信息
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

const userInitials = computed(() => {
  return username.value.charAt(0).toUpperCase()
})

const registerDate = computed(() => {
  return dayjs().format('YYYY-MM-DD')
})

// 调度器状态
const schedulerStatus = ref<any>({})
const testing = ref(false)
const saving = ref(false)
const crawling = ref(false)

// 密码修改
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const changingPassword = ref(false)
const passwordMessage = ref('')
const passwordSuccess = ref(false)

// 邮件配置
const emailConfig = ref({
  smtp_host: '',
  smtp_port: '465',
  smtp_user: '',
  smtp_pass: '',
  email_to: ''
})
const emailMessage = ref('')
const emailSuccess = ref(false)

// 获取调度器状态
const fetchStatus = async () => {
  try {
    const res: any = await schedulerApi.getStatus()
    if (res.success) {
      schedulerStatus.value = res.data
    }
  } catch (error) {
    console.error('获取状态失败:', error)
  }
}

// 获取邮件配置
const fetchConfig = async () => {
  try {
    const res: any = await configApi.get()
    if (res.success) {
      emailConfig.value = {
        ...emailConfig.value,
        ...res.data
      }
    }
  } catch (error) {
    console.error('获取配置失败:', error)
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = '两次输入的新密码不一致'
    passwordSuccess.value = false
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordMessage.value = '新密码长度至少为 6 个字符'
    passwordSuccess.value = false
    return
  }

  changingPassword.value = true
  passwordMessage.value = ''

  try {
    await changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    passwordMessage.value = '密码修改成功'
    passwordSuccess.value = true
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error: any) {
    passwordMessage.value = error.response?.data?.error || error.message || '密码修改失败'
    passwordSuccess.value = false
  } finally {
    changingPassword.value = false
  }
}

// 测试邮件
const testEmail = async () => {
  testing.value = true
  emailMessage.value = ''
  try {
    const res: any = await schedulerApi.testEmail()
    emailMessage.value = res.message || '测试邮件发送成功'
    emailSuccess.value = true
  } catch (error: any) {
    emailMessage.value = error.message || '测试邮件发送失败'
    emailSuccess.value = false
  } finally {
    testing.value = false
  }
}

// 保存邮件配置
const saveEmailConfig = async () => {
  saving.value = true
  emailMessage.value = ''
  try {
    const res: any = await configApi.save(emailConfig.value)
    if (res.success) {
      emailMessage.value = '邮件配置已保存'
      emailSuccess.value = true
    } else {
      emailMessage.value = res.message || '保存失败'
      emailSuccess.value = false
    }
  } catch (error: any) {
    emailMessage.value = error.message || '保存失败'
    emailSuccess.value = false
  } finally {
    saving.value = false
  }
}

// 触发抓取
const triggerCrawl = async () => {
  crawling.value = true
  try {
    await schedulerApi.crawl()
    alert('抓取任务已启动')
  } catch (error: any) {
    alert(error.message || '抓取失败')
  } finally {
    crawling.value = false
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  fetchStatus()
  fetchConfig()
})
</script>
