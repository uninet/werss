<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <!-- 页面头部 -->
    <header class="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] sticky top-0 z-40">
      <div class="max-w-4xl mx-auto px-6 py-5">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-[var(--color-text)]">微信公众号订阅指南</h1>
            <p class="text-sm text-[var(--color-text-muted)] mt-1">了解如何订阅微信公众号内容</p>
          </div>
          <router-link to="/bloggers" class="btn-secondary">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回
          </router-link>
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-6 py-8">
      <!-- 支持的订阅方式 -->
      <section class="card mb-8">
        <div class="card-header">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-[var(--color-text)]">支持的订阅方式</h2>
              <p class="text-sm text-[var(--color-text-muted)]">系统会自动尝试以下多种方式抓取内容</p>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-[var(--color-bg-muted)] rounded-xl">
              <div class="flex items-center space-x-2 mb-2">
                <span class="badge-primary">推荐</span>
                <h3 class="font-medium text-[var(--color-text)]">WeWe-RSS</h3>
              </div>
              <p class="text-sm text-[var(--color-text-secondary)]">基于微信读书平台，最稳定可靠的方式</p>
            </div>
            <div class="p-4 bg-[var(--color-bg-muted)] rounded-xl">
              <h3 class="font-medium text-[var(--color-text)] mb-2">Feeddd</h3>
              <p class="text-sm text-[var(--color-text-secondary)]">免费的公众号 RSS 聚合服务</p>
            </div>
            <div class="p-4 bg-[var(--color-bg-muted)] rounded-xl">
              <h3 class="font-medium text-[var(--color-text)] mb-2">Wechat2RSS</h3>
              <p class="text-sm text-[var(--color-text-secondary)]">专业的微信公众号 RSS 转换服务</p>
            </div>
            <div class="p-4 bg-[var(--color-bg-muted)] rounded-xl">
              <h3 class="font-medium text-[var(--color-text)] mb-2">RSSHub</h3>
              <p class="text-sm text-[var(--color-text-secondary)]">多个镜像节点自动切换</p>
            </div>
            <div class="p-4 bg-[var(--color-bg-muted)] rounded-xl">
              <h3 class="font-medium text-[var(--color-text)] mb-2">搜狗微信</h3>
              <p class="text-sm text-[var(--color-text-secondary)]">通过搜狗搜索引擎抓取</p>
            </div>
            <div class="p-4 bg-[var(--color-bg-muted)] rounded-xl">
              <h3 class="font-medium text-[var(--color-text)] mb-2">其他聚合服务</h3>
              <p class="text-sm text-[var(--color-text-secondary)]">Newlearner 等多个小众 RSS 服务</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 如何获取公众号信息 -->
      <section class="card mb-8">
        <div class="card-header">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-[var(--color-text)]">如何获取公众号信息</h2>
              <p class="text-sm text-[var(--color-text-muted)]">以下任一方式都可以</p>
            </div>
          </div>
        </div>
        <div class="card-body space-y-6">
          <!-- 方式1 -->
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-8 h-8 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div class="flex-1">
              <h3 class="font-medium text-[var(--color-text)] mb-2">直接输入公众号名称</h3>
              <p class="text-sm text-[var(--color-text-secondary)] mb-3">最简单的方式，直接输入公众号的名称</p>
              <div class="p-3 bg-[var(--color-bg-muted)] rounded-lg font-mono text-sm text-[var(--color-text-secondary)]">
                示例：阮一峰的网络日志
              </div>
            </div>
          </div>

          <!-- 方式2 -->
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-8 h-8 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div class="flex-1">
              <h3 class="font-medium text-[var(--color-text)] mb-2">复制文章链接</h3>
              <p class="text-sm text-[var(--color-text-secondary)] mb-3">在公众号中打开任意一篇文章，点击右上角菜单，选择"复制链接"</p>
              <div class="p-3 bg-[var(--color-bg-muted)] rounded-lg font-mono text-sm text-[var(--color-text-secondary)] break-all">
                https://mp.weixin.qq.com/s/xxxxx
              </div>
            </div>
          </div>

          <!-- 方式3 -->
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-8 h-8 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center font-bold">3</div>
            <div class="flex-1">
              <h3 class="font-medium text-[var(--color-text)] mb-2">获取 __biz 参数</h3>
              <p class="text-sm text-[var(--color-text-secondary)] mb-3">在电脑浏览器中打开公众号历史文章页面，从 URL 中复制 __biz 参数值</p>
              <div class="p-3 bg-[var(--color-bg-muted)] rounded-lg font-mono text-sm text-[var(--color-text-secondary)] break-all">
                https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=<span class="text-[var(--color-accent)]">MzI0MjY2NDE2Mw==</span>&...
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 常见问题 -->
      <section class="card mb-8">
        <div class="card-header">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-[var(--color-text)]">常见问题</h2>
            </div>
          </div>
        </div>
        <div class="card-body space-y-4">
          <div class="border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
            <h3 class="font-medium text-[var(--color-text)] mb-2">为什么有些公众号抓取不到内容？</h3>
            <p class="text-sm text-[var(--color-text-secondary)]">
              微信公众号对外部抓取有严格的限制。如果某个公众号无法抓取，可能是因为：
            </p>
            <ul class="text-sm text-[var(--color-text-secondary)] mt-2 space-y-1 list-disc list-inside">
              <li>该公众号设置了防爬取机制</li>
              <li>该公众号较新，尚未被 RSS 服务收录</li>
              <li>当前使用的 RSS 服务暂时不可用</li>
            </ul>
          </div>
          <div class="border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
            <h3 class="font-medium text-[var(--color-text)] mb-2">抓取的内容会实时更新吗？</h3>
            <p class="text-sm text-[var(--color-text-secondary)]">
              系统会定期自动检查更新，您也可以手动点击"刷新"按钮立即更新。由于微信公众号的限制，更新可能会有一定延迟。
            </p>
          </div>
          <div class="border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
            <h3 class="font-medium text-[var(--color-text)] mb-2">如何提高抓取成功率？</h3>
            <p class="text-sm text-[var(--color-text-secondary)]">
              建议使用文章链接或 __biz 参数的方式添加，这种方式的识别准确率最高。
            </p>
          </div>
        </div>
      </section>

      <!-- 推荐公众号 -->
      <section class="card">
        <div class="card-header">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-[var(--color-text)]">推荐公众号</h2>
              <p class="text-sm text-[var(--color-text-muted)]">这些公众号通常可以成功抓取</p>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="account in recommendedAccounts" :key="account.name" 
                 class="p-4 bg-[var(--color-bg-muted)] rounded-xl hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer group"
                 @click="copyToClipboard(account.name)">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-[var(--color-text)]">{{ account.name }}</h3>
                  <p class="text-sm text-[var(--color-text-secondary)]">{{ account.description }}</p>
                </div>
                <button class="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-[var(--color-primary)] text-white text-xs transition-opacity">
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const recommendedAccounts = ref([
  { name: '阮一峰的网络日志', description: '科技爱好者周刊' },
  { name: '机器之心', description: 'AI 领域专业媒体' },
  { name: 'InfoQ', description: '企业级技术资讯' },
  { name: '量子位', description: 'AI 与前沿科技' },
  { name: '36氪', description: '科技创业资讯' },
  { name: '虎嗅APP', description: '商业资讯与观点' },
])

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert(`已复制：${text}`)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>
