<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl shadow-lg shadow-[var(--color-accent)]/20 mb-4">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-[var(--color-text)]">RSS Flow</h1>
        <p class="text-sm text-[var(--color-text-muted)] mt-1">优雅阅读，从这里开始</p>
      </div>

      <!-- API状态测试 -->
      <div v-if="apiStatus !== null" class="mb-4 p-3 rounded-xl text-sm" :class="apiStatus ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-yellow-50 border border-yellow-200 text-yellow-600'">
        <div class="flex items-center">
          <svg v-if="apiStatus" class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ apiStatus ? 'API连接正常' : 'API连接测试中...' }}
        </div>
      </div>

      <!-- 登录/注册卡片 -->
      <div class="card p-8">
        <!-- 标签切换 -->
        <div class="flex space-x-1 bg-[var(--color-bg-muted)] rounded-xl p-1 mb-6">
          <button
            @click="switchMode(true)"
            :class="isLogin ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'"
            class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          >
            登录
          </button>
          <button
            @click="switchMode(false)"
            :class="!isLogin ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'"
            class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          >
            注册
          </button>
        </div>

        <!-- 登录表单 -->
        <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="label">用户名</label>
            <input
              v-model="loginForm.username"
              type="text"
              placeholder="请输入用户名"
              class="input"
              required
              :disabled="authStore.isLoading"
            />
          </div>
          <div>
            <label class="label">密码</label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              class="input"
              required
              :disabled="authStore.isLoading"
            />
          </div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="btn-primary w-full"
          >
            <svg v-if="authStore.isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ authStore.isLoading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label class="label">用户名</label>
            <input
              v-model="registerForm.username"
              type="text"
              placeholder="3-20 个字符"
              class="input"
              required
              minlength="3"
              maxlength="20"
              :disabled="authStore.isLoading"
            />
          </div>
          <div>
            <label class="label">密码</label>
            <input
              v-model="registerForm.password"
              type="password"
              placeholder="至少 6 个字符"
              class="input"
              required
              minlength="6"
              :disabled="authStore.isLoading"
            />
          </div>
          <div>
            <label class="label">确认密码</label>
            <input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="再次输入密码"
              class="input"
              required
              :disabled="authStore.isLoading"
            />
          </div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="btn-accent w-full"
          >
            <svg v-if="authStore.isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ authStore.isLoading ? '注册中...' : '注册' }}
          </button>
        </form>

        <!-- 错误提示 -->
        <div v-if="authStore.error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <div class="font-medium">错误</div>
          <div>{{ authStore.error }}</div>
        </div>
      </div>

      <!-- 底部信息 -->
      <p class="text-center text-xs text-[var(--color-text-muted)] mt-6">
        登录即表示您同意我们的服务条款和隐私政策
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores'
import { authApi } from '../api'

const router = useRouter()
const authStore = useAuthStore()
const isLogin = ref(true)
const apiStatus = ref<boolean | null>(null)

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 测试API连接
onMounted(async () => {
  try {
    await authApi.getUserInfo()
    apiStatus.value = true
  } catch (e) {
    apiStatus.value = false
  }
})

const switchMode = (login: boolean) => {
  isLogin.value = login
  authStore.clearError()
}

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    return
  }

  const success = await authStore.login(loginForm.username, loginForm.password)
  if (success) {
    router.push('/')
  }
}

const handleRegister = async () => {
  if (!registerForm.username || !registerForm.password) {
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    // 可以在这里设置错误信息
    return
  }

  try {
    const response = await authApi.register({
      username: registerForm.username,
      password: registerForm.password
    })

    if (response.data.success) {
      // 注册成功后自动登录
      const loginSuccess = await authStore.login(registerForm.username, registerForm.password)
      if (loginSuccess) {
        router.push('/')
      }
    }
  } catch (err: any) {
    console.error('注册失败:', err)
  }
}
</script>
